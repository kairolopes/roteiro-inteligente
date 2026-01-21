import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageRequest {
  queries: string[];
  width?: number;
  height?: number;
}

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
  };
  alt_description: string | null;
  user: {
    name: string;
    username: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessKey = Deno.env.get('UNSPLASH_ACCESS_KEY');
    if (!accessKey) {
      throw new Error('UNSPLASH_ACCESS_KEY not configured');
    }

    const { queries, width = 800, height = 600 }: ImageRequest = await req.json();

    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      throw new Error('queries array is required');
    }

    const images: Record<string, { url: string; credit: string }> = {};
    const fallbackImages = [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop',
    ];

    // Process queries in batches to avoid rate limits
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      
      try {
        // Add travel-related context to improve results
        const searchQuery = `${query} travel destination`;
        
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
          {
            headers: {
              'Authorization': `Client-ID ${accessKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const photo: UnsplashPhoto = data.results[0];
            // Use raw URL with size parameters for optimal quality
            const imageUrl = `${photo.urls.raw}&w=${width}&h=${height}&fit=crop&q=80`;
            
            images[query] = {
              url: imageUrl,
              credit: `Photo by ${photo.user.name} on Unsplash`,
            };
          } else {
            // Use fallback if no results
            images[query] = {
              url: fallbackImages[i % fallbackImages.length],
              credit: 'Photo from Unsplash',
            };
          }
        } else {
          console.error(`Unsplash API error for "${query}":`, response.status);
          images[query] = {
            url: fallbackImages[i % fallbackImages.length],
            credit: 'Photo from Unsplash',
          };
        }

        // Small delay between requests to respect rate limits
        if (i < queries.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error fetching image for "${query}":`, error);
        images[query] = {
          url: fallbackImages[i % fallbackImages.length],
          credit: 'Photo from Unsplash',
        };
      }
    }

    return new Response(
      JSON.stringify({ images }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in fetch-travel-images:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
