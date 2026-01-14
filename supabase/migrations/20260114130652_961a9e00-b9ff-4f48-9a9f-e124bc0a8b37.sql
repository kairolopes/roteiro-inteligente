-- Add Foursquare columns to places_cache table
ALTER TABLE public.places_cache 
ADD COLUMN IF NOT EXISTS foursquare_id TEXT,
ADD COLUMN IF NOT EXISTS foursquare_rating NUMERIC,
ADD COLUMN IF NOT EXISTS foursquare_tips JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS foursquare_categories JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS foursquare_tastes TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS foursquare_features JSONB DEFAULT '{}'::jsonb;