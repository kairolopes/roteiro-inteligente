// Sofia — Orquestradora. Decide qual agente chamar (Pietra, Lia, Bruno) ou
// edita o roteiro diretamente, via tool calling do Gemini.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `Você é Sofia, orquestradora do time de agentes de viagem brasileiros. Você NÃO executa tarefas — você delega para o agente certo.

Time:
- **Pietra** (curadora cultural): chame quando o usuário pedir eventos, festivais, shows, exposições, "o que tá rolando".
- **Lia** (local): chame quando o usuário pedir descrições mais autênticas, dicas de quem mora, tom mais real.
- **Bruno** (logística): chame quando o usuário reclamar de cansaço, deslocamento, ordem do dia, otimização.
- **edit_itinerary**: use quando for alteração direta (trocar atividade, mudar horário, adicionar/remover).

Regras:
- Sempre responda em PT-BR amigável.
- Antes de delegar, confirme em 1 frase o que vai fazer ("Vou pedir pra Pietra achar uns eventos pra você...").
- Se o pedido for ambíguo, pergunte antes de chamar agente.`;

const tools = [
  { type: "function", function: { name: "call_pietra", description: "Chama Pietra para sugerir eventos culturais reais na cidade nas datas",
      parameters: { type: "object", properties: { city: { type: "string" }, country: { type: "string" }, date: { type: "string" }, intro: { type: "string" } }, required: ["city", "intro"] } } },
  { type: "function", function: { name: "call_lia", description: "Chama Lia para reescrever descrições de atividades com tom local",
      parameters: { type: "object", properties: { activity_ids: { type: "array", items: { type: "string" } }, city: { type: "string" }, intro: { type: "string" } }, required: ["activity_ids", "city", "intro"] } } },
  { type: "function", function: { name: "call_bruno", description: "Chama Bruno para otimizar a logística de um dia",
      parameters: { type: "object", properties: { day_number: { type: "integer" }, intro: { type: "string" } }, required: ["day_number", "intro"] } } },
  { type: "function", function: { name: "edit_itinerary", description: "Aplica edição direta no roteiro",
      parameters: { type: "object", properties: { instruction: { type: "string" }, intro: { type: "string" } }, required: ["instruction", "intro"] } } },
];

async function logAgentMessage(itineraryId: string | null, userId: string | null, agent: string, role: string, content: string, metadata: any = {}, notifyAdmin = false) {
  if (!itineraryId && !userId) return;
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);
    await sb.from("agent_messages").insert({
      itinerary_id: itineraryId, user_id: userId, agent_name: agent, role, content, metadata, notify_admin: notifyAdmin,
    });
  } catch (e) { console.warn("logAgentMessage failed:", e); }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userMessage, itinerarySummary, history, itineraryId, userId } = await req.json();
    if (!userMessage) {
      return new Response(JSON.stringify({ error: "userMessage required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY missing");

    const messages = [
      { role: "system", content: SYSTEM },
      { role: "system", content: `Resumo do roteiro atual:\n${JSON.stringify(itinerarySummary || {}, null, 2)}` },
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: userMessage },
    ];

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages, tools, tool_choice: "auto", temperature: 0.6 }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Muitas requisições" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "Créditos de IA esgotados" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const choice = aiData.choices?.[0]?.message;
    const toolCalls = choice?.tool_calls || [];
    const text = choice?.content || "";

    const action = toolCalls[0] ? { name: toolCalls[0].function?.name, args: JSON.parse(toolCalls[0].function?.arguments || "{}") } : null;

    // Persist (fire-and-forget)
    logAgentMessage(itineraryId || null, userId || null, "sofia", "user", userMessage);
    if (text || action) {
      logAgentMessage(itineraryId || null, userId || null, "sofia", "assistant", text || `[delegou para ${action?.name}]`, { action });
    }

    return new Response(JSON.stringify({ agent: "sofia", text, action }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("sofia error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
