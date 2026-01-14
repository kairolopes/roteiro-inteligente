-- Create a table to cache Google Places search results
CREATE TABLE public.places_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_query TEXT NOT NULL,
  place_id TEXT,
  name TEXT,
  address TEXT,
  rating NUMERIC,
  user_ratings_total INTEGER,
  photo_reference TEXT,
  google_maps_url TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days')
);

-- Create unique index on search query for fast lookups
CREATE UNIQUE INDEX idx_places_cache_query ON public.places_cache (search_query);

-- Create index on expires_at for cleanup queries
CREATE INDEX idx_places_cache_expires ON public.places_cache (expires_at);

-- Enable RLS but allow public read access (cache is not user-specific)
ALTER TABLE public.places_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read from cache
CREATE POLICY "Anyone can read places cache"
ON public.places_cache
FOR SELECT
USING (true);

-- Only service role can insert/update/delete (edge functions use service role)
CREATE POLICY "Service role can manage places cache"
ON public.places_cache
FOR ALL
USING (true)
WITH CHECK (true);