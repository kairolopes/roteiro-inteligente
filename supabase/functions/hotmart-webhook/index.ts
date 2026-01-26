import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hotmart-hottok',
};

interface HotmartPayload {
  event: string;
  data: {
    purchase: {
      transaction: string;
      order_date: number;
      approved_date?: number;
      status: string;
      price: {
        value: number;
        currency_code: string;
      };
    };
    product: {
      id: number;
      ucode: string;
      name: string;
    };
    buyer: {
      email: string;
      name: string;
      checkout_phone?: string;
    };
    subscription?: {
      status: string;
      plan: {
        name: string;
      };
    };
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HOTMART_HOTTOK = Deno.env.get('HOTMART_HOTTOK');
    const receivedHottok = req.headers.get('x-hotmart-hottok');

    // Validar hottok
    if (HOTMART_HOTTOK && receivedHottok !== HOTMART_HOTTOK) {
      console.error('Invalid hottok received');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: HotmartPayload = await req.json();
    console.log('Hotmart webhook received:', payload.event);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { event, data } = payload;
    const { purchase, product, buyer, subscription } = data;

    // Extrair dados
    const transactionId = purchase.transaction;
    const productId = String(product.id);
    const productUcode = product.ucode;
    const buyerEmail = buyer.email;
    const buyerName = buyer.name;
    const buyerPhone = buyer.checkout_phone || null;
    const amount = purchase.price.value;
    const currency = purchase.price.currency_code;

    // Mapear status
    let status = 'pending';
    if (event === 'PURCHASE_APPROVED' || event === 'PURCHASE_COMPLETE') {
      status = 'approved';
    } else if (event === 'PURCHASE_CANCELED' || event === 'PURCHASE_REFUNDED') {
      status = 'cancelled';
    } else if (event === 'PURCHASE_CHARGEBACK') {
      status = 'refunded';
    }

    // Registrar compra
    const { error: purchaseError } = await supabase
      .from('hotmart_purchases')
      .upsert({
        hotmart_transaction_id: transactionId,
        hotmart_product_id: productId,
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        amount,
        currency,
        status,
        event_type: event,
        raw_data: payload,
      }, {
        onConflict: 'hotmart_transaction_id',
      });

    if (purchaseError) {
      console.error('Error saving purchase:', purchaseError);
    }

    // Processar apenas compras aprovadas
    if (status === 'approved') {
      // Buscar configuração do produto
      const { data: productConfig } = await supabase
        .from('hotmart_products')
        .select('*')
        .eq('hotmart_product_id', productId)
        .eq('is_active', true)
        .single();

      // Buscar ou criar profile
      let { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', buyerEmail)
        .maybeSingle();

      // Tentar encontrar por email na tabela auth.users via query
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const authUser = authUsers?.users?.find(u => u.email === buyerEmail);
      
      let userId = authUser?.id;

      // Se não existe usuário, criar um
      if (!userId) {
        const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: buyerEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: buyerName,
            source: 'hotmart',
          },
        });

        if (createError) {
          console.error('Error creating user:', createError);
        } else {
          userId = newUser.user?.id;
          console.log('Created new user:', userId);
        }
      }

      // Atualizar profile
      if (userId) {
        await supabase
          .from('profiles')
          .upsert({
            user_id: userId,
            full_name: buyerName,
            phone: buyerPhone,
          }, {
            onConflict: 'user_id',
          });

        // Atualizar compra com user_id
        await supabase
          .from('hotmart_purchases')
          .update({ user_id: userId })
          .eq('hotmart_transaction_id', transactionId);

        // Adicionar créditos se configurado
        if (productConfig) {
          const now = new Date();
          let subscriptionExpires = null;

          if (productConfig.subscription_days) {
            subscriptionExpires = new Date(now.getTime() + productConfig.subscription_days * 24 * 60 * 60 * 1000);
          }

          // Buscar créditos atuais
          const { data: currentCredits } = await supabase
            .from('user_credits')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (currentCredits) {
            // Atualizar créditos existentes
            await supabase
              .from('user_credits')
              .update({
                paid_credits: (currentCredits.paid_credits || 0) + (productConfig.credits_to_add || 0),
                subscription_type: productConfig.subscription_type || currentCredits.subscription_type,
                subscription_expires_at: subscriptionExpires || currentCredits.subscription_expires_at,
              })
              .eq('user_id', userId);
          } else {
            // Criar registro de créditos
            await supabase
              .from('user_credits')
              .insert({
                user_id: userId,
                paid_credits: productConfig.credits_to_add || 0,
                subscription_type: productConfig.subscription_type,
                subscription_expires_at: subscriptionExpires,
              });
          }

          console.log('Credits added:', productConfig.credits_to_add);
        }

        // Adicionar tag "Hotmart" ao cliente
        const { data: hotmartTag } = await supabase
          .from('customer_tags')
          .select('id')
          .eq('name', 'Hotmart')
          .single();

        let tagId = hotmartTag?.id;

        if (!tagId) {
          const { data: newTag } = await supabase
            .from('customer_tags')
            .insert({ name: 'Hotmart', color: '#FF6B00' })
            .select('id')
            .single();
          tagId = newTag?.id;
        }

        if (tagId) {
          await supabase
            .from('customer_tag_assignments')
            .upsert({
              user_id: userId,
              tag_id: tagId,
            }, {
              onConflict: 'user_id,tag_id',
              ignoreDuplicates: true,
            });
        }

        // Enviar WhatsApp de boas-vindas
        if (buyerPhone && productConfig?.welcome_message) {
          const zapiInstanceId = Deno.env.get('ZAPI_INSTANCE_ID');
          const zapiToken = Deno.env.get('ZAPI_TOKEN');

          if (zapiInstanceId && zapiToken) {
            const cleanPhone = buyerPhone.replace(/\D/g, '');
            const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

            const welcomeMessage = productConfig.welcome_message
              .replace('{nome}', buyerName.split(' ')[0])
              .replace('{produto}', product.name);

            try {
              await fetch(`https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/send-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  phone: formattedPhone,
                  message: welcomeMessage,
                }),
              });
              console.log('WhatsApp welcome message sent');
            } catch (whatsappError) {
              console.error('Error sending WhatsApp:', whatsappError);
            }
          }
        }
      }
    }

    // Processar cancelamentos/reembolsos
    if (status === 'cancelled' || status === 'refunded') {
      // Buscar compra para pegar user_id
      const { data: existingPurchase } = await supabase
        .from('hotmart_purchases')
        .select('user_id')
        .eq('hotmart_transaction_id', transactionId)
        .single();

      if (existingPurchase?.user_id) {
        // Buscar configuração do produto para saber quantos créditos remover
        const { data: productConfig } = await supabase
          .from('hotmart_products')
          .select('credits_to_add')
          .eq('hotmart_product_id', productId)
          .single();

        if (productConfig?.credits_to_add) {
          const { data: currentCredits } = await supabase
            .from('user_credits')
            .select('paid_credits')
            .eq('user_id', existingPurchase.user_id)
            .single();

          if (currentCredits) {
            const newCredits = Math.max(0, (currentCredits.paid_credits || 0) - productConfig.credits_to_add);
            await supabase
              .from('user_credits')
              .update({ paid_credits: newCredits })
              .eq('user_id', existingPurchase.user_id);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, event }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
