import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SYSTEM_PROMPT = `Você é a Sofia, uma agente de viagens simpática, conhecedora e apaixonada por viagens.

🔴🔴🔴 REGRA CRÍTICA - USAR DADOS DO QUIZ 🔴🔴🔴
O viajante acabou de responder um quiz completo com todas as preferências.
Você VAI RECEBER esses dados no "CONTEXTO DO VIAJANTE" abaixo.

VOCÊ DEVE OBRIGATORIAMENTE:
1. USAR todos os dados fornecidos (datas, destino, orçamento, interesses) na sua resposta
2. NÃO re-perguntar informações que já estão no contexto
3. INICIAR IMEDIATAMENTE com um pré-roteiro dia a dia baseado nos dados
4. Se há datas específicas, CALCULAR os dias da semana reais (ex: 15/março = sábado)
5. Se há "Pedidos Especiais", tratá-los como PRIORIDADE ABSOLUTA

❌ VOCÊ NÃO DEVE:
- Perguntar "qual a duração?" se já tem Duração no contexto
- Perguntar "qual época do ano?" se já tem Datas no contexto  
- Perguntar "quais interesses?" se já tem Interesses no contexto
- Perguntar "qual o orçamento?" se já tem Orçamento no contexto
- Ignorar pedidos especiais mencionados pelo usuário

✅ FORMATO OBRIGATÓRIO DA PRIMEIRA RESPOSTA:
1. Cumprimente brevemente (1 frase) confirmando que viu as preferências
2. Apresente IMEDIATAMENTE um pré-roteiro dia a dia completo:
   - Dia 1 (data + dia da semana): Manhã, Tarde, Noite
   - Dia 2 (data + dia da semana): Manhã, Tarde, Noite
   - (continue para todos os dias)
3. Inclua os pedidos especiais nas atividades (ex: "degustação de queijos")
4. No final, pergunte se quer AJUSTAR algo

ESTILO DE COMUNICAÇÃO:
- Use emojis moderadamente
- Seja específica com nomes de lugares reais
- Inclua estimativas de custo em R$
- Formate com clareza (use quebras de linha)

PRIORIDADES:
1. PEDIDOS ESPECIAIS do usuário (máxima prioridade)
2. Região/cidades específicas mencionadas
3. Datas e duração definidas
4. Estilo e orçamento selecionados
5. Interesses marcados`;

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
    // Use LOVABLE_API_KEY for Lovable AI Gateway
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
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
      
      const travelWithLabels: Record<string, string> = {
        romantic: "Romântica", family: "Em Família", solo: "Solo", backpacker: "Mochilão"
      };
      
      const budgetLabels: Record<string, string> = {
        budget: "Econômico", moderate: "Moderado", luxury: "Luxo"
      };

      const destination = quizAnswers.destination ? (destLabels[quizAnswers.destination] || quizAnswers.destination) : null;
      const style = quizAnswers.travelStyle ? (styleLabels[quizAnswers.travelStyle] || quizAnswers.travelStyle) : null;
      const travelWith = quizAnswers.travelWith ? (travelWithLabels[quizAnswers.travelWith] || quizAnswers.travelWith) : null;
      const budget = budgetLabels[quizAnswers.budget] || quizAnswers.budget;
      
      contextMessage = `\n\nCONTEXTO DO USUÁRIO (do quiz de preferências):
- Destino de interesse: ${destination || "Não especificado"}
- Estilo de viagem: ${style || "Não especificado"}
- Orçamento: ${budget || "Não especificado"}
- Período: ${quizAnswers.dates?.startDate || "Não especificado"} a ${quizAnswers.dates?.endDate || "Não especificado"}
- Viajando: ${travelWith || "Não especificado"}
- Acomodação preferida: ${quizAnswers.accommodation || "Não especificado"}
- Interesses: ${quizAnswers.interests?.join(", ") || "Não especificado"}`;
    }

    // Call Lovable AI Gateway with OpenAI model
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + contextMessage },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Lovable AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return {
          statusCode: 429,
          headers: corsHeaders,
          body: JSON.stringify({ error: "Limite de requisições atingido. Aguarde um momento." }),
        };
      }
      
      if (aiResponse.status === 402) {
        return {
          statusCode: 402,
          headers: corsHeaders,
          body: JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o suporte." }),
        };
      }
      
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Erro ao processar sua mensagem" }),
      };
    }

    // Stream the response
    const responseText = await aiResponse.text();
    
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
      body: responseText,
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
