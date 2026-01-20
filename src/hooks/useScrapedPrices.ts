import { useState, useCallback } from 'react';

export interface ScrapedPrice {
  site: string;
  name: string;
  color: string;
  price: number | null;
  url: string;
  scrapedAt: string;
  error?: string;
}

interface UseScrapedPricesResult {
  prices: ScrapedPrice[];
  isLoading: boolean;
  error: string | null;
  search: (origin: string, dest: string, date: string) => Promise<void>;
  clear: () => void;
}

export function useScrapedPrices(): UseScrapedPricesResult {
  const [prices, setPrices] = useState<ScrapedPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (origin: string, dest: string, date: string) => {
    setIsLoading(true);
    setError(null);
    setPrices([]);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/flight-scrape-prices?origin=${origin}&dest=${dest}&date=${date}`,
        {
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.prices) {
        setPrices(data.prices);
      } else {
        setError(data.error || 'Erro ao buscar preços');
      }
    } catch (err) {
      console.error('Error fetching scraped prices:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar preços');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setPrices([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return { prices, isLoading, error, search, clear };
}
