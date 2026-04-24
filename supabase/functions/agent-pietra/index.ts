// Pietra — Curadora cultural. Encontra eventos reais usando Google Places + Gemini.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `Você é Pietra, curadora cultural brasileira. Recebe uma lista bruta do Google Places e devolve no máximo 5 sugestões realmente interessantes para um turista, com tom acolhedor e dica prática.

Regras:
- Filtre o que NÃO é evento cultural (lojas, escritórios).
- Priorize: festivais, exposições, shows, mercados, eventos sazonais.
- Cada sugestão: { title, why (max 120 chars), tip (max 100 chars), category, is_event (boolean — true se for evento com data específica), relevance_score (0..1) }
- Responda APENAS JSON: { "suggestions": [...] }`;

async function logAgentMessage(itineraryId: string | null, userId: string | null, role: string, content: string, metadata: any = {}, notifyAdmin = false) {
  if (!itineraryId && !userId) return;
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await sb.from("agent_messages").insert({
      itinerary_id: itineraryId, user_id: userId, agent_name: "pietra", role, content, metadata, notify_admin: notifyAdmin,
    });
  } catch (e) { console.warn("pietra log failed:", e); }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { city, country, date, itineraryId, userId } = await req.json();
    if (!city) {
      return new Response(JSON.stringify({ error: "city required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const placesKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!placesKey || !lovableKey) throw new Error("Missing API keys");

    const query = `eventos culturais festivais exposições em ${city}${country ? ", " + country : ""}`;
    const placesRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": placesKey,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.types,places.rating,places.editorialSummary",
      },
      body: JSON.stringify({ textQuery: query, languageCode: "pt-BR", maxResultCount: 15 }),
    });

    const placesData = await placesRes.json();
    const candidates = (placesData.places || []).map((p: any) => ({
      name: p.displayName?.text, address: p.formattedAddress, types: p.types, rating: p.rating, summary: p.editorialSummary?.text,
    }));

    if (candidates.length === 0) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Cidade: ${city}\nData: ${date || "próximos dias"}\nCandidatos:\n${JSON.stringify(candidates, null, 2)}` },
        ],
        temperature: 0.5,
      }),
    });

    if (!aiRes.ok) throw new Error(`AI error: ${aiRes.status}`);
    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let suggestions: any[] = [];
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) suggestions = JSON.parse(match[0]).suggestions || [];
    } catch { /* ignore */ }

    // Notifica admin se Pietra achou evento relevante
    const hotEvents = suggestions.filter((s: any) => s.is_event === true || (typeof s.relevance_score === "number" && s.relevance_score >= 0.8));
    if (hotEvents.length) {
      const summary = hotEvents.slice(0, 3).map((s: any) => `🎭 ${s.title}`).join(" • ");
      logAgentMessage(itineraryId || null, userId || null, "tool",
        `Pietra encontrou ${hotEvents.length} evento(s) em ${city}: ${summary}`,
        { city, date, events: hotEvents }, true);
    } else if (suggestions.length) {
      logAgentMessage(itineraryId || null, userId || null, "tool",
        `Pietra sugeriu ${suggestions.length} lugares culturais em ${city}`,
        { city, suggestions }, false);
    }

    return new Response(JSON.stringify({ agent: "pietra", suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("pietra error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
