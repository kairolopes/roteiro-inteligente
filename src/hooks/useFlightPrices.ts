import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getFlightPricesUrl, getAuthHeaders } from '@/lib/apiRouting';

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
  isDomestic?: boolean;
  updatedAt?: string;
}

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
  lastUpdated: Date | null;
}

// Map origin city names to IATA codes
const originToIATA: Record<string, string> = {
  'são paulo': 'SAO',
  'sao paulo': 'SAO',
  'rio de janeiro': 'RIO',
  'brasília': 'BSB',
  'brasilia': 'BSB',
  'fortaleza': 'FOR',
  'salvador': 'SSA',
};

function getOriginCode(origin: string): string {
  const lower = origin.toLowerCase().trim();
  if (/^[A-Z]{3}$/i.test(origin.trim())) {
    return origin.trim().toUpperCase();
  }
  return originToIATA[lower] || 'SAO';
}

export function useFlightPrices(options: UseFlightPricesOptions = {}): UseFlightPricesResult {
  const { origin = 'São Paulo', destination, enabled = true } = options;
  const [prices, setPrices] = useState<FlightPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const originCode = getOriginCode(origin);
      
      let query = supabase
        .from('flight_price_cache')
        .select('*')
        .eq('origin_code', originCode)
        .order('price', { ascending: true });

      if (destination) {
        query = query.eq('destination_code', destination.toUpperCase());
      }

      const { data, error: dbError } = await query.limit(20);

      if (dbError) {
        throw new Error(dbError.message);
      }

      if (data && data.length > 0) {
        const transformedPrices: FlightPrice[] = data.map((row) => ({
          origin: row.origin_code,
          destination: row.destination_code,
          destinationName: row.destination_name,
          price: row.price,
          airline: row.airline_name || row.airline || 'Múltiplas',
          departureAt: row.departure_at || '',
          returnAt: row.return_at || '',
          transfers: row.transfers || 0,
          flightNumber: row.flight_number || '',
          link: row.link || '',
          isDomestic: row.is_domestic || false,
          updatedAt: row.updated_at,
        }));

        setPrices(transformedPrices);
        
        // Set last updated from the most recent entry
        if (data[0]?.updated_at) {
          setLastUpdated(new Date(data[0].updated_at));
        }
      } else {
        // No cached data, try fetching from API as fallback
        await fetchFromAPI();
      }
    } catch (err) {
      console.error('Error fetching flight prices from cache:', err);
      // Try API fallback
      await fetchFromAPI();
    } finally {
      setIsLoading(false);
    }
  }, [enabled, origin, destination]);

  const fetchFromAPI = async () => {
    try {
      const originCode = getOriginCode(origin);
      const params = new URLSearchParams({ origin: originCode });
      if (destination) params.append('destination', destination);

      const response = await fetch(
        getFlightPricesUrl(params),
        { headers: getAuthHeaders() }
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
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching flight prices from API:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      setPrices([]);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const refetch = useCallback(() => {
    fetchPrices();
  }, [fetchPrices]);

  return { prices, isLoading, error, refetch, fromCache: true, lastUpdated };
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
  // Domestic Brazil
  'REC': 'https://images.unsplash.com/photo-1598981457915-aea220950616?w=600',
  'NAT': 'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=600',
  'MCZ': 'https://images.unsplash.com/photo-1590523278191-995cbcda646b?w=600',
  'FLN': 'https://images.unsplash.com/photo-1597466599360-3b9775841aec?w=600',
  'POA': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600',
  'CWB': 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=600',
  'BEL': 'https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?w=600',
  'MAO': 'https://images.unsplash.com/photo-1602271886630-cc1f8c58abf8?w=600',
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

// Get time ago string
export function getTimeAgo(date: Date | null): string {
  if (!date) return '';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `há ${diffMins} min`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  
  return `há ${Math.floor(diffHours / 24)} dias`;
}
