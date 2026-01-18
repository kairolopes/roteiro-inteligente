-- ============================================================
-- VIAGE COM SOFIA - MIGRAÇÃO COMPLETA DO BANCO DE DADOS
-- Execute este script no SQL Editor do seu projeto Supabase
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
-- PARTE 2: TABELA DE PERFIS
-- ============================================================

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- PARTE 3: TABELA DE CRÉDITOS DO USUÁRIO
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

CREATE POLICY "Users can insert their own credits"
  ON public.user_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON public.user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para service role (webhooks)
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
-- PARTE 4: TABELA DE ROTEIROS SALVOS
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
-- PARTE 5: TABELA DE PREFERÊNCIAS SALVAS
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
-- PARTE 6: TABELA DE TRANSAÇÕES
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

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para service role (webhooks)
CREATE POLICY "Service role can manage all transactions"
  ON public.transactions FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- PARTE 7: TABELA DE CACHE DE LUGARES
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

-- Política para service role (edge functions)
CREATE POLICY "Service role can manage places cache"
  ON public.places_cache FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- PARTE 8: FUNÇÕES DE TRIGGER PARA NOVOS USUÁRIOS
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
-- PARTE 9: TRIGGERS PARA NOVOS USUÁRIOS
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
-- PARTE 10: STORAGE - BUCKET DE AVATARES
-- ============================================================

-- Criar bucket de avatares (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

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
-- FIM DA MIGRAÇÃO
-- ============================================================

-- PRÓXIMOS PASSOS:
-- 1. Vá em Authentication > Providers e habilite Email (com auto-confirm)
-- 2. Configure Google OAuth se necessário
-- 3. Execute o deploy das Edge Functions via CLI
-- 4. Configure os secrets: GOOGLE_GEMINI_API_KEY, MP_ACCESS_TOKEN, MP_PUBLIC_KEY
