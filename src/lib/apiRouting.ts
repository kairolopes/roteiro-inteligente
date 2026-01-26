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
  if (isProduction()) {
    return '/.netlify/functions/generate-itinerary';
  }
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-itinerary`;
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
