import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRAVEL_SYSTEM_PROMPT = `Você é a Sofia, uma agente de viagens simpática, conhecedora e apaixonada por viagens.

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

// Helper para delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função de fetch com retry automático para rate limits e sobrecarga
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 5
): Promise<Response | null> {
  const waitTimes = [5000, 10000, 20000, 30000, 60000]; // 5s, 10s, 20s, 30s, 60s
  const retryableStatuses = [429, 503]; // Rate limit e Model Overloaded
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);
    
    if (retryableStatuses.includes(response.status)) {
      const waitTime = waitTimes[attempt] || 60000;
      console.log(`Error ${response.status}, waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);
      await delay(waitTime);
      continue;
    }
    
    return response;
  }
  
  // Retorna null para indicar que todas as tentativas falharam
  return null;
}

// Função para fazer a chamada com fallback de modelo
async function fetchWithFallback(
  url: string,
  baseOptions: RequestInit,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  apiKey: string
): Promise<Response> {
  const models = ["gemini-3-flash-preview", "gemini-1.5-flash"];
  const retryableStatuses = [429, 503];
  
  for (const model of models) {
    console.log(`Trying model: ${model}`);
    
    const options: RequestInit = {
      ...baseOptions,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    };
    
    const response = await fetchWithRetry(url, options);
    
    // Se response é null ou status é retryável, tentar próximo modelo
    if (!response || retryableStatuses.includes(response.status)) {
      console.log(`Model ${model} failed, trying next model...`);
      continue;
    }
    
    // Resposta válida (sucesso ou erro não-retryável)
    console.log(`Model ${model} responded with status ${response.status}`);
    return response;
  }
  
  // Todos os modelos falharam
  console.log("All models failed");
  return new Response(
    JSON.stringify({ error: "Todos os modelos estão sobrecarregados. Tente novamente em alguns minutos." }),
    { status: 503, headers: { "Content-Type": "application/json" } }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, quizAnswers } = await req.json();
    const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");

    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error("GOOGLE_GEMINI_API_KEY is not configured");
    }

    // Build context from quiz answers
    let contextMessage = "";
    if (quizAnswers) {
      const parts: string[] = [];
      
      // Suporte a múltiplos destinos
      if (quizAnswers.destinations?.length > 0) {
        const destLabels: Record<string, string> = {
          brazil: "Brasil", argentina: "Argentina", peru: "Peru",
          usa: "Estados Unidos", mexico: "México", canada: "Canadá",
          italy: "Itália", france: "França", spain: "Espanha",
          portugal: "Portugal", greece: "Grécia", netherlands: "Holanda",
          germany: "Alemanha", switzerland: "Suíça",
          japan: "Japão", thailand: "Tailândia", indonesia: "Indonésia",
          australia: "Austrália",
          uae: "Emirados Árabes", egypt: "Egito", morocco: "Marrocos", southafrica: "África do Sul",
          surprise: "Destino surpresa"
        };
        const destNames = quizAnswers.destinations.map((d: string) => destLabels[d] || d);
        parts.push(`Destinos selecionados: ${destNames.join(", ")}`);
      } else if (quizAnswers.destination) {
        const destLabels: Record<string, string> = {
          brazil: "Brasil", argentina: "Argentina", peru: "Peru",
          usa: "Estados Unidos", mexico: "México", canada: "Canadá",
          italy: "Itália", france: "França", spain: "Espanha",
          portugal: "Portugal", greece: "Grécia", netherlands: "Holanda",
          germany: "Alemanha", switzerland: "Suíça",
          japan: "Japão", thailand: "Tailândia", indonesia: "Indonésia",
          australia: "Austrália",
          uae: "Emirados Árabes", egypt: "Egito", morocco: "Marrocos", southafrica: "África do Sul",
          surprise: "Destino surpresa"
        };
        parts.push(`Destino: ${destLabels[quizAnswers.destination] || quizAnswers.destination}`);
      }
      
      // Região/cidades específicas
      if (quizAnswers.destinationDetails) {
        parts.push(`Região/cidades específicas: ${quizAnswers.destinationDetails}`);
      }
      
      // Pedidos especiais do usuário (prioridade máxima)
      if (quizAnswers.customRequests) {
        parts.push(`⚠️ PEDIDOS ESPECIAIS DO USUÁRIO: ${quizAnswers.customRequests}`);
      }

      if (quizAnswers.travelStyle) {
        const styleLabels: Record<string, string> = {
          romantic: "romântica", family: "em família", solo: "solo", backpacker: "mochilão"
        };
        parts.push(`Estilo de viagem: ${styleLabels[quizAnswers.travelStyle] || quizAnswers.travelStyle}`);
      }

      if (quizAnswers.accommodation) {
        const accLabels: Record<string, string> = {
          luxury: "luxo", boutique: "boutique", midrange: "confortável",
          budget: "econômico", airbnb: "apartamentos"
        };
        parts.push(`Hospedagem preferida: ${accLabels[quizAnswers.accommodation] || quizAnswers.accommodation}`);
      }

      if (quizAnswers.budget) {
        const budgetLabels: Record<string, string> = {
          economic: "econômico (até R$400/dia)", moderate: "moderado (R$400-800/dia)",
          comfortable: "confortável (R$800-1500/dia)", luxury: "luxo (R$1500+/dia)",
          flexible: "flexível"
        };
        parts.push(`Orçamento: ${budgetLabels[quizAnswers.budget] || quizAnswers.budget}`);
      }

      if (quizAnswers.pace) {
        const paceLabels: Record<string, string> = {
          relaxed: "relaxado", moderate: "moderado", intensive: "intenso"
        };
        parts.push(`Ritmo: ${paceLabels[quizAnswers.pace] || quizAnswers.pace}`);
      }

      if (quizAnswers.duration) {
        const durationLabels: Record<string, string> = {
          weekend: "3-4 dias", week: "7 dias", twoweeks: "14 dias",
          month: "30+ dias", flexible: "flexível"
        };
        parts.push(`Duração: ${durationLabels[quizAnswers.duration] || quizAnswers.duration}`);
      }

      if (quizAnswers.travelWith) {
        const withLabels: Record<string, string> = {
          solo: "sozinho(a)", couple: "casal", friends: "amigos",
          "family-kids": "família com crianças", "family-adults": "família adultos",
          pets: "com pet"
        };
        parts.push(`Viajando: ${withLabels[quizAnswers.travelWith] || quizAnswers.travelWith}`);
      }

      if (quizAnswers.interests?.length > 0) {
        parts.push(`Interesses: ${quizAnswers.interests.join(", ")}`);
      }

      if (quizAnswers.dietary?.length > 0 && !quizAnswers.dietary.includes("none")) {
        parts.push(`Restrições alimentares: ${quizAnswers.dietary.join(", ")}`);
      }

      if (quizAnswers.mobility && quizAnswers.mobility !== "none") {
        parts.push(`Mobilidade: ${quizAnswers.mobility}`);
      }

      if (parts.length > 0) {
        contextMessage = `\n\nCONTEXTO DO VIAJANTE (baseado no quiz de preferências):\n${parts.join("\n")}`;
      }
    }

    const systemPrompt = TRAVEL_SYSTEM_PROMPT + contextMessage;

    const response = await fetchWithFallback(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GOOGLE_GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
      systemPrompt,
      messages,
      GOOGLE_GEMINI_API_KEY
    );

    if (!response.ok) {
      if (response.status === 429 || response.status === 503) {
        return new Response(
          JSON.stringify({ error: "O serviço está sobrecarregado. Por favor, aguarde um momento e tente novamente." }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o suporte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua solicitação. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("chat-travel error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
