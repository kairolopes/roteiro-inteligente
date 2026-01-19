import { useState, useCallback } from 'react';
import { FlightPrice } from './useFlightPrices';

export interface UseFlightSearchResult {
  flights: FlightPrice[];
  isLoading: boolean;
  error: string | null;
  origin: string;
  destination: string;
  destinationName: string;
  date: string;
  search: (origin: string, destination: string, date: string) => Promise<void>;
  clear: () => void;
}

export function useFlightSearch(): UseFlightSearchResult {
  const [flights, setFlights] = useState<FlightPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originCode, setOriginCode] = useState('');
  const [destCode, setDestCode] = useState('');
  const [destName, setDestName] = useState('');
  const [searchDate, setSearchDate] = useState('');

  const search = useCallback(async (origin: string, destination: string, date: string) => {
    if (!origin || !destination || !date) {
      setError('Preencha origem, destino e data');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFlights([]);

    try {
      const params = new URLSearchParams({
        action: 'search',
        origin,
        destination,
        date,
      });

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

      setFlights(result.flights || []);
      setOriginCode(result.origin || origin);
      setDestCode(result.destination || destination);
      setDestName(result.destinationName || destination);
      setSearchDate(date);
    } catch (err) {
      console.error('Error searching flights:', err);
      setError(err instanceof Error ? err.message : 'Failed to search flights');
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setFlights([]);
    setError(null);
    setOriginCode('');
    setDestCode('');
    setDestName('');
    setSearchDate('');
  }, []);

  return {
    flights,
    isLoading,
    error,
    origin: originCode,
    destination: destCode,
    destinationName: destName,
    date: searchDate,
    search,
    clear,
  };
}
