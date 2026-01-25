-- Tabela para logs de notificações enviadas
CREATE TABLE public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('welcome', 'purchase_confirmed', 'itinerary_ready', 'custom')),
    channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email', 'sms')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    phone TEXT,
    email TEXT,
    template_name TEXT,
    message_content TEXT,
    variables JSONB DEFAULT '{}',
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações das integrações
CREATE TABLE public.integration_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_name TEXT NOT NULL UNIQUE CHECK (integration_name IN ('zapi', 'notion', 'hotmart')),
    settings JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para templates de mensagens WhatsApp
CREATE TABLE public.whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    content TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar coluna de telefone na tabela profiles se não existir
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- Policies para notification_logs (apenas admins podem ver/gerenciar)
CREATE POLICY "Admins can view all notification logs" ON public.notification_logs
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert notification logs" ON public.notification_logs
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage notification logs" ON public.notification_logs
FOR ALL USING (true) WITH CHECK (true);

-- Policies para integration_settings (apenas admins)
CREATE POLICY "Admins can view integration settings" ON public.integration_settings
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update integration settings" ON public.integration_settings
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage integration settings" ON public.integration_settings
FOR ALL USING (true) WITH CHECK (true);

-- Policies para whatsapp_templates (apenas admins)
CREATE POLICY "Admins can view whatsapp templates" ON public.whatsapp_templates
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage whatsapp templates" ON public.whatsapp_templates
FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage whatsapp templates" ON public.whatsapp_templates
FOR ALL USING (true) WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_integration_settings_updated_at
BEFORE UPDATE ON public.integration_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_templates_updated_at
BEFORE UPDATE ON public.whatsapp_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações iniciais das integrações
INSERT INTO public.integration_settings (integration_name, settings, is_active) VALUES
('zapi', '{"instance_id": "", "token": "", "send_on_purchase": true, "send_on_welcome": true, "send_on_itinerary": true}', false),
('notion', '{"api_key": "", "database_id": "", "sync_leads": true, "sync_customers": true}', false),
('hotmart', '{"webhook_secret": "", "auto_create_user": true, "auto_add_credits": true}', false)
ON CONFLICT (integration_name) DO NOTHING;

-- Inserir templates padrão de WhatsApp
INSERT INTO public.whatsapp_templates (name, display_name, content, variables) VALUES
('welcome', 'Boas-vindas', 'Olá, {nome}! 👋

Bem-vindo(a) ao Viaje com Sofia! ✈️

Estou aqui para criar roteiros de viagem personalizados para você.

🎯 Comece agora: viagecomsofia.com/quiz

Qualquer dúvida, é só responder aqui!

- Sofia 💜', ARRAY['nome']),

('purchase_confirmed', 'Confirmação de Compra', 'Olá, {nome}! 🎉

Seu pagamento foi confirmado! ✅

Agora você tem acesso a {creditos} créditos para criar roteiros personalizados.

🚀 Comece agora: viagecomsofia.com/quiz

Boas viagens!
- Equipe Sofia 💜', ARRAY['nome', 'creditos']),

('itinerary_ready', 'Roteiro Pronto', '{nome}, seu roteiro para {destino} está pronto! 🗺️

📍 {dias} dias de aventura esperando por você.

🔗 Acesse: viagecomsofia.com/itinerary?id={itinerary_id}

Boa viagem! ✈️
- Sofia 💜', ARRAY['nome', 'destino', 'dias', 'itinerary_id'])
ON CONFLICT (name) DO NOTHING;