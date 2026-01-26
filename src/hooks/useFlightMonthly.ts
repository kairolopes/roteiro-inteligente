import { useState, useEffect, useCallback } from 'react';
import { getFlightPricesUrl, getAuthHeaders } from '@/lib/apiRouting';

export interface MonthlyPrice {
  month: string;
  price: number;
  airline: string;
}

export interface UseFlightMonthlyResult {
  monthly: MonthlyPrice[];
  cheapestMonth: MonthlyPrice | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseFlightMonthlyOptions {
  origin: string;
  destination: string;
  enabled?: boolean;
}

export function useFlightMonthly(options: UseFlightMonthlyOptions): UseFlightMonthlyResult {
  const { origin, destination, enabled = true } = options;
  const [monthly, setMonthly] = useState<MonthlyPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonthly = useCallback(async () => {
    if (!enabled || !origin || !destination) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        action: 'monthly',
        origin,
        destination,
      });

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

      setMonthly(result.monthly || []);
    } catch (err) {
      console.error('Error fetching monthly prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch monthly prices');
      setMonthly([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, origin, destination]);

  useEffect(() => {
    fetchMonthly();
  }, [fetchMonthly]);

  // Find cheapest month
  const cheapestMonth = monthly.reduce<MonthlyPrice | null>((cheapest, current) => {
    if (!cheapest || current.price < cheapest.price) {
      return current;
    }
    return cheapest;
  }, null);

  return {
    monthly,
    cheapestMonth,
    isLoading,
    error,
    refetch: fetchMonthly,
  };
}
