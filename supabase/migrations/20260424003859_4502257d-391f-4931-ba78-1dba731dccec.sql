ALTER TABLE public.agent_messages 
ADD COLUMN IF NOT EXISTS notify_admin BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.agent_messages REPLICA IDENTITY FULL;