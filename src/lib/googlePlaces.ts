import { supabase } from "@/integrations/supabase/client";

const GOOGLE_PLACES_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-places`;

export interface Place {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  types?: string[];
  location?: { lat: number; lng: number };
  photoReference?: string;
  openNow?: boolean;
}

export interface PlaceDetails extends Place {
  phone?: string;
  website?: string;
  googleMapsUrl?: string;
  openingHours?: string[];
  isOpenNow?: boolean;
  photos?: { reference: string; width: number; height: number }[];
  reviews?: { author: string; rating: number; text: string; time: string }[];
}

async function callGooglePlaces(action: string, params: Record<string, unknown>) {
  const response = await fetch(GOOGLE_PLACES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ action, params }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao buscar dados do Google Places");
  }

  return response.json();
}

export async function searchPlaces(
  query: string,
  options?: { location?: string; type?: string; maxResults?: number }
): Promise<Place[]> {
  const data = await callGooglePlaces("searchPlaces", {
    query,
    ...options,
  });
  return data.places;
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const data = await callGooglePlaces("getPlaceDetails", { placeId });
  return data.place;
}

export async function getPhotoUrl(
  photoReference: string,
  maxWidth: number = 400
): Promise<string> {
  const data = await callGooglePlaces("getPhotoUrl", { photoReference, maxWidth });
  return data.photoUrl;
}

export async function searchNearby(
  location: string,
  type: string,
  options?: { radius?: number; maxResults?: number }
): Promise<Place[]> {
  const data = await callGooglePlaces("searchNearby", {
    location,
    type,
    ...options,
  });
  return data.places;
}

// Helper to convert price level to readable text
export function getPriceLevelText(priceLevel?: number): string {
  switch (priceLevel) {
    case 0:
      return "Gratuito";
    case 1:
      return "€";
    case 2:
      return "€€";
    case 3:
      return "€€€";
    case 4:
      return "€€€€";
    default:
      return "";
  }
}

// Helper to format rating with stars
export function formatRating(rating?: number): string {
  if (!rating) return "";
  return `${rating.toFixed(1)} ⭐`;
}
