-- Create table to track affiliate clicks
CREATE TABLE public.affiliate_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  category TEXT NOT NULL,
  component TEXT,
  destination TEXT,
  origin TEXT,
  user_id UUID,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert clicks (anonymous tracking)
CREATE POLICY "Anyone can insert affiliate clicks"
ON public.affiliate_clicks
FOR INSERT
WITH CHECK (true);

-- Only authenticated users can view their own clicks
CREATE POLICY "Users can view their own clicks"
ON public.affiliate_clicks
FOR SELECT
USING (auth.uid() = user_id);

-- Create index for analytics queries
CREATE INDEX idx_affiliate_clicks_partner ON public.affiliate_clicks(partner_id);
CREATE INDEX idx_affiliate_clicks_category ON public.affiliate_clicks(category);
CREATE INDEX idx_affiliate_clicks_created_at ON public.affiliate_clicks(created_at DESC);