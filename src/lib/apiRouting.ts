/**
 * API Routing Helper
 * 
 * Routes API calls to Netlify Functions in production or Supabase Edge Functions in development.
 * This ensures the application works independently of Lovable Cloud.
 */

export const isProduction = (): boolean => {
  const hostname = window.location.hostname;
  return hostname.includes('viagecomsofia') || hostname.includes('netlify.app');
};

export const getFlightPricesUrl = (params: URLSearchParams): string => {
  if (isProduction()) {
    return `/.netlify/functions/flight-prices?${params.toString()}`;
  }
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/flight-prices?${params.toString()}`;
};

export const getChatUrl = (): string => {
  if (isProduction()) {
    return '/.netlify/functions/chat-travel';
  }
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-travel`;
};

export const getGenerateItineraryUrl = (): string => {
  // Always use Lovable Cloud Edge Function for itinerary generation
  // Netlify Functions have a 10s timeout limit which is too short for AI generation
  // Using the Lovable Cloud project directly since the Edge Function is deployed there
  return 'https://rvmvoogyrafiogxdbisx.supabase.co/functions/v1/generate-itinerary';
};

export const getCreatePaymentUrl = (): string => {
  if (isProduction()) {
    return '/.netlify/functions/create-payment';
  }
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment`;
};

// Get auth headers for API calls
export const getAuthHeaders = (): Record<string, string> => {
  return {
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    'Content-Type': 'application/json',
  };
};

// Get auth headers specifically for Lovable Cloud Edge Functions
export const getLovableCloudAuthHeaders = (): Record<string, string> => {
  return {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bXZvb2d5cmFmaW9neGRiaXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNjQ4MjksImV4cCI6MjA4Mzk0MDgyOX0.3ZXQhOP7NJ4JfSr3AFuuIOJKN7SLd-tZ5XpeU6SWagY',
    'Content-Type': 'application/json',
  };
};
