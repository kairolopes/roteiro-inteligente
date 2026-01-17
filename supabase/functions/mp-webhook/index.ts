import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Use service role for webhook processing
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    // Mercado Pago sends notifications with different types
    if (body.type === "payment" || body.action === "payment.updated" || body.action === "payment.created") {
      const paymentId = body.data?.id;
      
      if (!paymentId) {
        console.log("No payment ID in webhook body");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch payment details from Mercado Pago
      const mpPaymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${mpAccessToken}`,
          },
        }
      );

      if (!mpPaymentResponse.ok) {
        console.error("Error fetching payment from MP:", await mpPaymentResponse.text());
        return new Response(JSON.stringify({ error: "Error fetching payment" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const payment = await mpPaymentResponse.json();
      console.log("Payment details:", JSON.stringify(payment));

      // Parse external_reference to get user_id and type
      let externalRef;
      try {
        externalRef = JSON.parse(payment.external_reference || "{}");
      } catch {
        console.error("Invalid external_reference:", payment.external_reference);
        return new Response(JSON.stringify({ error: "Invalid reference" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { user_id, type, credits } = externalRef;

      if (!user_id || !type) {
        console.error("Missing user_id or type in reference");
        return new Response(JSON.stringify({ error: "Missing reference data" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Map MP status to our status
      const statusMap: Record<string, string> = {
        approved: "approved",
        pending: "pending",
        in_process: "pending",
        rejected: "rejected",
        cancelled: "cancelled",
        refunded: "cancelled",
      };

      const status = statusMap[payment.status] || "pending";

      // Update transaction status
      const { error: txUpdateError } = await supabase
        .from("transactions")
        .update({
          mp_payment_id: String(paymentId),
          status: status,
        })
        .eq("user_id", user_id)
        .eq("type", type)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1);

      if (txUpdateError) {
        console.error("Error updating transaction:", txUpdateError);
      }

      // If payment is approved, update user credits
      if (status === "approved") {
        console.log(`Payment approved for user ${user_id}, type: ${type}, credits: ${credits}`);

        // Get current user credits
        const { data: currentCredits, error: creditsError } = await supabase
          .from("user_credits")
          .select("*")
          .eq("user_id", user_id)
          .single();

        if (creditsError && creditsError.code !== "PGRST116") {
          console.error("Error fetching credits:", creditsError);
        }

        if (type === "credits_1" || type === "credits_5") {
          // Add credits
          const newCredits = (currentCredits?.paid_credits || 0) + credits;
          
          const { error: updateError } = await supabase
            .from("user_credits")
            .upsert({
              user_id: user_id,
              paid_credits: newCredits,
              updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" });

          if (updateError) {
            console.error("Error updating credits:", updateError);
          } else {
            console.log(`Added ${credits} credits to user ${user_id}. New total: ${newCredits}`);
          }
        } else if (type === "subscription_monthly") {
          // Set monthly subscription
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);

          const { error: updateError } = await supabase
            .from("user_credits")
            .upsert({
              user_id: user_id,
              subscription_type: "monthly",
              subscription_expires_at: expiresAt.toISOString(),
              paid_credits: (currentCredits?.paid_credits || 0) + 10,
              chat_messages_used: 0,
              chat_messages_reset_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" });

          if (updateError) {
            console.error("Error updating subscription:", updateError);
          } else {
            console.log(`Monthly subscription activated for user ${user_id} until ${expiresAt}`);
          }
        } else if (type === "subscription_annual") {
          // Set annual subscription
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);

          const { error: updateError } = await supabase
            .from("user_credits")
            .upsert({
              user_id: user_id,
              subscription_type: "annual",
              subscription_expires_at: expiresAt.toISOString(),
              chat_messages_used: 0,
              chat_messages_reset_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" });

          if (updateError) {
            console.error("Error updating subscription:", updateError);
          } else {
            console.log(`Annual subscription activated for user ${user_id} until ${expiresAt}`);
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Webhook processing error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
