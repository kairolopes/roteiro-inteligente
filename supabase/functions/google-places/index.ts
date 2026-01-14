import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlaceSearchParams {
  query: string;
  location?: string;
  type?: string;
  maxResults?: number;
}

interface PlaceDetailsParams {
  placeId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
    
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error("GOOGLE_PLACES_API_KEY is not configured");
    }

    const { action, params } = await req.json();

    if (action === "searchPlaces") {
      const { query, location, type, maxResults = 5 } = params as PlaceSearchParams;
      
      // Build the Places API Text Search URL
      let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}&language=pt-BR`;
      
      if (location) {
        url += `&location=${encodeURIComponent(location)}&radius=10000`;
      }
      
      if (type) {
        url += `&type=${encodeURIComponent(type)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("Google Places API error:", data.status, data.error_message);
        return new Response(
          JSON.stringify({ error: `Google Places API error: ${data.status}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Format the results
      const places = (data.results || []).slice(0, maxResults).map((place: any) => ({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        priceLevel: place.price_level,
        types: place.types,
        location: place.geometry?.location,
        photoReference: place.photos?.[0]?.photo_reference,
        openNow: place.opening_hours?.open_now,
      }));

      return new Response(
        JSON.stringify({ places }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === "getPlaceDetails") {
      const { placeId } = params as PlaceDetailsParams;
      
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_API_KEY}&language=pt-BR&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,price_level,opening_hours,photos,reviews,geometry,types,url`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK") {
        console.error("Google Places API error:", data.status, data.error_message);
        return new Response(
          JSON.stringify({ error: `Google Places API error: ${data.status}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const place = data.result;
      const placeDetails = {
        placeId: placeId,
        name: place.name,
        address: place.formatted_address,
        phone: place.formatted_phone_number,
        website: place.website,
        googleMapsUrl: place.url,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        priceLevel: place.price_level,
        location: place.geometry?.location,
        types: place.types,
        openingHours: place.opening_hours?.weekday_text,
        isOpenNow: place.opening_hours?.open_now,
        photos: (place.photos || []).slice(0, 5).map((photo: any) => ({
          reference: photo.photo_reference,
          width: photo.width,
          height: photo.height,
        })),
        reviews: (place.reviews || []).slice(0, 3).map((review: any) => ({
          author: review.author_name,
          rating: review.rating,
          text: review.text,
          time: review.relative_time_description,
        })),
      };

      return new Response(
        JSON.stringify({ place: placeDetails }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === "getPhotoUrl") {
      const { photoReference, maxWidth = 400 } = params;
      
      const googlePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;

      try {
        // Fetch to get the final redirected URL (hides API key from frontend)
        const response = await fetch(googlePhotoUrl, {
          redirect: "follow",
        });
        
        // The final URL after redirect is the actual CDN image URL
        const finalUrl = response.url;
        
        return new Response(
          JSON.stringify({ photoUrl: finalUrl }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Error fetching photo URL:", error);
        return new Response(
          JSON.stringify({ error: "Failed to resolve photo URL" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

    } else if (action === "searchNearby") {
      const { location, type, radius = 5000, maxResults = 10 } = params;
      
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${GOOGLE_PLACES_API_KEY}&language=pt-BR`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("Google Places API error:", data.status, data.error_message);
        return new Response(
          JSON.stringify({ error: `Google Places API error: ${data.status}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const places = (data.results || []).slice(0, maxResults).map((place: any) => ({
        placeId: place.place_id,
        name: place.name,
        address: place.vicinity,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        priceLevel: place.price_level,
        types: place.types,
        location: place.geometry?.location,
        photoReference: place.photos?.[0]?.photo_reference,
        openNow: place.opening_hours?.open_now,
      }));

      return new Response(
        JSON.stringify({ places }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use: searchPlaces, getPlaceDetails, getPhotoUrl, or searchNearby" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("google-places error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
