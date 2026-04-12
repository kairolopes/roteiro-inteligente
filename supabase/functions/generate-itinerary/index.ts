import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

// Validate place using Google Places API
async function validatePlace(
  title: string, 
  city: string,
  sendEvent?: (event: { type: string; data: any }) => void
): Promise<{
  coordinates: [number, number] | null;
  rating: number | null;
  googleMapsUrl: string | null;
  placeId: string | null;
  photoReference: string | null;
} | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/google-places`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ query: title, city }),
    });

    if (!response.ok) {
      console.log(`Google Places validation failed for: ${title}`);
      return null;
    }

    const data = await response.json();
    
    if (data.error || !data.coordinates) {
      console.log(`Place not found: ${title}`);
      return null;
    }

    // Protect sendEvent with try/catch - stream may have been closed
    if (sendEvent) {
      try {
        sendEvent({
          type: "progress",
          data: {
            step: "place_validated",
            message: `${title} validado ✓`,
            cached: data.cached,
          },
        });
      } catch (e) {
        console.log("Could not send progress event (stream may be closed)");
      }
    }

    return {
      coordinates: data.coordinates,
      rating: data.rating,
      googleMapsUrl: data.googleMapsUrl,
      placeId: data.placeId,
      photoReference: data.photoReference,
    };
  } catch (error) {
    console.error(`Error validating place ${title}:`, error);
    return null;
  }
}

// Enrich itinerary with real place data
async function enrichItineraryWithPlaces(
  itinerary: any,
  sendEvent?: (event: { type: string; data: any }) => void
): Promise<any> {
  if (!itinerary?.days) return itinerary;

  if (sendEvent) {
    sendEvent({
      type: "progress",
      data: {
        step: "validating_places",
        message: "Validando lugares com dados reais...",
      },
    });
  }

  let validatedCount = 0;
  const categoriesToValidate = ["attraction", "restaurant"];
  const maxActivitiesPerDay = 5;

  const enrichedDays = await Promise.all(
    itinerary.days.map(async (day: any) => {
      const enrichedActivities = await Promise.all(
        day.activities.map(async (activity: any, index: number) => {
          // Only validate attractions and restaurants, limit per day
          if (
            !categoriesToValidate.includes(activity.category) ||
            index >= maxActivitiesPerDay
          ) {
            return activity;
          }

          const placeData = await validatePlace(
            activity.title,
            day.city,
            sendEvent
          );

          if (placeData) {
            validatedCount++;
            return {
              ...activity,
              coordinates: placeData.coordinates || activity.coordinates,
              rating: placeData.rating || activity.estimatedRating,
              googleMapsUrl: placeData.googleMapsUrl,
              placeId: placeData.placeId,
              photoReference: placeData.photoReference,
              validated: true,
            };
          }

          return activity;
        })
      );

      return { ...day, activities: enrichedActivities };
    })
  );

  if (sendEvent) {
    sendEvent({
      type: "progress",
      data: {
        step: "validation_complete",
        message: `${validatedCount} lugares validados com dados reais`,
      },
    });
  }

  return { ...itinerary, days: enrichedDays };
}

const ITINERARY_SYSTEM_PROMPT = `Você é um especialista em criar roteiros de viagem ULTRA-DETALHADOS para qualquer lugar do mundo. 
Quando solicitado, você DEVE usar a função generate_itinerary para retornar um roteiro estruturado.

⚠️ HIERARQUIA DE PRIORIDADE (RESPEITE RIGOROSAMENTE):
1. MÁXIMA PRIORIDADE: Informações da conversa com o usuário (cidades, bairros, atrações, restaurantes mencionados)
2. ALTA PRIORIDADE: Datas específicas (data de início, dias da semana reais)
3. MÉDIA PRIORIDADE: Preferências do quiz (destino, orçamento, estilo de viagem)
4. BAIXA PRIORIDADE: Suas sugestões padrão

Se houver conflito entre o quiz e a conversa, A CONVERSA TEM PRIORIDADE ABSOLUTA.

⚠️ REGRA CRÍTICA E OBRIGATÓRIA DE DURAÇÃO:
- O roteiro DEVE ter EXATAMENTE o número de dias especificado pelo usuário
- Se o usuário escolheu 7 dias, crie EXATAMENTE 7 dias (Dia 1 até Dia 7)
- Se o usuário escolheu 4 dias, crie EXATAMENTE 4 dias (Dia 1 até Dia 4)
- Se o usuário escolheu 14 dias, crie EXATAMENTE 14 dias (Dia 1 até Dia 14)
- NUNCA crie mais ou menos dias do que o solicitado
- Esta regra é OBRIGATÓRIA e tem prioridade máxima

⚠️ REGRA CRÍTICA DE DATAS:
- Se uma data de início for fornecida, USE-A como base para o Dia 1
- Os dias da semana DEVEM ser corretos e reais (Segunda, Terça, etc.)
- Calcule cada dia subsequente a partir da data de início

🔴🔴🔴 QUANTIDADE MÍNIMA DE ATIVIDADES - OBRIGATÓRIO 🔴🔴🔴
Cada dia DEVE ter NO MÍNIMO 5-6 atividades para criar um roteiro completo e rico:
- Estrutura obrigatória: Café da manhã → Atividade manhã → Almoço → Atividade tarde → Atividade tarde 2 → Jantar
- NUNCA crie dias com menos de 5 atividades
- Roteiros curtos (2-3 atividades/dia) são PROIBIDOS
- O objetivo é um PDF de 3+ páginas com conteúdo rico

INSTRUÇÕES CRÍTICAS:
1. Crie roteiros realistas com atividades específicas e lugares REAIS que existem
2. OBRIGATÓRIO: Inclua coordenadas geográficas PRECISAS [latitude, longitude] para CADA atividade - isso é essencial para o mapa funcionar
3. Estime TODOS os custos em Reais Brasileiros (R$). NUNCA use Euro (€), Dólar ($) ou outra moeda. Valores devem ser realistas baseados em preços atuais.
4. Adicione dicas práticas úteis e DETALHADAS para CADA atividade (2-3 frases por dica)
5. Considere tempo de deslocamento entre atividades
6. Sugira restaurantes e locais específicos REAIS com nomes verdadeiros
7. Organize as atividades de forma lógica geograficamente
8. Para cada atividade, inclua:
   - Coordenadas precisas do local (obrigatório para navegação)
   - Descrição detalhada do que esperar (2-3 frases, não apenas 1)
   - Dicas práticas específicas (horários, filas, reservas necessárias, o que vestir, etc.)
   - Custo estimado realista
   - Avaliação estimada (1-5) baseada em popularidade

IMPORTANTE SOBRE COORDENADAS:
- As coordenadas devem ser arrays [latitude, longitude]
- Use coordenadas precisas de lugares reais
- Exemplo para Coliseu: [41.8902, 12.4922]
- Exemplo para Torre Eiffel: [48.8584, 2.2945]
- Exemplo para Cristo Redentor: [-22.9519, -43.2105]
- Exemplo para Monte Fuji: [35.3606, 138.7274]
- Exemplo para Burj Khalifa: [25.1972, 55.2744]

DICAS DE QUALIDADE:
- Inclua dicas como "Reserve com antecedência", "Chegue cedo para evitar filas"
- Mencione melhores horários para visitar
- Sugira alternativas para dias de chuva quando aplicável
- Considere fuso horário e clima local do destino
- Dica: mencione nome de pratos típicos para experimentar em restaurantes`;

// Models to try in order (primary, fallback) - Using Lovable AI Gateway
const AI_MODELS = ["google/gemini-2.5-flash", "openai/gpt-5-mini"];

async function callAIGateway(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  tools: any[],
  toolChoice: any
): Promise<{ success: boolean; data?: any; error?: string; status?: number; retryable?: boolean }> {
  console.log(`Calling Lovable AI Gateway with model: ${model}`);
  
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
    
    // Check for malformed function call error - this is retryable
    const finishReason = data.choices?.[0]?.finish_reason;
    if (finishReason && finishReason.includes("MALFORMED_FUNCTION_CALL")) {
      console.log(`Malformed function call from ${model}, will retry...`);
      return { success: false, error: "MALFORMED_FUNCTION_CALL", retryable: true };
    }
    
    // Check if we got a valid response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const content = data.choices?.[0]?.message?.content;
    
    if (!toolCall && !content) {
      console.log(`Empty response from ${model}`);
      return { success: false, error: "Empty response from model", retryable: true };
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
    const { quizAnswers, conversationSummary, stream = false } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    const OPENAI_API_KEY = LOVABLE_API_KEY; // Alias for compatibility

    // Build context from quiz answers
    let contextParts: string[] = [];
    
    if (quizAnswers) {
      const destLabels: Record<string, string> = {
        // Américas
        brazil: "Brasil", argentina: "Argentina", peru: "Peru",
        usa: "Estados Unidos", mexico: "México", canada: "Canadá",
        // Europa
        italy: "Itália", france: "França", spain: "Espanha",
        portugal: "Portugal", greece: "Grécia", netherlands: "Holanda",
        germany: "Alemanha", switzerland: "Suíça",
        // Ásia
        japan: "Japão", thailand: "Tailândia", indonesia: "Indonésia",
        // Oceania
        australia: "Austrália",
        // Oriente Médio & África
        uae: "Emirados Árabes", egypt: "Egito", morocco: "Marrocos", southafrica: "África do Sul",
        // Especial
        surprise: "destino surpresa"
      };
      
      // Suporte a múltiplos destinos
      if (quizAnswers.destinations?.length > 0) {
        const destNames = quizAnswers.destinations.map((d: string) => destLabels[d] || d);
        contextParts.push(`Destinos selecionados: ${destNames.join(", ")}`);
      } else if (quizAnswers.destination) {
        contextParts.push(`Destino: ${destLabels[quizAnswers.destination] || quizAnswers.destination}`);
      }
      
      // Região/cidades específicas
      if (quizAnswers.destinationDetails) {
        contextParts.push(`Região/cidades específicas: ${quizAnswers.destinationDetails}`);
      }
      
      const durationLabels: Record<string, number> = {
        weekend: 4, week: 7, twoweeks: 14, month: 21, flexible: 7
      };
      const numDays = durationLabels[quizAnswers.duration] || 7;
      contextParts.push(`Duração: ${numDays} dias`);
      
      // Adicionar data de início se disponível
      if (quizAnswers.startDate) {
        try {
          const startDate = new Date(quizAnswers.startDate);
          const weekDays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
          const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
          
          const formattedDate = `${weekDays[startDate.getDay()]}, ${startDate.getDate()} de ${months[startDate.getMonth()]} de ${startDate.getFullYear()}`;
          contextParts.push(`Data de início: ${formattedDate}`);
          
          // Calcular datas para cada dia
          const datesList: string[] = [];
          for (let i = 0; i < numDays; i++) {
            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + i);
            datesList.push(`Dia ${i + 1}: ${weekDays[dayDate.getDay()]}, ${dayDate.getDate()}/${dayDate.getMonth() + 1}/${dayDate.getFullYear()}`);
          }
          contextParts.push(`Calendário do roteiro:\n${datesList.join('\n')}`);
        } catch (e) {
          console.log("Erro ao processar data de início:", e);
        }
      }
      
      if (quizAnswers.budget) {
        const budgetLabels: Record<string, string> = {
          economic: "R$300-500/dia", moderate: "R$500-900/dia",
          comfortable: "R$900-1.800/dia", luxury: "R$1.800+/dia", flexible: "R$600-1.200/dia"
        };
        contextParts.push(`Orçamento: ${budgetLabels[quizAnswers.budget]}`);
      }
      
      if (quizAnswers.travelStyle) {
        const styleLabels: Record<string, string> = {
          romantic: "romântica", family: "em família",
          solo: "solo", backpacker: "mochilão"
        };
        contextParts.push(`Estilo: ${styleLabels[quizAnswers.travelStyle] || quizAnswers.travelStyle}`);
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

    // Get expected number of days
    const durationLabels: Record<string, number> = {
      weekend: 4, week: 7, twoweeks: 14, month: 21, flexible: 7
    };
    const numDays = durationLabels[quizAnswers?.duration] || 7;

    const userPrompt = `Crie um roteiro de viagem ULTRA-DETALHADO com base nestas preferências:
${contextParts.join("\n")}

${quizAnswers?.customRequests ? `
🔴🔴🔴 PEDIDOS ESPECIAIS DO USUÁRIO - PRIORIDADE ABSOLUTA 🔴🔴🔴
O usuário escreveu estes desejos ESPECÍFICOS que DEVEM aparecer no roteiro:
"${quizAnswers.customRequests}"

⚠️ VOCÊ É OBRIGADO A:
1. Incluir atividades que atendam EXATAMENTE a estes pedidos
2. Se o usuário quer "comer queijos", inclua restaurantes/fazendas de queijos REAIS
3. Se o usuário quer "vinhos na Toscana", inclua vinícolas na Toscana com nomes reais
4. Se o usuário quer "praias paradisíacas", inclua praias específicas com coordenadas
5. NÃO IGNORE estes pedidos - eles são a RAZÃO PRINCIPAL do roteiro
6. Mencione explicitamente estes pedidos nas atividades do roteiro
` : ""}

${quizAnswers?.destinationDetails ? `
🟠🟠🟠 REGIÃO/CIDADES ESPECÍFICAS - ALTA PRIORIDADE 🟠🟠🟠
O usuário quer focar NESTA região/cidades específicas: "${quizAnswers.destinationDetails}"

⚠️ VOCÊ DEVE:
1. Concentrar o roteiro NESTA região específica
2. Se for "Toscana", use cidades como Florença, Siena, Pisa, San Gimignano, Montepulciano
3. Se for "Costa Amalfitana", use Positano, Amalfi, Ravello, Sorrento
4. NÃO substitua por outras regiões do país
5. O usuário escolheu esta região por um motivo - RESPEITE isso
` : ""}

⚠️ ATENÇÃO MÁXIMA - NÚMERO DE DIAS:
Este roteiro DEVE ter EXATAMENTE ${numDays} dias.
- NÃO crie ${numDays - 1} dias
- NÃO crie ${numDays + 1} dias  
- Crie EXATAMENTE ${numDays} dias (Dia 1 até Dia ${numDays})

📋 ESTRUTURA OBRIGATÓRIA - MÍNIMO 5-6 ATIVIDADES POR DIA:
- Café da manhã/Hotel (1 atividade)
- Manhã: 1-2 atrações principais
- Almoço em restaurante específico REAL (1 atividade)
- Tarde: 1-2 atrações ou atividades
- Jantar em restaurante específico REAL (1 atividade)
- TOTAL: mínimo 5-6 atividades por dia
- Cada descrição deve ter 2-3 frases detalhadas
- Cada dica deve ser prática e específica

${conversationSummary ? `
⚠️⚠️⚠️ CONVERSA COM O USUÁRIO - PRIORIDADE MÁXIMA E ABSOLUTA ⚠️⚠️⚠️
O usuário conversou com a assistente Sofia. TUDO que foi discutido abaixo DEVE ser respeitado.
Esta seção tem PRIORIDADE TOTAL sobre qualquer outra informação.

=== HISTÓRICO COMPLETO DA CONVERSA ===
${conversationSummary}
=== FIM DO HISTÓRICO ===

🔴 REGRAS OBRIGATÓRIAS BASEADAS NA CONVERSA:
1. Se o usuário mencionou CIDADES específicas → USE essas cidades
2. Se o usuário mencionou BAIRROS específicos → INCLUA esses bairros no roteiro
3. Se o usuário mencionou RESTAURANTES específicos → INCLUA esses restaurantes
4. Se o usuário mencionou ATRAÇÕES específicas → INCLUA essas atrações
5. Se o usuário pediu ALTERAÇÕES ao pré-roteiro → APLIQUE as alterações
6. Se o usuário definiu PRIORIDADES → RESPEITE essas prioridades
7. Se o usuário mencionou o que NÃO quer → EXCLUA do roteiro

⚠️ CONFLITOS: Se houver conflito entre o quiz e a conversa, A CONVERSA VENCE SEMPRE.
` : ""}

REGRAS FINAIS OBRIGATÓRIAS:
1. Inclua coordenadas [latitude, longitude] PRECISAS para cada atividade
2. Use nomes de lugares REAIS e existentes (restaurantes, atrações, hotéis)
3. Adicione dicas práticas úteis e detalhadas para cada atividade
4. O roteiro DEVE ter EXATAMENTE ${numDays} dias
5. Cada dia DEVE ter NO MÍNIMO 5-6 atividades
6. Descrições detalhadas (2-3 frases) para cada atividade

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
                description: "Orçamento estimado por pessoa em Reais (ex: R$5.000 - R$8.000)" 
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
                      description: "Coordenadas [latitude, longitude] da cidade - OBRIGATÓRIO"
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
                          description: { type: "string", description: "Descrição detalhada do que esperar" },
                          location: { type: "string", description: "Endereço ou local" },
                          coordinates: {
                            type: "array",
                            items: { type: "number" },
                            description: "Coordenadas [lat, lng] do local - OBRIGATÓRIO para navegação"
                          },
                          duration: { type: "string", description: "Duração estimada (ex: 2h)" },
                          category: { 
                            type: "string", 
                            enum: ["attraction", "restaurant", "transport", "accommodation", "activity"],
                            description: "Categoria da atividade"
                          },
                          tips: { type: "string", description: "Dica útil prática (ex: Reserve com antecedência, Chegue às 8h para evitar filas)" },
                          cost: { type: "string", description: "Custo estimado em Reais (ex: R$150)" },
                          estimatedRating: { type: "number", description: "Avaliação estimada 1-5 baseada em popularidade" }
                        },
                        required: ["id", "time", "title", "description", "location", "coordinates", "duration", "category"]
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

    // If streaming is enabled, use SSE
    if (stream) {
      const encoder = new TextEncoder();
      
      const readable = new ReadableStream({
        async start(controller) {
          // Flag to track if stream is closed - prevents "cannot close or enqueue" errors
          let streamClosed = false;
          
          const sendEvent = (event: { type: string; data: any }) => {
            if (streamClosed) {
              console.log("Stream closed, skipping event:", event.type);
              return;
            }
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            } catch (e) {
              console.warn("Failed to enqueue event:", e);
              streamClosed = true;
            }
          };
          
          // Safe close function that is idempotent
          const closeStream = () => {
            if (!streamClosed) {
              streamClosed = true;
              try {
                controller.close();
              } catch (e) {
                // Already closed, ignore
              }
            }
          };

          try {
            // Try models in order until one succeeds
            let itinerary = null;
            let modelIndex = 0;
            const MAX_RETRIES_PER_MODEL = 2;

            for (const model of AI_MODELS) {
              modelIndex++;
              const modelName = model.split("/")[1] || model;
              
              // Try each model up to MAX_RETRIES_PER_MODEL times
              for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
                sendEvent({ 
                  type: "progress", 
                  data: { 
                    step: "ai_generation",
                    message: attempt > 1 
                      ? `Tentando ${modelName} novamente (${attempt}/${MAX_RETRIES_PER_MODEL})...`
                      : `Gerando roteiro com ${modelName}...`,
                    model: modelName,
                    attempt: modelIndex,
                    totalModels: AI_MODELS.length
                  } 
                });

                const result = await callAIGateway(
                  OPENAI_API_KEY,
                  model,
                  ITINERARY_SYSTEM_PROMPT,
                  userPrompt,
                  tools,
                  toolChoice
                );

                if (result.status === 429) {
                  sendEvent({ type: "error", data: { error: "Muitas requisições. Por favor, aguarde um momento." } });
                  closeStream();
                  return;
                }
                if (result.status === 402) {
                  sendEvent({ type: "error", data: { error: "Créditos insuficientes." } });
                  closeStream();
                  return;
                }

                if (result.success && result.data) {
                  itinerary = extractItineraryFromResponse(result.data);
                  
                  if (itinerary) {
                    sendEvent({ 
                      type: "progress", 
                      data: { 
                        step: "ai_success",
                        message: `Roteiro gerado com sucesso!`,
                        model: modelName
                      } 
                    });
                    break; // Break inner loop
                  } else {
                    // Response was valid but couldn't extract itinerary - retry same model
                    if (attempt < MAX_RETRIES_PER_MODEL) {
                      sendEvent({ 
                        type: "progress", 
                        data: { 
                          step: "ai_retry",
                          message: `Resposta inválida, tentando novamente...`,
                          model: modelName
                        } 
                      });
                    }
                  }
                } else {
                  // Check if error is retryable
                  const isRetryable = (result as any).retryable === true;
                  
                  if (isRetryable && attempt < MAX_RETRIES_PER_MODEL) {
                    sendEvent({ 
                      type: "progress", 
                      data: { 
                        step: "ai_retry",
                        message: `Erro temporário, tentando novamente...`,
                        model: modelName
                      } 
                    });
                    // Small delay before retry
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue; // Retry same model
                  }
                  
                  // Not retryable or exhausted retries - move to next model
                  if (modelIndex < AI_MODELS.length) {
                    sendEvent({ 
                      type: "progress", 
                      data: { 
                        step: "ai_retry",
                        message: `Modelo ${modelName} falhou, tentando alternativo...`,
                        model: modelName
                      } 
                    });
                  }
                  break; // Break inner loop to try next model
                }
              }
              
              // If we got an itinerary, break outer loop
              if (itinerary) break;
            }

            if (!itinerary) {
              sendEvent({ type: "error", data: { error: "Não foi possível gerar o roteiro. Tente novamente." } });
              closeStream();
              return;
            }

            // Validar e ajustar número de dias
            const durationMap: Record<string, number> = {
              weekend: 4, week: 7, twoweeks: 14, month: 21, flexible: 7
            };
            const expectedDays = durationMap[quizAnswers?.duration] || 7;
            if (itinerary.days && itinerary.days.length !== expectedDays) {
              console.log(`Ajustando dias: gerado ${itinerary.days.length}, esperado ${expectedDays}`);
              itinerary.days = itinerary.days.slice(0, expectedDays);
              itinerary.days.forEach((day: any, idx: number) => { day.day = idx + 1; });
              itinerary.duration = `${expectedDays} dias`;
            }

            // Enrich with Google Places data
            try {
              itinerary = await enrichItineraryWithPlaces(itinerary, sendEvent);
            } catch (enrichError) {
              console.error("Error enriching itinerary:", enrichError);
              // Continue with AI data if enrichment fails
            }

            // Add metadata
            itinerary.id = crypto.randomUUID();
            itinerary.createdAt = new Date().toISOString();

            sendEvent({ 
              type: "progress", 
              data: { 
                step: "complete",
                message: "Roteiro pronto!"
              } 
            });

            sendEvent({ type: "complete", data: { itinerary } });
            closeStream();
          } catch (error) {
            console.error("Streaming error:", error);
            sendEvent({ type: "error", data: { error: error instanceof Error ? error.message : "Erro desconhecido" } });
            closeStream();
          }
        }
      });

      return new Response(readable, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Non-streaming mode (original behavior)
    let itinerary = null;
    let lastError = null;
    let lastStatus = 500;

    for (const model of AI_MODELS) {
      const result = await callAIGateway(
        OPENAI_API_KEY,
        model,
        ITINERARY_SYSTEM_PROMPT,
        userPrompt,
        tools,
        toolChoice
      );

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

    // Validar e ajustar número de dias (non-streaming)
    const durationMap: Record<string, number> = {
      weekend: 4, week: 7, twoweeks: 14, month: 21, flexible: 7
    };
    const expectedDays = durationMap[quizAnswers?.duration] || 7;
    if (itinerary.days && itinerary.days.length !== expectedDays) {
      console.log(`Ajustando dias (non-stream): gerado ${itinerary.days.length}, esperado ${expectedDays}`);
      itinerary.days = itinerary.days.slice(0, expectedDays);
      itinerary.days.forEach((day: any, idx: number) => { day.day = idx + 1; });
      itinerary.duration = `${expectedDays} dias`;
    }

    // Enrich with Google Places data (non-streaming)
    try {
      itinerary = await enrichItineraryWithPlaces(itinerary);
    } catch (enrichError) {
      console.error("Error enriching itinerary (non-stream):", enrichError);
      // Continue with AI data if enrichment fails
    }
    
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
