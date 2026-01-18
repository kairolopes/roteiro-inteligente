import { useState, useEffect, useCallback, useRef } from 'react';

export interface FlightPrice {
  origin: string;
  destination: string;
  destinationName: string;
  price: number;
  airline: string;
  departureAt: string;
  returnAt: string;
  transfers: number;
  flightNumber: string;
  link: string;
}

interface CacheEntry {
  prices: FlightPrice[];
  timestamp: number;
}

// Cache global para persistir entre re-renders e mudanças de componente
const priceCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

interface UseFlightPricesOptions {
  origin?: string;
  destination?: string;
  enabled?: boolean;
}

interface UseFlightPricesResult {
  prices: FlightPrice[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  fromCache: boolean;
}

export function useFlightPrices(options: UseFlightPricesOptions = {}): UseFlightPricesResult {
  const { origin = 'São Paulo', destination, enabled = true } = options;
  const [prices, setPrices] = useState<FlightPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const getCacheKey = useCallback(() => {
    return `${origin}|${destination || 'all'}`;
  }, [origin, destination]);

  const fetchPrices = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    const cacheKey = getCacheKey();
    const cached = priceCache.get(cacheKey);
    const now = Date.now();

    // Usar cache se válido e não forçando refresh
    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_TTL) {
      setPrices(cached.prices);
      setFromCache(true);
      setError(null);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setFromCache(false);

    try {
      const params = new URLSearchParams({ origin });
      if (destination) params.append('destination', destination);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/flight-prices?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      const fetchedPrices = result.prices || [];
      setPrices(fetchedPrices);

      // Salvar no cache
      priceCache.set(cacheKey, {
        prices: fetchedPrices,
        timestamp: now,
      });
    } catch (err) {
      console.error('Error fetching flight prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      setPrices([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, getCacheKey, origin, destination]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const refetch = useCallback(() => {
    fetchPrices(true);
  }, [fetchPrices]);

  return { prices, isLoading, error, refetch, fromCache };
}

// Destination images for UI
export const destinationImages: Record<string, string> = {
  'LIS': 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600',
  'PAR': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
  'MIA': 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=600',
  'ROM': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600',
  'LON': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600',
  'MAD': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600',
  'NYC': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600',
  'AMS': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600',
  'DXB': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600',
  'CUN': 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=600',
  'BUE': 'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=600',
  'SCL': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600',
  'MCO': 'https://images.unsplash.com/photo-1575089976121-8ed7b2a54265?w=600',
  'BCN': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600',
  'TYO': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600',
  'CPT': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600',
  'CTG': 'https://images.unsplash.com/photo-1583531172005-521bb8cd40b7?w=600',
};

// Format date for display
export function formatFlightDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}
