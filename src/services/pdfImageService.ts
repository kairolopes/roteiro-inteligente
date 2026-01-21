import { supabase } from "@/integrations/supabase/client";

export interface FetchedImage {
  url: string;
  credit?: string;
  base64?: string;
}

export interface ImageCache {
  cover?: FetchedImage;
  days: Record<number, FetchedImage>;
  activities: Record<string, FetchedImage>;
}

/**
 * Fetches travel images from Unsplash via edge function
 */
export async function fetchTravelImages(
  queries: string[],
  width = 800,
  height = 600
): Promise<Record<string, FetchedImage>> {
  try {
    const { data, error } = await supabase.functions.invoke("fetch-travel-images", {
      body: { queries, width, height },
    });

    if (error) {
      console.error("Error fetching travel images:", error);
      return {};
    }

    return data?.images || {};
  } catch (err) {
    console.error("Failed to fetch travel images:", err);
    return {};
  }
}

/**
 * Converts an image URL to base64 for PDF embedding
 */
export async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Failed to convert image to base64:", err);
    return null;
  }
}

/**
 * Fetches and caches images for an itinerary
 */
export async function fetchItineraryImages(
  itinerary: {
    title: string;
    destinations: string[];
    days: Array<{
      day: number;
      city: string;
      country: string;
      activities: Array<{
        id: string;
        title: string;
        category: string;
        location?: string;
      }>;
    }>;
  },
  onProgress?: (percent: number) => void
): Promise<ImageCache> {
  const cache: ImageCache = { days: {}, activities: {} };
  
  // Build query list
  const queries: string[] = [];
  
  // Cover image query
  const coverQuery = itinerary.destinations.length > 0
    ? `${itinerary.destinations[0]} travel landscape`
    : `${itinerary.title} travel`;
  queries.push(coverQuery);
  
  // Day images
  const dayQueries = itinerary.days.map(
    (day) => `${day.city} ${day.country} city skyline`
  );
  queries.push(...dayQueries);
  
  onProgress?.(10);
  
  // Fetch all images at once
  const images = await fetchTravelImages(queries, 1200, 800);
  
  onProgress?.(20);
  
  // Process cover
  const coverImage = images[coverQuery];
  if (coverImage?.url) {
    const base64 = await imageUrlToBase64(coverImage.url);
    if (base64) {
      cache.cover = { ...coverImage, base64 };
    }
  }
  
  onProgress?.(25);
  
  // Process day images
  const totalDays = itinerary.days.length;
  for (let i = 0; i < totalDays; i++) {
    const day = itinerary.days[i];
    const query = dayQueries[i];
    const image = images[query];
    
    if (image?.url) {
      const base64 = await imageUrlToBase64(image.url);
      if (base64) {
        cache.days[day.day] = { ...image, base64 };
      }
    }
    
    onProgress?.(25 + ((i + 1) / totalDays) * 5);
  }
  
  onProgress?.(30);
  
  return cache;
}

/**
 * Get fallback gradient for missing images
 */
export function getFallbackGradient(category?: string): string {
  const gradients: Record<string, string> = {
    restaurant: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    attraction: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
    transport: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    accommodation: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    activity: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
  };
  
  return gradients[category || "activity"] || "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)";
}
