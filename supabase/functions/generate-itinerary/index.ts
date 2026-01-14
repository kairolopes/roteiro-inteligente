import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ITINERARY_SYSTEM_PROMPT = `Você é um especialista em criar roteiros de viagem detalhados para a Europa. 
Quando solicitado, você DEVE usar a função generate_itinerary para retornar um roteiro estruturado.

INSTRUÇÕES IMPORTANTES:
1. Crie roteiros realistas com atividades específicas
2. Inclua coordenadas geográficas precisas para cada cidade
3. Estime custos em euros de forma realista
4. Adicione dicas práticas úteis
5. Considere tempo de deslocamento entre atividades
6. Sugira restaurantes e locais específicos reais
7. Organize as atividades de forma lógica geograficamente`;

interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  photoReference?: string;
  googleMapsUrl?: string;
  location?: { lat: number; lng: number };
}

interface FoursquareResult {
  fsqId: string;
  name: string;
  address?: string;
  rating?: number;
  categories: Array<{ name: string; shortName: string }>;
  tastes: string[];
  tips: Array<{ id: string; text: string; createdAt: string; agreeCount: number }>;
  location?: { lat: number; lng: number };
}

interface CachedPlace {
  place_id: string;
  name: string;
  address: string;
  rating: number | null;
  user_ratings_total: number | null;
  photo_reference: string | null;
  google_maps_url: string | null;
  location_lat: number | null;
  location_lng: number | null;
  // Foursquare fields
  foursquare_id: string | null;
  foursquare_rating: number | null;
  foursquare_tips: any[] | null;
  foursquare_categories: any[] | null;
  foursquare_tastes: string[] | null;
}

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, supabaseKey);
}

async function getCachedPlace(searchQuery: string): Promise<{ google: PlaceResult | null; foursquare: FoursquareResult | null }> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("places_cache")
    .select("*")
    .eq("search_query", searchQuery.toLowerCase())
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) return { google: null, foursquare: null };

  const cached = data as CachedPlace;
  
  const google: PlaceResult | null = cached.place_id ? {
    placeId: cached.place_id,
    name: cached.name || "",
    address: cached.address || "",
    rating: cached.rating ?? undefined,
    userRatingsTotal: cached.user_ratings_total ?? undefined,
    photoReference: cached.photo_reference ?? undefined,
    googleMapsUrl: cached.google_maps_url ?? undefined,
    location: cached.location_lat && cached.location_lng 
      ? { lat: cached.location_lat, lng: cached.location_lng }
      : undefined,
  } : null;

  const foursquare: FoursquareResult | null = cached.foursquare_id ? {
    fsqId: cached.foursquare_id,
    name: cached.name || "",
    address: cached.address ?? undefined,
    rating: cached.foursquare_rating ?? undefined,
    categories: cached.foursquare_categories || [],
    tastes: cached.foursquare_tastes || [],
    tips: cached.foursquare_tips || [],
    location: cached.location_lat && cached.location_lng 
      ? { lat: cached.location_lat, lng: cached.location_lng }
      : undefined,
  } : null;

  return { google, foursquare };
}

async function cachePlace(
  searchQuery: string, 
  google: PlaceResult | null, 
  foursquare: FoursquareResult | null
): Promise<void> {
  const supabase = getSupabaseClient();
  
  const cacheData = {
    search_query: searchQuery.toLowerCase(),
    // Google data
    place_id: google?.placeId ?? null,
    name: google?.name ?? foursquare?.name ?? null,
    address: google?.address ?? foursquare?.address ?? null,
    rating: google?.rating ?? null,
    user_ratings_total: google?.userRatingsTotal ?? null,
    photo_reference: google?.photoReference ?? null,
    google_maps_url: google?.googleMapsUrl ?? null,
    location_lat: google?.location?.lat ?? foursquare?.location?.lat ?? null,
    location_lng: google?.location?.lng ?? foursquare?.location?.lng ?? null,
    // Foursquare data
    foursquare_id: foursquare?.fsqId ?? null,
    foursquare_rating: foursquare?.rating ?? null,
    foursquare_tips: foursquare?.tips ?? [],
    foursquare_categories: foursquare?.categories ?? [],
    foursquare_tastes: foursquare?.tastes ?? [],
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  };

  await supabase
    .from("places_cache")
    .upsert(cacheData, { onConflict: "search_query" });
}

async function searchGooglePlaces(query: string, location?: string): Promise<PlaceResult | null> {
  const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
  
  if (!GOOGLE_PLACES_API_KEY) {
    console.log("GOOGLE_PLACES_API_KEY not configured, skipping Google Places");
    return null;
  }

  try {
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}&language=pt-BR`;
    
    if (location) {
      url += `&location=${encodeURIComponent(location)}&radius=5000`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results?.length) {
      return null;
    }

    const apiPlace = data.results[0];
    
    // Get Google Maps URL
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${apiPlace.place_id}&key=${GOOGLE_PLACES_API_KEY}&fields=url`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    return {
      placeId: apiPlace.place_id,
      name: apiPlace.name,
      address: apiPlace.formatted_address,
      rating: apiPlace.rating,
      userRatingsTotal: apiPlace.user_ratings_total,
      photoReference: apiPlace.photos?.[0]?.photo_reference,
      googleMapsUrl: detailsData.result?.url,
      location: apiPlace.geometry?.location,
    };
  } catch (error) {
    console.error("Error searching Google Places:", error);
    return null;
  }
}

async function searchFoursquarePlaces(query: string, near: string): Promise<FoursquareResult | null> {
  const FOURSQUARE_API_KEY = Deno.env.get("FOURSQUARE_API_KEY");
  
  if (!FOURSQUARE_API_KEY) {
    console.log("FOURSQUARE_API_KEY not configured, skipping Foursquare");
    return null;
  }

  try {
    const searchUrl = new URL("https://api.foursquare.com/v3/places/search");
    searchUrl.searchParams.append("query", query);
    searchUrl.searchParams.append("near", near);
    searchUrl.searchParams.append("limit", "1");
    searchUrl.searchParams.append("fields", "fsq_id,name,location,categories,rating,tastes,geocodes");

    const searchResponse = await fetch(searchUrl.toString(), {
      headers: {
        Authorization: `Bearer ${FOURSQUARE_API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!searchResponse.ok) {
      console.error("Foursquare search error:", searchResponse.status);
      return null;
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.results?.length) {
      return null;
    }

    const place = searchData.results[0];
    
    // Get tips for this place
    let tips: Array<{ id: string; text: string; createdAt: string; agreeCount: number }> = [];
    try {
      const tipsUrl = new URL(`https://api.foursquare.com/v3/places/${place.fsq_id}/tips`);
      tipsUrl.searchParams.append("limit", "3");
      tipsUrl.searchParams.append("sort", "popular");

      const tipsResponse = await fetch(tipsUrl.toString(), {
        headers: {
          Authorization: `Bearer ${FOURSQUARE_API_KEY}`,
          Accept: "application/json",
        },
      });

      if (tipsResponse.ok) {
        const tipsData = await tipsResponse.json();
        tips = tipsData.map((t: any) => ({
          id: t.id,
          text: t.text,
          createdAt: t.created_at,
          agreeCount: t.agree_count || 0,
        }));
      }
    } catch (e) {
      console.log("Could not fetch Foursquare tips:", e);
    }

    return {
      fsqId: place.fsq_id,
      name: place.name,
      address: place.location?.formatted_address || place.location?.address,
      rating: place.rating,
      categories: (place.categories || []).map((c: any) => ({
        name: c.name,
        shortName: c.short_name,
      })),
      tastes: place.tastes || [],
      tips,
      location: place.geocodes?.main 
        ? { lat: place.geocodes.main.latitude, lng: place.geocodes.main.longitude }
        : undefined,
    };
  } catch (error) {
    console.error("Error searching Foursquare:", error);
    return null;
  }
}

async function enrichActivityWithPlaces(activity: any, cityName: string, countryName: string): Promise<any> {
  // Skip transport activities as they don't have a fixed location
  if (activity.category === "transport") {
    return activity;
  }

  const searchQuery = `${activity.title} ${cityName} ${countryName}`;
  const near = `${cityName}, ${countryName}`;
  
  // Check cache first
  const cached = await getCachedPlace(searchQuery);
  
  if (cached.google || cached.foursquare) {
    console.log(`Cache hit for: ${searchQuery}`);
    
    return {
      ...activity,
      // Google data
      placeId: cached.google?.placeId,
      photoReference: cached.google?.photoReference,
      rating: cached.google?.rating,
      userRatingsTotal: cached.google?.userRatingsTotal,
      googleMapsUrl: cached.google?.googleMapsUrl,
      location: cached.google?.address || activity.location,
      // Foursquare data
      foursquareId: cached.foursquare?.fsqId,
      foursquareRating: cached.foursquare?.rating,
      foursquareTips: cached.foursquare?.tips,
      foursquareCategories: cached.foursquare?.categories,
      foursquareTastes: cached.foursquare?.tastes,
    };
  }

  console.log(`Cache miss, fetching from APIs: ${searchQuery}`);

  // Fetch from both APIs in parallel
  const [googleResult, foursquareResult] = await Promise.all([
    searchGooglePlaces(searchQuery),
    searchFoursquarePlaces(activity.title, near),
  ]);

  // Cache combined results
  await cachePlace(searchQuery, googleResult, foursquareResult);

  return {
    ...activity,
    // Google data
    placeId: googleResult?.placeId,
    photoReference: googleResult?.photoReference,
    rating: googleResult?.rating,
    userRatingsTotal: googleResult?.userRatingsTotal,
    googleMapsUrl: googleResult?.googleMapsUrl,
    location: googleResult?.address || activity.location,
    // Foursquare data
    foursquareId: foursquareResult?.fsqId,
    foursquareRating: foursquareResult?.rating,
    foursquareTips: foursquareResult?.tips,
    foursquareCategories: foursquareResult?.categories,
    foursquareTastes: foursquareResult?.tastes,
  };
}

async function enrichItineraryWithPlaces(itinerary: any): Promise<any> {
  const enrichedDays = await Promise.all(
    itinerary.days.map(async (day: any) => {
      // Process activities in batches to avoid rate limiting
      const enrichedActivities = [];
      
      for (const activity of day.activities) {
        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const enrichedActivity = await enrichActivityWithPlaces(
          activity, 
          day.city, 
          day.country
        );
        enrichedActivities.push(enrichedActivity);
      }

      return {
        ...day,
        activities: enrichedActivities,
      };
    })
  );

  return {
    ...itinerary,
    days: enrichedDays,
  };
}

// Models to try in order (primary, fallback)
const AI_MODELS = ["google/gemini-2.5-flash", "google/gemini-2.5-pro"];

async function callAIGateway(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  tools: any[],
  toolChoice: any
): Promise<{ success: boolean; data?: any; error?: string; status?: number }> {
  console.log(`Calling AI Gateway with model: ${model}`);
  
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: toolChoice,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI Gateway error (${model}):`, response.status, errorText);
      return { success: false, error: errorText, status: response.status };
    }

    const data = await response.json();
    console.log(`AI response received from ${model}`);
    console.log("Raw AI response preview:", JSON.stringify(data).substring(0, 1000));
    
    // Check if we got a valid response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const content = data.choices?.[0]?.message?.content;
    
    if (!toolCall && !content) {
      console.log(`Empty response from ${model}`);
      return { success: false, error: "Empty response from model" };
    }

    return { success: true, data };
  } catch (error) {
    console.error(`Error calling AI Gateway with ${model}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

function extractItineraryFromResponse(data: any): any | null {
  // Try tool call first
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (toolCall && toolCall.function.name === "generate_itinerary") {
    console.log("Parsing itinerary from tool call");
    try {
      return JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Failed to parse tool call arguments:", e);
    }
  }

  // Fallback: try to extract JSON from message content
  console.log("No tool call found, trying fallback extraction from content");
  const content = data.choices?.[0]?.message?.content;
  
  if (content) {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                      content.match(/```\s*([\s\S]*?)\s*```/) ||
                      content.match(/(\{[\s\S]*"title"[\s\S]*"days"[\s\S]*\})/);
    
    if (jsonMatch) {
      try {
        const itinerary = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        console.log("Successfully extracted itinerary from content");
        return itinerary;
      } catch (parseError) {
        console.error("Failed to parse extracted JSON:", parseError);
      }
    }
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quizAnswers, conversationSummary } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from quiz answers
    let contextParts: string[] = [];
    
    if (quizAnswers) {
      const destLabels: Record<string, string> = {
        italy: "Itália", france: "França", spain: "Espanha",
        portugal: "Portugal", greece: "Grécia", netherlands: "Holanda",
        germany: "Alemanha", switzerland: "Suíça", surprise: "destino surpresa"
      };
      
      if (quizAnswers.destinations?.length > 0) {
        contextParts.push(`Destinos: ${quizAnswers.destinations.map((d: string) => destLabels[d] || d).join(", ")}`);
      }
      
      const durationLabels: Record<string, number> = {
        weekend: 4, week: 7, twoweeks: 14, month: 21, flexible: 7
      };
      const numDays = durationLabels[quizAnswers.duration] || 7;
      contextParts.push(`Duração: ${numDays} dias`);
      
      if (quizAnswers.budget) {
        const budgetLabels: Record<string, string> = {
          economic: "€50-80/dia", moderate: "€80-150/dia",
          comfortable: "€150-300/dia", luxury: "€300+/dia", flexible: "€100-200/dia"
        };
        contextParts.push(`Orçamento: ${budgetLabels[quizAnswers.budget]}`);
      }
      
      if (quizAnswers.travelStyle?.length > 0) {
        const styleLabels: Record<string, string> = {
          romantic: "romântica", adventure: "aventura", cultural: "cultural",
          gastronomy: "gastronômica", family: "família", party: "festas",
          photography: "fotogênica", relaxing: "relaxante"
        };
        contextParts.push(`Estilo: ${quizAnswers.travelStyle.map((s: string) => styleLabels[s] || s).join(", ")}`);
      }
      
      if (quizAnswers.interests?.length > 0) {
        contextParts.push(`Interesses: ${quizAnswers.interests.join(", ")}`);
      }
      
      if (quizAnswers.travelWith) {
        const withLabels: Record<string, string> = {
          solo: "viajante solo", couple: "casal", friends: "grupo de amigos",
          "family-kids": "família com crianças", "family-adults": "família adultos"
        };
        contextParts.push(`Viajando: ${withLabels[quizAnswers.travelWith] || quizAnswers.travelWith}`);
      }
    }

    const userPrompt = `Crie um roteiro de viagem detalhado com base nestas preferências:
${contextParts.join("\n")}

${conversationSummary ? `Contexto adicional da conversa: ${conversationSummary}` : ""}

Use a função generate_itinerary para retornar o roteiro estruturado.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "generate_itinerary",
          description: "Gera um roteiro de viagem estruturado com dias, atividades e informações detalhadas",
          parameters: {
            type: "object",
            properties: {
              title: { 
                type: "string", 
                description: "Título atraente do roteiro (ex: Aventura Romântica pela Itália)" 
              },
              summary: { 
                type: "string", 
                description: "Resumo do roteiro em 2-3 frases" 
              },
              duration: { 
                type: "string", 
                description: "Duração total (ex: 7 dias)" 
              },
              totalBudget: { 
                type: "string", 
                description: "Orçamento estimado por pessoa (ex: €2.000 - €2.500)" 
              },
              destinations: {
                type: "array",
                items: { type: "string" },
                description: "Lista de cidades visitadas"
              },
              days: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "number", description: "Número do dia (1, 2, 3...)" },
                    date: { type: "string", description: "Dia da semana (Segunda-feira, Terça-feira...)" },
                    city: { type: "string", description: "Cidade principal do dia" },
                    country: { type: "string", description: "País" },
                    coordinates: {
                      type: "array",
                      items: { type: "number" },
                      description: "Coordenadas [latitude, longitude] da cidade"
                    },
                    highlights: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-4 destaques principais do dia"
                    },
                    activities: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", description: "ID único (ex: 1-1, 1-2)" },
                          time: { type: "string", description: "Horário (ex: 09:00)" },
                          title: { type: "string", description: "Nome da atividade" },
                          description: { type: "string", description: "Descrição detalhada" },
                          location: { type: "string", description: "Endereço ou local" },
                          coordinates: {
                            type: "array",
                            items: { type: "number" },
                            description: "Coordenadas [lat, lng] do local"
                          },
                          duration: { type: "string", description: "Duração estimada (ex: 2h)" },
                          category: { 
                            type: "string", 
                            enum: ["attraction", "restaurant", "transport", "accommodation", "activity"],
                            description: "Categoria da atividade"
                          },
                          tips: { type: "string", description: "Dica útil (opcional)" },
                          cost: { type: "string", description: "Custo estimado (ex: €25)" }
                        },
                        required: ["id", "time", "title", "description", "location", "duration", "category"]
                      }
                    }
                  },
                  required: ["day", "date", "city", "country", "coordinates", "highlights", "activities"]
                }
              }
            },
            required: ["title", "summary", "duration", "totalBudget", "destinations", "days"]
          }
        }
      }
    ];

    const toolChoice = { type: "function", function: { name: "generate_itinerary" } };

    // Try models in order until one succeeds
    let itinerary = null;
    let lastError = null;
    let lastStatus = 500;

    for (const model of AI_MODELS) {
      const result = await callAIGateway(
        LOVABLE_API_KEY,
        model,
        ITINERARY_SYSTEM_PROMPT,
        userPrompt,
        tools,
        toolChoice
      );

      // Handle rate limit and payment errors immediately
      if (result.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Por favor, aguarde um momento." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (result.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (result.success && result.data) {
        itinerary = extractItineraryFromResponse(result.data);
        
        if (itinerary) {
          console.log(`Successfully generated itinerary with model: ${model}`);
          break;
        } else {
          console.log(`Model ${model} returned data but could not extract itinerary, trying next model...`);
        }
      } else {
        console.log(`Model ${model} failed: ${result.error}, trying next model...`);
        lastError = result.error;
        lastStatus = result.status || 500;
      }
    }

    if (!itinerary) {
      console.error("All models failed to generate itinerary");
      return new Response(
        JSON.stringify({ error: "Não foi possível gerar o roteiro. Tente novamente." }),
        { status: lastStatus, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Enrich with Google Places data
    console.log("Enriching itinerary with Google Places data...");
    itinerary = await enrichItineraryWithPlaces(itinerary);
    console.log("Enrichment complete");
    
    // Add metadata
    itinerary.id = crypto.randomUUID();
    itinerary.createdAt = new Date().toISOString();

    return new Response(
      JSON.stringify({ itinerary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-itinerary error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
