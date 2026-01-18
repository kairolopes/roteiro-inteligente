import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface PaymentRequest {
  type: "credits_1" | "credits_5" | "subscription_monthly" | "subscription_annual";
}

const PLANS = {
  credits_1: {
    title: "1 Crédito - Viage com Sofia",
    description: "1 roteiro completo de viagem",
    amount: 9.90,
    credits: 1,
  },
  credits_5: {
    title: "5 Créditos - Viage com Sofia",
    description: "5 roteiros completos de viagem (20% desconto)",
    amount: 39.90,
    credits: 5,
  },
  subscription_monthly: {
    title: "Assinatura Mensal Pro - Viage com Sofia",
    description: "10 roteiros + 50 mensagens de chat por mês",
    amount: 29.90,
    credits: 10,
  },
  subscription_annual: {
    title: "Assinatura Anual Pro - Viage com Sofia",
    description: "Roteiros e chat ilimitados por 1 ano",
    amount: 249.00,
    credits: -1, // unlimited
  },
};

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
    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const SITE_URL = process.env.URL || process.env.DEPLOY_URL || "https://viagecomsofia.com";

    if (!MP_ACCESS_TOKEN) {
      console.error("MP_ACCESS_TOKEN not configured");
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Configuração de pagamento incompleta" }),
      };
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Supabase credentials not configured");
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Configuração do banco de dados incompleta" }),
      };
    }

    // Get user from authorization header
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Não autorizado" }),
      };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Verify the user token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Usuário não autenticado" }),
      };
    }

    const { type } = JSON.parse(event.body || "{}") as PaymentRequest;

    if (!type || !PLANS[type]) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Tipo de plano inválido" }),
      };
    }

    const plan = PLANS[type];

    // Create Mercado Pago preference
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
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
        notification_url: `${SITE_URL}/.netlify/functions/mp-webhook`,
      }),
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error("Mercado Pago error:", mpResponse.status, errorText);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Erro ao criar pagamento no Mercado Pago" }),
      };
    }

    const mpData = await mpResponse.json();

    // Save pending transaction to database
    const { error: dbError } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: type,
      amount: plan.amount,
      credits_added: plan.credits > 0 ? plan.credits : null,
      mp_preference_id: mpData.id,
      status: "pending",
    });

    if (dbError) {
      console.error("Database error:", dbError);
      // Continue anyway - payment can still work
    }

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_url: mpData.init_point,
        preference_id: mpData.id,
      }),
    };
  } catch (error) {
    console.error("Error in create-payment:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Erro interno do servidor" }),
    };
  }
};

export { handler };
