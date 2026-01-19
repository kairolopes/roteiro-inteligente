import { useState, useEffect, useCallback } from 'react';

export interface CalendarPrice {
  date: string;
  price: number;
  airline: string;
  transfers: number;
  flightNumber: string;
}

export interface UseFlightCalendarResult {
  calendar: Record<string, CalendarPrice>;
  cheapestDay: CalendarPrice | null;
  isLoading: boolean;
  error: string | null;
  origin: string;
  destination: string;
  destinationName: string;
  month: string;
  refetch: () => void;
}

interface UseFlightCalendarOptions {
  origin: string;
  destination: string;
  month: string; // YYYY-MM
  enabled?: boolean;
}

export function useFlightCalendar(options: UseFlightCalendarOptions): UseFlightCalendarResult {
  const { origin, destination, month, enabled = true } = options;
  const [calendar, setCalendar] = useState<Record<string, CalendarPrice>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originCode, setOriginCode] = useState('');
  const [destCode, setDestCode] = useState('');
  const [destName, setDestName] = useState('');

  const fetchCalendar = useCallback(async () => {
    if (!enabled || !origin || !destination || !month) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        action: 'calendar',
        origin,
        destination,
        month,
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

      setCalendar(result.calendar || {});
      setOriginCode(result.origin || origin);
      setDestCode(result.destination || destination);
      setDestName(result.destinationName || destination);
    } catch (err) {
      console.error('Error fetching flight calendar:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch calendar');
      setCalendar({});
    } finally {
      setIsLoading(false);
    }
  }, [enabled, origin, destination, month]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  // Find cheapest day
  const cheapestDay = Object.values(calendar).reduce<CalendarPrice | null>((cheapest, current) => {
    if (!cheapest || current.price < cheapest.price) {
      return current;
    }
    return cheapest;
  }, null);

  return {
    calendar,
    cheapestDay,
    isLoading,
    error,
    origin: originCode,
    destination: destCode,
    destinationName: destName,
    month,
    refetch: fetchCalendar,
  };
}
