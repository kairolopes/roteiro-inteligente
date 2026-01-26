import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, message, admin_user_id } = await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: "Phone and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const zapiInstanceId = Deno.env.get("ZAPI_INSTANCE_ID");
    const zapiToken = Deno.env.get("ZAPI_TOKEN");

    if (!zapiInstanceId || !zapiToken) {
      console.error("Z-API credentials not configured");
      return new Response(
        JSON.stringify({ error: "Z-API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format phone number (remove any non-digit characters)
    const formattedPhone = phone.replace(/\D/g, '');

    // Send message via Z-API
    const zapiUrl = `https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/send-text`;
    
    const zapiResponse = await fetch(zapiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: message,
      }),
    });

    const zapiResult = await zapiResponse.json();

    // Log the notification
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const logStatus = zapiResponse.ok ? "sent" : "failed";
    const logData = {
      type: "manual_message",
      channel: "whatsapp",
      phone: formattedPhone,
      message_content: message,
      status: logStatus,
      sent_at: logStatus === "sent" ? new Date().toISOString() : null,
      error_message: !zapiResponse.ok ? JSON.stringify(zapiResult) : null,
    };

    await supabaseAdmin.from("notification_logs").insert(logData);

    // Log admin activity if admin_user_id provided
    if (admin_user_id) {
      await supabaseAdmin.from("admin_activity_logs").insert({
        admin_user_id,
        action_type: "send_whatsapp",
        details: {
          phone: formattedPhone,
          status: logStatus,
        },
      });
    }

    if (!zapiResponse.ok) {
      console.error("Z-API error:", zapiResult);
      return new Response(
        JSON.stringify({ error: "Failed to send message", details: zapiResult }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, result: zapiResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
