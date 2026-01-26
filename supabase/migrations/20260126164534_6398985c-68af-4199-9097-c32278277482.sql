-- ============================================================
-- ADMIN CRM - TABELAS E POLÍTICAS
-- ============================================================

-- Criar tipo enum para departamentos
CREATE TYPE public.admin_department AS ENUM ('suporte', 'vendas', 'administracao', 'financeiro', 'marketing');

-- Criar tipo enum para tipo de assinatura
CREATE TYPE public.signature_type AS ENUM ('department', 'personal');

-- ============================================================
-- TABELA: admin_users - Perfil de administradores
-- ============================================================

CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  department admin_department NOT NULL DEFAULT 'suporte',
  signature_type signature_type NOT NULL DEFAULT 'department',
  custom_signature TEXT,
  display_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para admin_users
CREATE POLICY "Admins can view own admin profile"
ON public.admin_users FOR SELECT
USING (user_id = auth.uid() AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update own admin profile"
ON public.admin_users FOR UPDATE
USING (user_id = auth.uid() AND has_role(auth.uid(), 'admin'));

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
-- TABELA: admin_activity_logs - Log de atividades
-- ============================================================

CREATE TABLE public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para admin_activity_logs
CREATE POLICY "Admins can view activity logs"
ON public.admin_activity_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert activity logs"
ON public.admin_activity_logs FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage activity logs"
ON public.admin_activity_logs FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================
-- POLÍTICAS ADICIONAIS PARA ADMINS
-- ============================================================

-- Admins podem visualizar todos os perfis (para CRM)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins podem visualizar todos os créditos de usuários
CREATE POLICY "Admins can view all user credits"
ON public.user_credits FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins podem atualizar créditos de usuários
CREATE POLICY "Admins can update user credits"
ON public.user_credits FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins podem visualizar todas as transações
CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
USING (has_role(auth.uid(), 'admin'));