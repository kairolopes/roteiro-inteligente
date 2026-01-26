import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Normalize query for cache lookup (lowercase, remove accents)
function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

// Resolve photo URL by following redirects
async function resolvePhotoUrl(photoName: string, apiKey: string): Promise<string | null> {
  try {
    const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&maxWidthPx=400&key=${apiKey}`;
    
    const response = await fetch(photoUrl, {
      method: "GET",
      redirect: "follow",
    });
    
    if (response.ok) {
      return response.url; // Final URL after redirects
    }
    return null;
  } catch (error) {
    console.error("Error resolving photo URL:", error);
    return null;
  }
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { query, city } = body;

    if (!query) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Query is required" }),
      };
    }

    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!GOOGLE_PLACES_API_KEY) {
      console.error("GOOGLE_PLACES_API_KEY not configured");
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Google Places API key not configured" }),
      };
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Supabase credentials not configured");
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Database not configured" }),
      };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Build search query
    const searchQuery = city ? `${query} ${city}` : query;
    const normalizedQuery = normalizeQuery(searchQuery);
    
    console.log(`Searching for: "${searchQuery}" (normalized: "${normalizedQuery}")`);

    // Step 1: Check cache first
    const { data: cachedPlace, error: cacheError } = await supabase
      .from("places_cache")
      .select("*")
      .eq("search_query", normalizedQuery)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (cachedPlace && !cacheError) {
      console.log(`Cache hit for: ${normalizedQuery}`);
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: cachedPlace.place_id,
          name: cachedPlace.name,
          address: cachedPlace.address,
          coordinates: [cachedPlace.location_lat, cachedPlace.location_lng],
          rating: cachedPlace.rating,
          userRatingsTotal: cachedPlace.user_ratings_total,
          googleMapsUrl: cachedPlace.google_maps_url,
          photoReference: cachedPlace.photo_reference,
          cached: true,
        }),
      };
    }

    // Step 2: Call Google Places API (Text Search - New)
    console.log(`Cache miss, calling Google Places API for: ${searchQuery}`);
    
    const placesResponse = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.photos",
        },
        body: JSON.stringify({
          textQuery: searchQuery,
          languageCode: "pt-BR",
        }),
      }
    );

    if (!placesResponse.ok) {
      const errorText = await placesResponse.text();
      console.error(`Google Places API error: ${placesResponse.status}`, errorText);
      
      // Return null data but don't fail - allow fallback to AI data
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: null,
          name: null,
          address: null,
          coordinates: null,
          rating: null,
          userRatingsTotal: null,
          googleMapsUrl: null,
          photoReference: null,
          cached: false,
          error: "Place not found",
        }),
      };
    }

    const placesData = await placesResponse.json();
    
    if (!placesData.places || placesData.places.length === 0) {
      console.log(`No places found for: ${searchQuery}`);
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: null,
          name: null,
          address: null,
          coordinates: null,
          rating: null,
          userRatingsTotal: null,
          googleMapsUrl: null,
          photoReference: null,
          cached: false,
          error: "Place not found",
        }),
      };
    }

    const place = placesData.places[0];
    console.log(`Found place: ${place.displayName?.text}`);

    // Resolve photo URL if available
    let photoUrl: string | null = null;
    if (place.photos && place.photos.length > 0) {
      const photoName = place.photos[0].name;
      photoUrl = await resolvePhotoUrl(photoName, GOOGLE_PLACES_API_KEY);
    }

    // Prepare result
    const result = {
      placeId: place.id,
      name: place.displayName?.text || null,
      address: place.formattedAddress || null,
      coordinates: place.location 
        ? [place.location.latitude, place.location.longitude] 
        : null,
      rating: place.rating || null,
      userRatingsTotal: place.userRatingCount || null,
      googleMapsUrl: place.googleMapsUri || null,
      photoReference: photoUrl,
      cached: false,
    };

    // Step 3: Save to cache (30 days expiry)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error: insertError } = await supabase
      .from("places_cache")
      .upsert({
        search_query: normalizedQuery,
        place_id: result.placeId,
        name: result.name,
        address: result.address,
        location_lat: result.coordinates?.[0] || null,
        location_lng: result.coordinates?.[1] || null,
        rating: result.rating,
        user_ratings_total: result.userRatingsTotal,
        google_maps_url: result.googleMapsUrl,
        photo_reference: result.photoReference,
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: "search_query",
      });

    if (insertError) {
      console.error("Error caching place:", insertError);
      // Don't fail the request, just log the error
    } else {
      console.log(`Cached place: ${normalizedQuery}`);
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("google-places error:", error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        placeId: null,
        coordinates: null,
        cached: false,
      }),
    };
  }
};

export { handler };
