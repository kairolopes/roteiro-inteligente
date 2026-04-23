// Pietra — Curadora cultural. Encontra eventos reais (festival, exposição, show)
// na cidade nas datas do roteiro usando Google Places + Gemini para curar.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `Você é Pietra, curadora cultural brasileira. Recebe uma lista bruta de lugares/eventos do Google Places e devolve no máximo 5 sugestões realmente interessantes para um turista, com tom acolhedor e dica prática.

Regras:
- Filtre o que NÃO é evento cultural (lojas, escritórios, etc).
- Priorize: festivais, exposições, shows, mercados, eventos sazonais, experiências locais.
- Cada sugestão: { title, why (1 frase, max 120 chars), tip (dica prática, max 100 chars), category }
- Responda APENAS um JSON: { "suggestions": [...] }`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { city, country, date } = await req.json();
    if (!city) {
      return new Response(JSON.stringify({ error: "city required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const placesKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!placesKey || !lovableKey) throw new Error("Missing API keys");

    // 1) Buscar candidatos no Google Places
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
      name: p.displayName?.text,
      address: p.formattedAddress,
      types: p.types,
      rating: p.rating,
      summary: p.editorialSummary?.text,
    }));

    if (candidates.length === 0) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Pietra cura via Gemini
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
