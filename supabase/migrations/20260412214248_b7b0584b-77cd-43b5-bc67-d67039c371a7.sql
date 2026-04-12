
-- Agency settings table
CREATE TABLE public.agency_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agency_name TEXT,
  agency_phone TEXT,
  agency_email TEXT,
  agency_website TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#4f46e5',
  secondary_color TEXT DEFAULT '#1e1b4b',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agency settings"
  ON public.agency_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agency settings"
  ON public.agency_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agency settings"
  ON public.agency_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_agency_settings_updated_at
  BEFORE UPDATE ON public.agency_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for agency assets (logos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('agency-assets', 'agency-assets', true);

CREATE POLICY "Anyone can view agency assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'agency-assets');

CREATE POLICY "Users can upload own agency assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'agency-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own agency assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'agency-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own agency assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'agency-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
