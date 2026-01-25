-- Tabela de tags para categorizar clientes
CREATE TABLE IF NOT EXISTS public.customer_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de relacionamento cliente-tag
CREATE TABLE IF NOT EXISTS public.customer_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tag_id UUID NOT NULL REFERENCES public.customer_tags(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tag_id)
);

-- Tabela de notas sobre clientes
CREATE TABLE IF NOT EXISTS public.customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  note TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para customer_tags (apenas admins)
CREATE POLICY "Admins can manage customer tags"
  ON public.customer_tags
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para customer_tag_assignments (apenas admins)
CREATE POLICY "Admins can manage tag assignments"
  ON public.customer_tag_assignments
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Políticas RLS para customer_notes (apenas admins)
CREATE POLICY "Admins can manage customer notes"
  ON public.customer_notes
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Inserir algumas tags padrão
INSERT INTO public.customer_tags (name, color) VALUES
  ('VIP', '#FFD700'),
  ('Novo', '#22C55E'),
  ('Suporte', '#EF4444'),
  ('Potencial', '#8B5CF6')
ON CONFLICT DO NOTHING;