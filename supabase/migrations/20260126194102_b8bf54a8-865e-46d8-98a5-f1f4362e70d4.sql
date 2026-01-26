-- ============================================================
-- INTEGRAÇÃO HOTMART - TABELAS E POLÍTICAS
-- ============================================================

-- Tabela de produtos Hotmart (mapeia produtos → créditos/assinaturas)
CREATE TABLE public.hotmart_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotmart_product_id TEXT NOT NULL,
  product_ucode TEXT,
  name TEXT NOT NULL,
  credits_to_add INTEGER DEFAULT 0,
  subscription_type TEXT, -- 'monthly', 'annual', ou null
  subscription_days INTEGER,
  welcome_message TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índice para busca rápida por product_id
CREATE UNIQUE INDEX idx_hotmart_products_product_id ON public.hotmart_products(hotmart_product_id);

-- Tabela de compras Hotmart (histórico de transações)
CREATE TABLE public.hotmart_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotmart_transaction_id TEXT NOT NULL UNIQUE,
  hotmart_product_id TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_name TEXT,
  buyer_phone TEXT,
  user_id UUID, -- Vinculado ao profile após criação
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending', -- approved, cancelled, refunded
  event_type TEXT NOT NULL,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para busca
CREATE INDEX idx_hotmart_purchases_email ON public.hotmart_purchases(buyer_email);
CREATE INDEX idx_hotmart_purchases_status ON public.hotmart_purchases(status);
CREATE INDEX idx_hotmart_purchases_user_id ON public.hotmart_purchases(user_id);

-- Habilitar RLS
ALTER TABLE public.hotmart_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotmart_purchases ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para hotmart_products
CREATE POLICY "Admins can manage hotmart products"
  ON public.hotmart_products FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage hotmart products"
  ON public.hotmart_products FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas RLS para hotmart_purchases
CREATE POLICY "Admins can view all hotmart purchases"
  ON public.hotmart_purchases FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage hotmart purchases"
  ON public.hotmart_purchases FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage hotmart purchases"
  ON public.hotmart_purchases FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_hotmart_products_updated_at
  BEFORE UPDATE ON public.hotmart_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();