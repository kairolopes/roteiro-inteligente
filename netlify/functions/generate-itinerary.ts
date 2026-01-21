import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const ITINERARY_SYSTEM_PROMPT = `Você é um planejador de viagens profissional. Gere roteiros de viagem detalhados e realistas em formato JSON.

REGRAS CRÍTICAS:
1. O roteiro DEVE ter EXATAMENTE o número de dias solicitado
2. Cada dia deve ter 3-5 atividades bem distribuídas
3. As atividades devem ser geograficamente coerentes (mesma cidade ou próximas)
4. Inclua estimativas realistas de custos em EUR
5. Horários devem ser realistas considerando tempo de deslocamento

FORMATO DO JSON:
{
  "title": "Título atrativo do roteiro",
  "summary": "Resumo de 2-3 frases sobre a viagem",
  "destinations": ["cidade1", "cidade2"],
  "duration": "X dias",
  "totalBudget": "€X.XXX - €X.XXX",
  "days": [
    {
      "day": 1,
      "date": "Segunda, 15 Jan",
      "city": "Nome da Cidade",
      "theme": "Tema do dia (ex: Chegada e Exploração)",
      "activities": [
        {
          "time": "09:00",
          "title": "Nome da atividade",
          "description": "Descrição detalhada da atividade",
          "location": "Nome do local específico",
          "coordinates": { "lat": 00.0000, "lng": 00.0000 },
          "duration": "2 horas",
          "cost": "€XX",
          "tips": "Dica útil para o viajante",
          "category": "sightseeing|food|culture|nature|shopping|transport"
        }
      ]
    }
  ]
}`;

const AI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

async function callGeminiAPI(apiKey: string, model: string, prompt: string): Promise<any> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: ITINERARY_SYSTEM_PROMPT + "\n\n" + prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

function extractItineraryFromResponse(response: any): any {
  try {
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (e) {
    console.error("Error extracting itinerary:", e);
    return null;
  }
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
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
    const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
    if (!GOOGLE_GEMINI_API_KEY) {
      console.error("GOOGLE_GEMINI_API_KEY not configured");
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "API key não configurada" }),
      };
    }

    const { quizAnswers, conversationSummary, stream } = JSON.parse(event.body || "{}");

    if (!quizAnswers) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Quiz answers são obrigatórios" }),
      };
    }

    // Calculate number of days
    let numDays = 7; // default
    if (quizAnswers.dates?.startDate && quizAnswers.dates?.endDate) {
      const start = new Date(quizAnswers.dates.startDate);
      const end = new Date(quizAnswers.dates.endDate);
      numDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      numDays = Math.max(1, Math.min(numDays, 30)); // Limit to 1-30 days
    }

    // Build user prompt
    const destLabels: Record<string, string> = {
      italy: "Itália", france: "França", spain: "Espanha",
      portugal: "Portugal", greece: "Grécia", netherlands: "Holanda",
      germany: "Alemanha", switzerland: "Suíça", surprise: "destino surpresa na Europa"
    };
    
    const styleLabels: Record<string, string> = {
      adventure: "aventura", cultural: "cultural", relaxation: "relaxamento",
      gastronomy: "gastronomia", romantic: "romântico", family: "família"
    };
    
    const budgetLabels: Record<string, string> = {
      budget: "econômico", moderate: "moderado", luxury: "luxo"
    };

    const destination = quizAnswers.destination ? (destLabels[quizAnswers.destination] || quizAnswers.destination) : "Europa";
    const style = quizAnswers.travelStyle ? (styleLabels[quizAnswers.travelStyle] || quizAnswers.travelStyle) : "cultural";
    const budget = budgetLabels[quizAnswers.budget] || "moderado";

    const userPrompt = `Crie um roteiro de viagem com EXATAMENTE ${numDays} dias para:

DESTINO: ${destination}
ESTILO: ${style}
ORÇAMENTO: ${budget}
VIAJANDO: ${quizAnswers.travelWith || "sozinho"}
ACOMODAÇÃO: ${quizAnswers.accommodation || "hotel"}
INTERESSES: ${quizAnswers.interests?.join(", ") || "cultura, gastronomia"}

${conversationSummary ? `\nCONTEXTO DA CONVERSA:\n${conversationSummary}\n` : ""}

IMPORTANTE: O roteiro DEVE ter EXATAMENTE ${numDays} dias, nem mais nem menos.
Retorne APENAS o JSON do roteiro, sem explicações adicionais.`;

    // Try each model until success
    let itinerary = null;
    let lastError = null;

    for (let i = 0; i < AI_MODELS.length; i++) {
      const model = AI_MODELS[i];
      console.log(`Trying model: ${model}`);

      try {
        const response = await callGeminiAPI(GOOGLE_GEMINI_API_KEY, model, userPrompt);
        itinerary = extractItineraryFromResponse(response);

        if (itinerary) {
          // Adjust days if needed
          if (itinerary.days && itinerary.days.length !== numDays) {
            while (itinerary.days.length < numDays) {
              const lastDay = itinerary.days[itinerary.days.length - 1];
              const newDay = {
                ...lastDay,
                day: itinerary.days.length + 1,
                theme: "Dia livre para exploração",
                activities: lastDay.activities.slice(0, 2).map((a: any) => ({
                  ...a,
                  title: "Exploração livre",
                  description: "Tempo para explorar a cidade no seu próprio ritmo",
                })),
              };
              itinerary.days.push(newDay);
            }
            while (itinerary.days.length > numDays) {
              itinerary.days.pop();
            }
          }

          // Add metadata
          itinerary.id = `itin_${Date.now()}`;
          itinerary.createdAt = new Date().toISOString();
          
          console.log(`Successfully generated itinerary with model: ${model}`);
          break;
        }
      } catch (e) {
        console.error(`Error with model ${model}:`, e);
        lastError = e;
      }
    }

    if (!itinerary) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: lastError?.message || "Falha ao gerar roteiro" }),
      };
    }

    // Return as SSE format if streaming requested
    if (stream) {
      const sseResponse = 
        `data: ${JSON.stringify({ type: "progress", data: { step: "ai_generation", message: "Gerando roteiro..." } })}\n\n` +
        `data: ${JSON.stringify({ type: "progress", data: { step: "ai_success", message: "Roteiro gerado com sucesso!" } })}\n\n` +
        `data: ${JSON.stringify({ type: "complete", data: { itinerary } })}\n\n`;

      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
        body: sseResponse,
      };
    }

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itinerary }),
    };
  } catch (error) {
    console.error("Error in generate-itinerary:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Erro interno do servidor" }),
    };
  }
};

export { handler };
