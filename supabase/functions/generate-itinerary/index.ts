import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  location?: { lat: number; lng: number };
}

async function searchGooglePlaces(query: string, location?: string): Promise<PlaceResult | null> {
  const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
  
  if (!GOOGLE_PLACES_API_KEY) {
    console.log("GOOGLE_PLACES_API_KEY not configured, skipping place enrichment");
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

    const place = data.results[0];
    return {
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      photoReference: place.photos?.[0]?.photo_reference,
      location: place.geometry?.location,
    };
  } catch (error) {
    console.error("Error searching Google Places:", error);
    return null;
  }
}

async function getPlaceDetails(placeId: string): Promise<{ googleMapsUrl?: string } | null> {
  const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
  
  if (!GOOGLE_PLACES_API_KEY) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_API_KEY}&fields=url`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") return null;

    return {
      googleMapsUrl: data.result?.url,
    };
  } catch (error) {
    console.error("Error getting place details:", error);
    return null;
  }
}

async function enrichActivityWithPlaces(activity: any, cityName: string, countryName: string): Promise<any> {
  // Skip transport activities as they don't have a fixed location
  if (activity.category === "transport") {
    return activity;
  }

  // Build search query
  const searchQuery = `${activity.title} ${cityName} ${countryName}`;
  
  const placeResult = await searchGooglePlaces(searchQuery);
  
  if (placeResult) {
    // Get Google Maps URL
    const details = await getPlaceDetails(placeResult.placeId);
    
    return {
      ...activity,
      placeId: placeResult.placeId,
      photoReference: placeResult.photoReference,
      rating: placeResult.rating,
      userRatingsTotal: placeResult.userRatingsTotal,
      googleMapsUrl: details?.googleMapsUrl,
      // Update location if we got a better one
      location: placeResult.address || activity.location,
    };
  }

  return activity;
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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: ITINERARY_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [
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
        ],
        tool_choice: { type: "function", function: { name: "generate_itinerary" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Por favor, aguarde um momento." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar roteiro. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received");

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_itinerary") {
      console.error("No valid tool call in response");
      return new Response(
        JSON.stringify({ error: "Formato de resposta inválido" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let itinerary = JSON.parse(toolCall.function.arguments);
    
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
