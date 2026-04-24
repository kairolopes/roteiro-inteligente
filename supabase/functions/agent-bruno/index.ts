// Bruno — Logística. Reorganiza atividades de um dia para minimizar deslocamento.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `Você é Bruno, especialista em logística de viagens. Recebe atividades de um dia com coordenadas e tempos de deslocamento. Reorganiza para minimizar deslocamento total, respeitando horários fixos.

Regras:
- Mantenha refeições próximas dos horários (almoço 12-14h, jantar 19-21h).
- Atividades com "fixed_time": true não mudam.
- Devolva nova ordem otimizada e explicação curta em PT-BR.
- Responda APENAS JSON: { "optimized_order": ["id1","id2",...], "saved_minutes": N, "explanation": "..." }`;

async function getDistanceMatrix(origins: string[], destinations: string[], apiKey: string) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins.join("|"))}&destinations=${encodeURIComponent(destinations.join("|"))}&mode=transit&key=${apiKey}`;
  const res = await fetch(url);
  return res.json();
}

async function logAgentMessage(itineraryId: string | null, userId: string | null, role: string, content: string, metadata: any = {}) {
  if (!itineraryId && !userId) return;
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await sb.from("agent_messages").insert({
      itinerary_id: itineraryId, user_id: userId, agent_name: "bruno", role, content, metadata,
    });
  } catch (e) { console.warn("bruno log failed:", e); }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { activities, itineraryId, userId, dayNumber } = await req.json();
    if (!activities || activities.length < 2) {
      return new Response(JSON.stringify({ error: "need at least 2 activities" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const placesKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY missing");

    const coords = activities
      .filter((a: any) => a.coordinates?.lat && a.coordinates?.lng)
      .map((a: any) => `${a.coordinates.lat},${a.coordinates.lng}`);

    let matrix: any = null;
    if (placesKey && coords.length >= 2) {
      try { matrix = await getDistanceMatrix(coords, coords, placesKey); }
      catch (e) { console.warn("distance matrix failed:", e); }
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Atividades:\n${JSON.stringify(activities.map((a: any) => ({
            id: a.id, title: a.title, time: a.time, category: a.category, location: a.location, coordinates: a.coordinates,
          })), null, 2)}\n\nMatriz:\n${matrix ? JSON.stringify(matrix.rows, null, 2) : "indisponível, estime"}` },
        ],
        temperature: 0.2,
      }),
    });

    if (!aiRes.ok) throw new Error(`AI error: ${aiRes.status}`);
    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let result: any = { optimized_order: [], saved_minutes: 0, explanation: "" };
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) result = JSON.parse(match[0]);
    } catch { /* ignore */ }

    if (result.optimized_order?.length) {
      logAgentMessage(itineraryId || null, userId || null, "tool",
        `Bruno reorganizou Dia ${dayNumber || "?"}: ${result.explanation || "ordem otimizada"} (~${result.saved_minutes || 0}min economizados)`,
        { dayNumber, ...result });
    }

    return new Response(JSON.stringify({ agent: "bruno", ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("bruno error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
