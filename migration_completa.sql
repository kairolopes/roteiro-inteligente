-- ============================================================
-- VIAGE COM SOFIA - MIGRAÇÃO COMPLETA DO BANCO DE DADOS
-- Execute este script no SQL Editor do seu projeto Supabase
-- Versão: 2.0 - Atualizada com todas as tabelas do projeto
-- ============================================================

-- ============================================================
-- PARTE 1: FUNÇÕES AUXILIARES
-- ============================================================

-- Função para atualizar timestamps automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================
-- PARTE 2: ENUMS
-- ============================================================

-- Enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Enum para departamentos administrativos
CREATE TYPE public.admin_department AS ENUM ('suporte', 'vendas', 'administracao', 'financeiro', 'marketing');

-- Enum para tipo de assinatura
CREATE TYPE public.signature_type AS ENUM ('department', 'personal');

-- ============================================================
-- PARTE 3: TABELA DE PERFIS
-- ============================================================

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Trigger para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PARTE 4: TABELA DE ROLES + FUNÇÃO has_role()
-- ============================================================

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função SECURITY DEFINER para verificar roles (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Políticas RLS para user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- PARTE 5: POLÍTICAS RLS PARA PROFILES (após has_role existir)
-- ============================================================

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- PARTE 6: TABELA DE CRÉDITOS DO USUÁRIO
-- ============================================================

CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  free_itineraries_used INTEGER NOT NULL DEFAULT 0,
  paid_credits INTEGER NOT NULL DEFAULT 0,
  chat_messages_used INTEGER NOT NULL DEFAULT 0,
  chat_messages_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  subscription_type TEXT,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_credits
CREATE POLICY "Users can view their own credits"
  ON public.user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user credits"
  ON public.user_credits FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own credits"
  ON public.user_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON public.user_credits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update user credits"
  ON public.user_credits FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage all credits"
  ON public.user_credits FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PARTE 7: TABELA DE ROTEIROS SALVOS
-- ============================================================

CREATE TABLE public.saved_itineraries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  duration TEXT,
  total_budget TEXT,
  destinations TEXT[],
  itinerary_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.saved_itineraries ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para saved_itineraries
CREATE POLICY "Users can view their own itineraries"
  ON public.saved_itineraries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own itineraries"
  ON public.saved_itineraries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own itineraries"
  ON public.saved_itineraries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own itineraries"
  ON public.saved_itineraries FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_saved_itineraries_updated_at
  BEFORE UPDATE ON public.saved_itineraries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PARTE 8: TABELA DE PREFERÊNCIAS SALVAS
-- ============================================================

CREATE TABLE public.saved_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preferences JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.saved_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para saved_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.saved_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.saved_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.saved_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_saved_preferences_updated_at
  BEFORE UPDATE ON public.saved_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PARTE 9: TABELA DE TRANSAÇÕES
-- ============================================================

CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  credits_added INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all transactions"
  ON public.transactions FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- PARTE 10: TABELA DE CACHE DE LUGARES
-- ============================================================

CREATE TABLE public.places_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_query TEXT NOT NULL,
  name TEXT,
  address TEXT,
  place_id TEXT,
  google_maps_url TEXT,
  photo_reference TEXT,
  rating NUMERIC,
  user_ratings_total INTEGER,
  location_lat NUMERIC,
  location_lng NUMERIC,
  foursquare_id TEXT,
  foursquare_rating NUMERIC,
  foursquare_tips JSONB DEFAULT '[]'::jsonb,
  foursquare_categories JSONB DEFAULT '[]'::jsonb,
  foursquare_features JSONB DEFAULT '{}'::jsonb,
  foursquare_tastes TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days')
);

-- Índices para busca rápida
CREATE INDEX idx_places_cache_query ON public.places_cache(search_query);
CREATE INDEX idx_places_cache_expires ON public.places_cache(expires_at);

-- Habilitar RLS
ALTER TABLE public.places_cache ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para places_cache (público para leitura)
CREATE POLICY "Anyone can read places cache"
  ON public.places_cache FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage places cache"
  ON public.places_cache FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- PARTE 11: TABELA DE CLIQUES EM AFILIADOS
-- ============================================================

CREATE TABLE public.affiliate_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT,
  partner_id TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  category TEXT NOT NULL,
  destination TEXT,
  origin TEXT,
  component TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para affiliate_clicks
CREATE POLICY "Anyone can insert affiliate clicks"
  ON public.affiliate_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own clicks"
  ON public.affiliate_clicks FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- PARTE 12: TABELA DE CACHE DE PREÇOS DE VOOS
-- ============================================================

CREATE TABLE public.flight_price_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  origin_code TEXT NOT NULL,
  destination_code TEXT NOT NULL,
  destination_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  airline TEXT,
  airline_name TEXT,
  flight_number TEXT,
  departure_at TIMESTAMP WITH TIME ZONE,
  return_at TIMESTAMP WITH TIME ZONE,
  transfers INTEGER DEFAULT 0,
  link TEXT,
  is_domestic BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_flight_cache_origin ON public.flight_price_cache(origin_code);
CREATE INDEX idx_flight_cache_destination ON public.flight_price_cache(destination_code);

-- Habilitar RLS
ALTER TABLE public.flight_price_cache ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para flight_price_cache
CREATE POLICY "Anyone can read flight prices"
  ON public.flight_price_cache FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage flight cache"
  ON public.flight_price_cache FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- PARTE 13: TABELA DE LEADS DA LANDING PAGE
-- ============================================================

CREATE TABLE public.landing_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  source TEXT DEFAULT 'landing',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índice para busca por email
CREATE INDEX idx_landing_leads_email ON public.landing_leads(email);

-- Habilitar RLS
ALTER TABLE public.landing_leads ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para landing_leads
CREATE POLICY "Anyone can insert leads"
  ON public.landing_leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all leads"
  ON public.landing_leads FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- PARTE 14: TABELA DE LOGS DE NOTIFICAÇÕES
-- ============================================================

CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  type TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  template_name TEXT,
  variables JSONB DEFAULT '{}'::jsonb,
  message_content TEXT,
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notification_logs
CREATE POLICY "Admins can view all notification logs"
  ON public.notification_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert notification logs"
  ON public.notification_logs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage notification logs"
  ON public.notification_logs FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- PARTE 15: TABELA DE CONFIGURAÇÕES DE INTEGRAÇÕES
-- ============================================================

CREATE TABLE public.integration_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para integration_settings
CREATE POLICY "Admins can view integration settings"
  ON public.integration_settings FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update integration settings"
  ON public.integration_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage integration settings"
  ON public.integration_settings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_integration_settings_updated_at
  BEFORE UPDATE ON public.integration_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PARTE 16: TABELA DE TEMPLATES DE WHATSAPP
-- ============================================================

CREATE TABLE public.whatsapp_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}'::text[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para whatsapp_templates
CREATE POLICY "Admins can view whatsapp templates"
  ON public.whatsapp_templates FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage whatsapp templates"
  ON public.whatsapp_templates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage whatsapp templates"
  ON public.whatsapp_templates FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_whatsapp_templates_updated_at
  BEFORE UPDATE ON public.whatsapp_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PARTE 17: TABELA DE MENSAGENS DE WHATSAPP
-- ============================================================

CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  message_id TEXT,
  direction TEXT NOT NULL, -- 'incoming' ou 'outgoing'
  message_type TEXT NOT NULL DEFAULT 'text',
  content TEXT,
  media_url TEXT,
  sender_name TEXT,
  sender_photo TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_whatsapp_messages_phone ON public.whatsapp_messages(phone);
CREATE INDEX idx_whatsapp_messages_created ON public.whatsapp_messages(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para whatsapp_messages
CREATE POLICY "Admins can view all whatsapp messages"
  ON public.whatsapp_messages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert whatsapp messages"
  ON public.whatsapp_messages FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage all whatsapp messages"
  ON public.whatsapp_messages FOR ALL
  USING (true)
  WITH CHECK (true);

-- Habilitar Realtime para whatsapp_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;

-- ============================================================
-- PARTE 18: TABELAS DE CRM - TAGS
-- ============================================================

CREATE TABLE public.customer_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para customer_tags
CREATE POLICY "Admins can manage customer tags"
  ON public.customer_tags FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabela de atribuição de tags a clientes
CREATE TABLE public.customer_tag_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tag_id UUID NOT NULL REFERENCES public.customer_tags(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, tag_id)
);

-- Habilitar RLS
ALTER TABLE public.customer_tag_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para customer_tag_assignments
CREATE POLICY "Admins can manage tag assignments"
  ON public.customer_tag_assignments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- PARTE 19: TABELA DE NOTAS DE CLIENTES
-- ============================================================

CREATE TABLE public.customer_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  note TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para customer_notes
CREATE POLICY "Admins can manage customer notes"
  ON public.customer_notes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- PARTE 20: TABELA DE USUÁRIOS ADMIN
-- ============================================================

CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  department admin_department NOT NULL DEFAULT 'suporte',
  signature_type signature_type NOT NULL DEFAULT 'department',
  custom_signature TEXT,
  display_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para admin_users
CREATE POLICY "Admins can view own admin profile"
  ON public.admin_users FOR SELECT
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update own admin profile"
  ON public.admin_users FOR UPDATE
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage admin_users"
  ON public.admin_users FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PARTE 21: TABELA DE LOGS DE ATIVIDADE ADMIN
-- ============================================================

CREATE TABLE public.admin_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  target_user_id UUID,
  action_type TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para admin_activity_logs
CREATE POLICY "Admins can view activity logs"
  ON public.admin_activity_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert activity logs"
  ON public.admin_activity_logs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage activity logs"
  ON public.admin_activity_logs FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- PARTE 22: TABELAS HOTMART
-- ============================================================

-- Produtos configurados do Hotmart
CREATE TABLE public.hotmart_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotmart_product_id TEXT NOT NULL UNIQUE,
  product_ucode TEXT,
  name TEXT NOT NULL,
  subscription_type TEXT,
  subscription_days INTEGER,
  credits_to_add INTEGER DEFAULT 0,
  welcome_message TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.hotmart_products ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para hotmart_products
CREATE POLICY "Admins can manage hotmart products"
  ON public.hotmart_products FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage hotmart products"
  ON public.hotmart_products FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_hotmart_products_updated_at
  BEFORE UPDATE ON public.hotmart_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Histórico de compras do Hotmart
CREATE TABLE public.hotmart_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotmart_transaction_id TEXT NOT NULL,
  hotmart_product_id TEXT NOT NULL,
  user_id UUID,
  buyer_email TEXT NOT NULL,
  buyer_name TEXT,
  buyer_phone TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending',
  event_type TEXT NOT NULL,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_hotmart_purchases_email ON public.hotmart_purchases(buyer_email);
CREATE INDEX idx_hotmart_purchases_transaction ON public.hotmart_purchases(hotmart_transaction_id);

-- Habilitar RLS
ALTER TABLE public.hotmart_purchases ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para hotmart_purchases
CREATE POLICY "Admins can view all hotmart purchases"
  ON public.hotmart_purchases FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage hotmart purchases"
  ON public.hotmart_purchases FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage hotmart purchases"
  ON public.hotmart_purchases FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- PARTE 23: FUNÇÕES DE TRIGGER PARA NOVOS USUÁRIOS
-- ============================================================

-- Função para criar perfil automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função para criar créditos automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- PARTE 24: TRIGGERS PARA NOVOS USUÁRIOS
-- ============================================================

-- Trigger para criar perfil ao registrar
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger para criar créditos ao registrar
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_credits();

-- ============================================================
-- PARTE 25: STORAGE - BUCKET DE AVATARES
-- ============================================================

-- Criar bucket de avatares (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Política: qualquer um pode ver avatares
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Política: usuários autenticados podem fazer upload de seu próprio avatar
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política: usuários podem atualizar seu próprio avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política: usuários podem deletar seu próprio avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- PARTE 26: DADOS INICIAIS
-- ============================================================

-- Configurações de integrações (desativadas por padrão)
INSERT INTO public.integration_settings (integration_name, is_active, settings)
VALUES 
  ('zapi', false, '{"instanceId": "", "token": "", "clientToken": ""}'::jsonb),
  ('hotmart', false, '{"hottok": ""}'::jsonb)
ON CONFLICT (integration_name) DO NOTHING;

-- Tags padrão para clientes
INSERT INTO public.customer_tags (name, color)
VALUES 
  ('VIP', '#F59E0B'),
  ('Novo', '#10B981'),
  ('Suporte', '#EF4444'),
  ('Potencial', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

-- Templates de WhatsApp padrão
INSERT INTO public.whatsapp_templates (name, display_name, content, variables)
VALUES 
  ('welcome', 'Boas-vindas', 'Olá {{nome}}! 👋 Seja bem-vindo(a) ao Viaje com Sofia! Estamos aqui para ajudar você a planejar viagens incríveis. Como posso ajudar?', ARRAY['nome']),
  ('itinerary_ready', 'Roteiro Pronto', 'Olá {{nome}}! 🎉 Seu roteiro para {{destino}} está pronto! Acesse agora: {{link}}', ARRAY['nome', 'destino', 'link']),
  ('payment_confirmed', 'Pagamento Confirmado', 'Olá {{nome}}! ✅ Seu pagamento foi confirmado! Você agora tem {{creditos}} créditos disponíveis. Boas viagens! 🌍', ARRAY['nome', 'creditos']),
  ('support', 'Suporte', 'Olá {{nome}}! Como posso ajudar você hoje?', ARRAY['nome'])
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- FIM DA MIGRAÇÃO
-- ============================================================

-- PRÓXIMOS PASSOS:
-- 1. Vá em Authentication > Providers e habilite Email (com auto-confirm)
-- 2. Configure Google OAuth se necessário
-- 3. Execute o deploy das Edge Functions via CLI
-- 4. Configure os secrets no Supabase:
--    - GOOGLE_GEMINI_API_KEY
--    - MP_ACCESS_TOKEN
--    - MP_PUBLIC_KEY
--    - TRAVELPAYOUTS_API_TOKEN
--    - ZAPI_INSTANCE_ID
--    - ZAPI_TOKEN
--    - ZAPI_CLIENT_TOKEN
--    - HOTMART_HOTTOK
--    - FOURSQUARE_API_KEY
--    - UNSPLASH_ACCESS_KEY
-- 5. Para criar um usuário admin, execute no SQL Editor:
--    INSERT INTO public.user_roles (user_id, role) VALUES ('SEU_USER_ID', 'admin');
