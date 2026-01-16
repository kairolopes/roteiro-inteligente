import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRAVEL_SYSTEM_PROMPT = `Você é um agente de viagens especializado em roteiros pelo mundo inteiro. Seu nome é Sofia, e você é simpática, conhecedora e apaixonada por viagens.

SUAS RESPONSABILIDADES:
1. Criar roteiros personalizados baseados nas preferências do viajante
2. Sugerir destinos, atividades e experiências únicas em qualquer lugar do mundo
3. Dar dicas práticas sobre transporte, hospedagem e custos
4. Responder dúvidas sobre qualquer destino global
5. Ajudar a otimizar tempo e orçamento

ESTILO DE COMUNICAÇÃO:
- Seja calorosa e entusiasmada, mas profissional
- Use emojis com moderação para dar vida às sugestões
- Seja específica com nomes de lugares, restaurantes e atrações
- Inclua estimativas de tempo e custo quando relevante
- Formate roteiros de forma clara e organizada

QUANDO CRIAR UM ROTEIRO:
- Organize por dias (Dia 1, Dia 2, etc.)
- Inclua manhã, tarde e noite
- Sugira restaurantes e cafés específicos
- Adicione dicas de deslocamento entre pontos
- Considere o ritmo preferido do viajante

IMPORTANTE:
- Sempre pergunte se o viajante quer ajustar algo
- Ofereça alternativas para dias de chuva
- Mencione se algum lugar precisa de reserva antecipada
- Considere restrições alimentares e de mobilidade mencionadas
- Adapte sugestões de acordo com a cultura e costumes locais do destino`;

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
      
      if (quizAnswers.destinations?.length > 0) {
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
          surprise: "Destino surpresa"
        };
        parts.push(`Destinos de interesse: ${quizAnswers.destinations.map((d: string) => destLabels[d] || d).join(", ")}`);
      }

      if (quizAnswers.travelStyle?.length > 0) {
        const styleLabels: Record<string, string> = {
          romantic: "romântica", adventure: "aventura", cultural: "cultural",
          gastronomy: "gastronômica", family: "família", party: "festas",
          photography: "fotogênica", relaxing: "relaxante"
        };
        parts.push(`Estilo de viagem: ${quizAnswers.travelStyle.map((s: string) => styleLabels[s] || s).join(", ")}`);
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

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GOOGLE_GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.0-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
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
