import { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

  console.log("Webhook received:", event.httpMethod);
  console.log("Query params:", event.queryStringParameters);
  console.log("Body:", event.body);

  try {
    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!MP_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing environment variables");
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Configuration error" }),
      };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse webhook data
    let paymentId: string | null = null;
    let topic: string | null = null;

    // Check query params first (Mercado Pago IPN)
    if (event.queryStringParameters?.id && event.queryStringParameters?.topic) {
      paymentId = event.queryStringParameters.id;
      topic = event.queryStringParameters.topic;
    }

    // Check body for webhook format
    if (event.body) {
      try {
        const body = JSON.parse(event.body);
        if (body.data?.id) {
          paymentId = body.data.id.toString();
        }
        if (body.type) {
          topic = body.type;
        }
      } catch (e) {
        console.log("Body is not JSON, continuing with query params");
      }
    }

    console.log(`Processing: topic=${topic}, paymentId=${paymentId}`);

    // Only process payment events
    if (topic !== "payment" && topic !== "merchant_order") {
      console.log("Ignoring non-payment event:", topic);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ received: true, ignored: true }),
      };
    }

    if (!paymentId) {
      console.log("No payment ID provided");
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ received: true, error: "No payment ID" }),
      };
    }

    // Fetch payment details from Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
    });

    if (!mpResponse.ok) {
      console.error("Error fetching payment:", mpResponse.status);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ received: true, error: "Could not fetch payment" }),
      };
    }

    const payment = await mpResponse.json();
    console.log("Payment data:", JSON.stringify(payment, null, 2));

    // Parse external reference
    let externalRef: { user_id: string; type: string; credits: number } | null = null;
    try {
      if (payment.external_reference) {
        externalRef = JSON.parse(payment.external_reference);
      }
    } catch (e) {
      console.error("Error parsing external_reference:", e);
    }

    if (!externalRef) {
      console.error("No external reference found");
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ received: true, error: "No external reference" }),
      };
    }

    const { user_id, type, credits } = externalRef;

    // Map Mercado Pago status to internal status
    const statusMap: Record<string, string> = {
      approved: "completed",
      pending: "pending",
      authorized: "pending",
      in_process: "pending",
      in_mediation: "pending",
      rejected: "failed",
      cancelled: "failed",
      refunded: "refunded",
      charged_back: "refunded",
    };

    const internalStatus = statusMap[payment.status] || "pending";

    // Update transaction in database
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        status: internalStatus,
        mp_payment_id: paymentId,
      })
      .eq("mp_preference_id", payment.preference_id);

    if (updateError) {
      console.error("Error updating transaction:", updateError);
    }

    // If payment approved, add credits or subscription
    if (payment.status === "approved") {
      console.log(`Payment approved! Adding credits for user ${user_id}`);

      if (type.startsWith("subscription_")) {
        // Handle subscription
        const isAnnual = type === "subscription_annual";
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + (isAnnual ? 12 : 1));

        const { error: subError } = await supabase
          .from("user_credits")
          .upsert({
            user_id: user_id,
            subscription_type: isAnnual ? "annual" : "monthly",
            subscription_expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

        if (subError) {
          console.error("Error updating subscription:", subError);
        } else {
          console.log(`Subscription activated until ${expiresAt.toISOString()}`);
        }
      } else {
        // Handle credits
        const { data: currentCredits, error: fetchError } = await supabase
          .from("user_credits")
          .select("paid_credits")
          .eq("user_id", user_id)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error fetching credits:", fetchError);
        }

        const newCredits = (currentCredits?.paid_credits || 0) + credits;

        const { error: creditError } = await supabase
          .from("user_credits")
          .upsert({
            user_id: user_id,
            paid_credits: newCredits,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

        if (creditError) {
          console.error("Error updating credits:", creditError);
        } else {
          console.log(`Credits updated to ${newCredits}`);
        }
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ received: true, processed: true }),
    };
  } catch (error) {
    console.error("Error in mp-webhook:", error);
    return {
      statusCode: 200, // Always return 200 to MP to avoid retries
      headers: corsHeaders,
      body: JSON.stringify({ received: true, error: "Internal error" }),
    };
  }
};

export { handler };
