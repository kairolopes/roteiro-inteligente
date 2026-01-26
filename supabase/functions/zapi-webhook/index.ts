import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-zapi-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate webhook secret
    const webhookSecret = Deno.env.get("ZAPI_WEBHOOK_SECRET");
    const providedSecret = req.headers.get("x-zapi-secret");
    
    // Z-API sends the token in the URL or header
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get("token");
    
    if (webhookSecret && providedSecret !== webhookSecret && tokenParam !== webhookSecret) {
      console.error("Invalid webhook secret");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    console.log("Received webhook:", JSON.stringify(body, null, 2));

    // Z-API webhook types we care about
    const messageTypes = ["ReceivedCallback", "MessageStatusCallback"];
    
    if (!messageTypes.includes(body.type)) {
      console.log("Ignoring webhook type:", body.type);
      return new Response(
        JSON.stringify({ success: true, message: "Webhook type ignored" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Handle incoming message
    if (body.type === "ReceivedCallback" && !body.fromMe) {
      // Extract message content based on message type
      let content = "";
      let messageType = "text";
      let mediaUrl = null;

      if (body.text?.message) {
        content = body.text.message;
        messageType = "text";
      } else if (body.image) {
        content = body.image.caption || "[Imagem]";
        messageType = "image";
        mediaUrl = body.image.imageUrl;
      } else if (body.audio) {
        content = "[Áudio]";
        messageType = "audio";
        mediaUrl = body.audio.audioUrl;
      } else if (body.video) {
        content = body.video.caption || "[Vídeo]";
        messageType = "video";
        mediaUrl = body.video.videoUrl;
      } else if (body.document) {
        content = body.document.fileName || "[Documento]";
        messageType = "document";
        mediaUrl = body.document.documentUrl;
      } else if (body.sticker) {
        content = "[Sticker]";
        messageType = "sticker";
        mediaUrl = body.sticker.stickerUrl;
      }

      // Format phone number (remove @c.us suffix if present)
      const phone = body.phone?.replace(/@.*$/, "") || "";

      const messageData = {
        phone,
        sender_name: body.senderName || null,
        sender_photo: body.senderPhoto || null,
        message_id: body.messageId || null,
        content,
        message_type: messageType,
        media_url: mediaUrl,
        direction: "inbound",
        status: "received",
      };

      const { error } = await supabaseAdmin
        .from("whatsapp_messages")
        .insert(messageData);

      if (error) {
        console.error("Error inserting message:", error);
        throw error;
      }

      console.log("Message saved successfully:", phone);
    }

    // Handle message status update (for sent messages)
    if (body.type === "MessageStatusCallback") {
      const { messageId, status } = body;
      
      if (messageId && status) {
        // Map Z-API status to our status
        const statusMap: Record<string, string> = {
          "SENT": "sent",
          "RECEIVED": "delivered",
          "READ": "read",
          "PLAYED": "read",
        };

        const mappedStatus = statusMap[status] || status.toLowerCase();

        await supabaseAdmin
          .from("whatsapp_messages")
          .update({ status: mappedStatus })
          .eq("message_id", messageId);

        console.log("Message status updated:", messageId, mappedStatus);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
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
