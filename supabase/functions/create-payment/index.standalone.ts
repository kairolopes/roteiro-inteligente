// ============================================================
// VERSÃO STANDALONE - create-payment
// Use esta versão após migrar para seu próprio Supabase
// Renomeie para index.ts antes do deploy
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  type: "credits_1" | "credits_5" | "subscription_monthly" | "subscription_annual";
}

const PLANS = {
  credits_1: {
    title: "1 Crédito de Roteiro",
    description: "1 roteiro completo gerado por IA",
    amount: 9.90,
    credits: 1,
  },
  credits_5: {
    title: "5 Créditos de Roteiro",
    description: "5 roteiros completos gerados por IA",
    amount: 39.90,
    credits: 5,
  },
  subscription_monthly: {
    title: "Plano Mensal - TravelPlan Pro",
    description: "10 roteiros + 50 mensagens de chat por mês",
    amount: 29.90,
    credits: 10,
  },
  subscription_annual: {
    title: "Plano Anual - TravelPlan Pro",
    description: "Roteiros ilimitados + chat ilimitado por 1 ano",
    amount: 249.00,
    credits: -1, // unlimited
  },
};

// ============================================================
// CONFIGURAÇÃO: Atualize estas URLs após deploy
// ============================================================
const SITE_URL = "https://www.viagecomsofia.com"; // Seu domínio final

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!mpAccessToken) {
      throw new Error("MP_ACCESS_TOKEN not configured");
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado. Faça login para continuar." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type }: PaymentRequest = await req.json();

    if (!type || !PLANS[type]) {
      return new Response(
        JSON.stringify({ error: "Tipo de plano inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const plan = PLANS[type];

    // Create Mercado Pago preference
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: plan.title,
            description: plan.description,
            quantity: 1,
            currency_id: "BRL",
            unit_price: plan.amount,
          },
        ],
        payer: {
          email: user.email,
        },
        external_reference: JSON.stringify({
          user_id: user.id,
          type: type,
          credits: plan.credits,
        }),
        back_urls: {
          success: `${SITE_URL}/pricing?status=success`,
          failure: `${SITE_URL}/pricing?status=failure`,
          pending: `${SITE_URL}/pricing?status=pending`,
        },
        auto_return: "approved",
        notification_url: `${supabaseUrl}/functions/v1/mp-webhook`,
      }),
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.text();
      console.error("Mercado Pago error:", errorData);
      throw new Error("Erro ao criar pagamento no Mercado Pago");
    }

    const mpData = await mpResponse.json();

    // Save transaction as pending
    const { error: txError } = await supabase.from("transactions").insert({
      user_id: user.id,
      mp_preference_id: mpData.id,
      type: type,
      amount: plan.amount,
      credits_added: plan.credits > 0 ? plan.credits : null,
      status: "pending",
    });

    if (txError) {
      console.error("Error saving transaction:", txError);
    }

    console.log(`Payment preference created for user ${user.id}, type: ${type}, preference_id: ${mpData.id}`);

    return new Response(
      JSON.stringify({
        checkout_url: mpData.init_point,
        preference_id: mpData.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in create-payment:", error);
    const message = error instanceof Error ? error.message : "Erro interno do servidor";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
