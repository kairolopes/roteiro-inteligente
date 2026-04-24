// Lia — Local. Reescreve descrições de atividades no tom de quem mora na cidade.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `Você é Lia, brasileira que mora há anos na cidade do roteiro. Reescreve descrições genéricas com voz de quem realmente conhece o lugar.

Regras:
- Tom: amigo dando dica, não guia turístico. Português BR, descontraído.
- Sempre inclua 1 dica prática (horário, fila, melhor entrada, o que pedir).
- Máximo 280 caracteres.
- Mencione algo que só quem mora sabe.
- Responda APENAS JSON: { "rewritten": [{ "id": "...", "description": "..." }] }`;

async function logAgentMessage(itineraryId: string | null, userId: string | null, role: string, content: string, metadata: any = {}) {
  if (!itineraryId && !userId) return;
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await sb.from("agent_messages").insert({
      itinerary_id: itineraryId, user_id: userId, agent_name: "lia", role, content, metadata,
    });
  } catch (e) { console.warn("lia log failed:", e); }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { activities, city, itineraryId, userId } = await req.json();
    if (!activities || !Array.isArray(activities)) {
      return new Response(JSON.stringify({ error: "activities array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY missing");

    const input = activities.map((a: any) => ({
      id: a.id, title: a.title, original: a.description || "", category: a.category,
    }));

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Cidade: ${city}\nAtividades:\n${JSON.stringify(input, null, 2)}` },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiRes.ok) throw new Error(`AI error: ${aiRes.status}`);
    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let rewritten: any[] = [];
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) rewritten = JSON.parse(match[0]).rewritten || [];
    } catch { /* ignore */ }

    if (rewritten.length) {
      logAgentMessage(itineraryId || null, userId || null, "tool",
        `Lia reescreveu ${rewritten.length} descrições de ${city} com tom local`,
        { city, count: rewritten.length });
    }

    return new Response(JSON.stringify({ agent: "lia", rewritten }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("lia error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
