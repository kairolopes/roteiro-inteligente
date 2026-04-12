import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é Sofia, assistente de viagens. O usuário tem um roteiro gerado e quer fazer ajustes.

REGRAS:
1. Receba o roteiro atual em JSON e o pedido do usuário
2. Retorne o roteiro COMPLETO modificado no mesmo formato JSON
3. Mantenha TODOS os campos existentes (id, coordinates, etc.)
4. Aplique APENAS as alterações pedidas
5. Se o usuário pedir para adicionar algo, adicione com dados realistas
6. Se pedir para remover, remova
7. Se pedir para trocar, substitua
8. Mantenha IDs únicos para novas atividades (use formato "adj-{timestamp}-{index}")
9. Responda APENAS com o JSON do roteiro atualizado, sem explicações

FORMATO DE RESPOSTA: JSON puro do roteiro completo atualizado.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { itinerary, userRequest } = await req.json();

    if (!itinerary || !userRequest) {
      return new Response(
        JSON.stringify({ error: "itinerary and userRequest are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `ROTEIRO ATUAL:\n${JSON.stringify(itinerary, null, 2)}\n\nPEDIDO DE ALTERAÇÃO:\n${userRequest}`
          }
        ],
        temperature: 0.3,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error('AI Gateway error:', response.status, errData);
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty AI response');
    }

    // Extract JSON from response
    let updatedItinerary;
    try {
      // Try direct parse
      updatedItinerary = JSON.parse(content);
    } catch {
      // Try extracting from markdown code block
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        updatedItinerary = JSON.parse(jsonMatch[1].trim());
      } else {
        // Try finding JSON object
        const braceMatch = content.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          updatedItinerary = JSON.parse(braceMatch[0]);
        } else {
          throw new Error('Could not parse AI response as JSON');
        }
      }
    }

    return new Response(
      JSON.stringify({ itinerary: updatedItinerary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in adjust-itinerary:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
