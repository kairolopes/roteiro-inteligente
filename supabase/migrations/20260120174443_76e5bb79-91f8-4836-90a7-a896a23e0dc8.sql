-- Create table to cache flight prices
CREATE TABLE public.flight_price_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_code TEXT NOT NULL,
  destination_code TEXT NOT NULL,
  destination_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  airline TEXT,
  airline_name TEXT,
  departure_at TIMESTAMPTZ,
  return_at TIMESTAMPTZ,
  transfers INTEGER DEFAULT 0,
  flight_number TEXT,
  link TEXT,
  is_domestic BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(origin_code, destination_code)
);

-- Indexes for fast queries
CREATE INDEX idx_flight_cache_origin ON public.flight_price_cache(origin_code);
CREATE INDEX idx_flight_cache_price ON public.flight_price_cache(price);
CREATE INDEX idx_flight_cache_updated ON public.flight_price_cache(updated_at);
CREATE INDEX idx_flight_cache_domestic ON public.flight_price_cache(is_domestic);

-- Enable RLS
ALTER TABLE public.flight_price_cache ENABLE ROW LEVEL SECURITY;

-- Public read access (prices are not sensitive data)
CREATE POLICY "Anyone can read flight prices" 
  ON public.flight_price_cache 
  FOR SELECT 
  USING (true);

-- Service role can manage all prices
CREATE POLICY "Service role can manage flight cache" 
  ON public.flight_price_cache 
  FOR ALL 
  USING (true)
  WITH CHECK (true);