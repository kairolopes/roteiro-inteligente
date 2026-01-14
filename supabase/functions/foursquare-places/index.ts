import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// New Foursquare API endpoint (migrated from api.foursquare.com/v3)
const FOURSQUARE_API_URL = "https://places-api.foursquare.com";

interface FoursquarePlace {
  fsq_place_id: string;
  name: string;
  location: {
    address?: string;
    formatted_address?: string;
    locality?: string;
    country?: string;
  };
  categories: Array<{
    id: number;
    name: string;
    short_name: string;
    icon: { prefix: string; suffix: string };
  }>;
  rating?: number;
  tastes?: string[];
  features?: {
    payment?: { credit_cards?: boolean };
    food_and_drink?: Record<string, boolean>;
    services?: Record<string, boolean>;
    amenities?: Record<string, boolean>;
  };
  latitude?: number;
  longitude?: number;
}

interface FoursquareTip {
  id: string;
  text: string;
  created_at: string;
  agree_count?: number;
  disagree_count?: number;
}

async function foursquareRequest(endpoint: string, params?: Record<string, string>) {
  const FOURSQUARE_API_KEY = Deno.env.get("FOURSQUARE_API_KEY");
  
  if (!FOURSQUARE_API_KEY) {
    throw new Error("FOURSQUARE_API_KEY not configured");
  }

  const url = new URL(`${FOURSQUARE_API_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${FOURSQUARE_API_KEY}`,
      Accept: "application/json",
      "X-Places-Api-Version": "2025-06-17",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Foursquare API error: ${response.status}`, errorText);
    throw new Error(`Foursquare API error: ${response.status}`);
  }

  return response.json();
}

async function searchPlaces(query: string, near?: string, limit: number = 5) {
  const params: Record<string, string> = {
    query,
    limit: String(limit),
    fields: "fsq_place_id,name,location,categories,rating,tastes,latitude,longitude",
  };

  if (near) {
    params.near = near;
  }

  const data = await foursquareRequest("/places/search", params);
  return data.results as FoursquarePlace[];
}

async function getPlaceDetails(fsqPlaceId: string) {
  const data = await foursquareRequest(`/places/${fsqPlaceId}`, {
    fields: "fsq_place_id,name,location,categories,rating,tastes,features,latitude,longitude",
  });
  return data as FoursquarePlace;
}

async function getPlaceTips(fsqPlaceId: string, limit: number = 5) {
  const data = await foursquareRequest(`/places/${fsqPlaceId}/tips`, {
    limit: String(limit),
    sort: "popular",
  });
  // New API may wrap results differently
  return (Array.isArray(data) ? data : data.results || data) as FoursquareTip[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();

    let result;

    switch (action) {
      case "searchPlaces": {
        const { query, near, limit } = params;
        const places = await searchPlaces(query, near, limit);
        result = { places };
        break;
      }
      
      case "getPlaceDetails": {
        const { fsqId } = params;
        const place = await getPlaceDetails(fsqId);
        result = { place };
        break;
      }
      
      case "getPlaceTips": {
        const { fsqId, limit } = params;
        const tips = await getPlaceTips(fsqId, limit);
        result = { tips };
        break;
      }
      
      case "searchWithTips": {
        // Combined search: find place and get tips in one call
        const { query, near } = params;
        const places = await searchPlaces(query, near, 1);
        
        if (places.length === 0) {
          result = { place: null, tips: [] };
        } else {
          const place = places[0];
          let tips: FoursquareTip[] = [];
          
          try {
            tips = await getPlaceTips(place.fsq_place_id, 3);
          } catch (e) {
            console.log("Could not fetch tips:", e);
          }
          
          result = { 
            place: {
              fsqId: place.fsq_place_id,
              name: place.name,
              address: place.location.formatted_address || place.location.address,
              rating: place.rating,
              categories: place.categories.map(c => ({
                name: c.name,
                shortName: c.short_name,
              })),
              tastes: place.tastes || [],
              location: place.latitude && place.longitude 
                ? { lat: place.latitude, lng: place.longitude }
                : undefined,
            },
            tips: tips.map(t => ({
              id: t.id,
              text: t.text,
              createdAt: t.created_at,
              agreeCount: t.agree_count || 0,
            })),
          };
        }
        break;
      }
      
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("foursquare-places error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
