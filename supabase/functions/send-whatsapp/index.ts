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

    // Initialize Supabase client to fetch admin signature
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Department signatures mapping
    const DEPARTMENT_SIGNATURES: Record<string, string> = {
      suporte: '- Equipe Suporte Sofia 💜',
      vendas: '- Equipe Vendas Sofia 🎯',
      administracao: '- Administração Sofia ⚙️',
      financeiro: '- Equipe Financeiro Sofia 💰',
      marketing: '- Equipe Marketing Sofia 📢',
    };

    // Fetch admin profile and get signature
    let signature = '';
    if (admin_user_id) {
      const { data: adminProfile } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .eq('user_id', admin_user_id)
        .maybeSingle();

      if (adminProfile) {
        if (adminProfile.signature_type === 'personal' && adminProfile.custom_signature) {
          signature = adminProfile.custom_signature;
        } else if (adminProfile.signature_type === 'personal' && adminProfile.display_name) {
          const deptName = adminProfile.department.charAt(0).toUpperCase() + adminProfile.department.slice(1);
          signature = `- ${adminProfile.display_name} (${deptName})`;
        } else {
          signature = DEPARTMENT_SIGNATURES[adminProfile.department] || '';
        }
      }
    }

    // Append signature to message if available
    const finalMessage = signature ? `${message}\n\n${signature}` : message;

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
    
    const zapiClientToken = Deno.env.get("ZAPI_CLIENT_TOKEN");
    
    const zapiResponse = await fetch(zapiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Token": zapiClientToken || "",
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: finalMessage,
      }),
    });

    const zapiResult = await zapiResponse.json();

    const logStatus = zapiResponse.ok ? "sent" : "failed";
    const logData = {
      type: "manual_message",
      channel: "whatsapp",
      phone: formattedPhone,
      message_content: finalMessage,
      status: logStatus,
      sent_at: logStatus === "sent" ? new Date().toISOString() : null,
      error_message: !zapiResponse.ok ? JSON.stringify(zapiResult) : null,
    };

    await supabaseAdmin.from("notification_logs").insert(logData);

    // Also save to whatsapp_messages table for conversation view
    const messageData = {
      phone: formattedPhone,
      content: finalMessage,
      message_type: "text",
      direction: "outbound",
      status: logStatus,
      message_id: zapiResult.messageId || null,
    };

    await supabaseAdmin.from("whatsapp_messages").insert(messageData);

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
