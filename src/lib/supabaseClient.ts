// Supabase client configuration for standalone deployment
// This file uses environment variables that can be configured in Netlify
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Missing Supabase environment variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
}

export const supabaseClient = createClient<Database>(
  SUPABASE_URL || '',
  SUPABASE_PUBLISHABLE_KEY || '',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Helper function to get the base URL for Netlify Functions
export const getNetlifyFunctionsUrl = () => {
  // In development, use relative path
  // In production, use the site URL
  if (import.meta.env.DEV) {
    return '/.netlify/functions';
  }
  // Use relative path which works in production too
  return '/.netlify/functions';
};

// Export for compatibility
export { supabaseClient as supabase };
