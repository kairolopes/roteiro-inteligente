-- Tabela para captura de leads da landing page de vendas
CREATE TABLE public.landing_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  source TEXT DEFAULT 'landing',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.landing_leads ENABLE ROW LEVEL SECURITY;

-- Política para inserção pública (captura de leads)
CREATE POLICY "Anyone can insert leads"
  ON public.landing_leads FOR INSERT
  WITH CHECK (true);

-- Política para leitura apenas por admins (usando função has_role existente)
CREATE POLICY "Admins can view all leads"
  ON public.landing_leads FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Índice para busca por email
CREATE INDEX idx_landing_leads_email ON public.landing_leads(email);

-- Índice para análise de campanhas
CREATE INDEX idx_landing_leads_utm ON public.landing_leads(utm_source, utm_medium, utm_campaign);