-- Tabela para persistir mensagens dos agentes (replay no admin)
CREATE TABLE public.agent_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id uuid,
  user_id uuid,
  agent_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant','system','tool')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_messages_itinerary ON public.agent_messages(itinerary_id);
CREATE INDEX idx_agent_messages_user ON public.agent_messages(user_id);
CREATE INDEX idx_agent_messages_created ON public.agent_messages(created_at DESC);

ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agent messages"
ON public.agent_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent messages"
ON public.agent_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all agent messages"
ON public.agent_messages FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage agent messages"
ON public.agent_messages FOR ALL
USING (true) WITH CHECK (true);

-- Tabela de cotações (leads quentes do roteiro pro WhatsApp da agência)
CREATE TABLE public.quote_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  agency_id uuid,
  itinerary_id uuid,
  itinerary_title text,
  day_number integer,
  destination text,
  type text NOT NULL CHECK (type IN ('hotel','flight','tour','activity','full_package','other')),
  message_sent text,
  contact_name text,
  contact_phone text,
  contact_email text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','negotiating','closed','lost')),
  closed_value numeric,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  closed_at timestamp with time zone
);

CREATE INDEX idx_quote_requests_agency ON public.quote_requests(agency_id);
CREATE INDEX idx_quote_requests_user ON public.quote_requests(user_id);
CREATE INDEX idx_quote_requests_status ON public.quote_requests(status);
CREATE INDEX idx_quote_requests_created ON public.quote_requests(created_at DESC);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Inserção pública (cliente final pode estar deslogado vendo roteiro compartilhado)
CREATE POLICY "Anyone can create quote requests"
ON public.quote_requests FOR INSERT
WITH CHECK (true);

-- Usuário vê suas próprias cotações
CREATE POLICY "Users can view their own quote requests"
ON public.quote_requests FOR SELECT
USING (auth.uid() = user_id);

-- Agência (dona do agency_settings) vê cotações da sua agência
CREATE POLICY "Agency owner can view their quote requests"
ON public.quote_requests FOR SELECT
USING (auth.uid() = agency_id);

CREATE POLICY "Agency owner can update their quote requests"
ON public.quote_requests FOR UPDATE
USING (auth.uid() = agency_id);

-- Admins gerenciam tudo
CREATE POLICY "Admins can view all quote requests"
ON public.quote_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all quote requests"
ON public.quote_requests FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage quote requests"
ON public.quote_requests FOR ALL
USING (true) WITH CHECK (true);

CREATE TRIGGER update_quote_requests_updated_at
BEFORE UPDATE ON public.quote_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime para o painel "Bloomberg"
ALTER PUBLICATION supabase_realtime ADD TABLE public.quote_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_messages;