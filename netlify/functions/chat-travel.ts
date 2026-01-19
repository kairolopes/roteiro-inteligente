import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SYSTEM_PROMPT = `Você é a Sofia, uma assistente de viagens especializada em Europa. Você é amigável, entusiasmada e conhecedora de destinos europeus.

SUAS RESPONSABILIDADES:
1. Ajudar viajantes a planejar roteiros pela Europa
2. Dar dicas personalizadas baseadas nas preferências do usuário
3. Sugerir destinos, atividades, restaurantes e hospedagens
4. Fornecer informações práticas sobre transporte, documentação e custos
5. Criar itinerários detalhados quando solicitado

ESTILO DE COMUNICAÇÃO:
- Use um tom amigável e entusiasmado
- Inclua emojis relevantes para tornar a conversa mais agradável
- Seja concisa mas informativa
- Personalize as recomendações baseado nas preferências do usuário
- Quando mencionar lugares, inclua dicas práticas

DIRETRIZES IMPORTANTES:
- Sempre considere o orçamento e estilo de viagem do usuário
- Sugira opções variadas de preço quando apropriado
- Inclua estimativas de tempo e custo quando relevante
- Mencione épocas ideais para visitar quando pertinente
- Alerte sobre possíveis desafios ou considerações especiais

Quando o usuário pedir para criar um roteiro, forneça um resumo estruturado com:
- Destinos principais e duração sugerida
- Principais atividades por cidade
- Estimativa de orçamento
- Dicas de transporte entre destinos`;

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

    const { messages, quizAnswers } = JSON.parse(event.body || "{}");

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Mensagens são obrigatórias" }),
      };
    }

    // Build context message from quiz answers
    let contextMessage = "";
    if (quizAnswers) {
      const destLabels: Record<string, string> = {
        italy: "Itália", france: "França", spain: "Espanha",
        portugal: "Portugal", greece: "Grécia", netherlands: "Holanda",
        germany: "Alemanha", switzerland: "Suíça", surprise: "destino surpresa"
      };
      
      const styleLabels: Record<string, string> = {
        adventure: "Aventura", cultural: "Cultural", relaxation: "Relaxamento",
        gastronomy: "Gastronomia", romantic: "Romântico", family: "Família"
      };
      
      const budgetLabels: Record<string, string> = {
        budget: "Econômico", moderate: "Moderado", luxury: "Luxo"
      };

      const destination = quizAnswers.destination ? (destLabels[quizAnswers.destination] || quizAnswers.destination) : null;
      const styleLabels: Record<string, string> = {
        romantic: "Romântica", family: "Em Família", solo: "Solo", backpacker: "Mochilão"
      };
      const style = quizAnswers.travelStyle ? (styleLabels[quizAnswers.travelStyle] || quizAnswers.travelStyle) : null;
      const budget = budgetLabels[quizAnswers.budget] || quizAnswers.budget;
      
      contextMessage = `\n\nCONTEXTO DO USUÁRIO (do quiz de preferências):
- Destino de interesse: ${destination || "Não especificado"}
- Estilo de viagem: ${style || "Não especificado"}
- Orçamento: ${budget || "Não especificado"}
- Período: ${quizAnswers.dates?.startDate || "Não especificado"} a ${quizAnswers.dates?.endDate || "Não especificado"}
- Viajando: ${quizAnswers.travelWith || "Não especificado"}
- Acomodação preferida: ${quizAnswers.accommodation || "Não especificado"}
- Interesses: ${quizAnswers.interests?.join(", ") || "Não especificado"}`;
    }

    const geminiMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Add system prompt as first message
    geminiMessages.unshift({
      role: "user",
      parts: [{ text: SYSTEM_PROMPT + contextMessage + "\n\nResponda como a Sofia, a assistente de viagens." }],
    });
    geminiMessages.splice(1, 0, {
      role: "model",
      parts: [{ text: "Entendido! Sou a Sofia, sua assistente de viagens especializada em Europa. Estou pronta para ajudar! 🌍✈️" }],
    });

    // Call Gemini API with streaming
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GOOGLE_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);
      
      if (geminiResponse.status === 429) {
        return {
          statusCode: 429,
          headers: corsHeaders,
          body: JSON.stringify({ error: "Limite de requisições atingido. Aguarde um momento." }),
        };
      }
      
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Erro ao processar sua mensagem" }),
      };
    }

    // Stream the response
    const responseText = await geminiResponse.text();
    const lines = responseText.split("\n");
    let fullContent = "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content) {
            fullContent += content;
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }
    }

    // Return as SSE format for compatibility
    const sseResponse = `data: ${JSON.stringify({
      choices: [{ delta: { content: fullContent } }]
    })}\n\ndata: [DONE]\n\n`;

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
      body: sseResponse,
    };
  } catch (error) {
    console.error("Error in chat-travel:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Erro interno do servidor" }),
    };
  }
};

export { handler };
