import { useState, useCallback } from 'react';
import { FlightPrice } from './useFlightPrices';
import { getFlightPricesUrl, getAuthHeaders } from '@/lib/apiRouting';

export interface CombinedFlight {
  outbound: FlightPrice;
  return: FlightPrice;
  totalPrice: number;
  totalTransfers: number;
}

export interface UseRoundTripSearchResult {
  outboundFlights: FlightPrice[];
  returnFlights: FlightPrice[];
  combinedFlights: CombinedFlight[];
  isLoading: boolean;
  error: string | null;
  origin: string;
  destination: string;
  destinationName: string;
  departDate: string;
  returnDate: string;
  search: (origin: string, destination: string, departDate: string, returnDate: string) => Promise<void>;
  clear: () => void;
}

export function useRoundTripSearch(): UseRoundTripSearchResult {
  const [outboundFlights, setOutboundFlights] = useState<FlightPrice[]>([]);
  const [returnFlights, setReturnFlights] = useState<FlightPrice[]>([]);
  const [combinedFlights, setCombinedFlights] = useState<CombinedFlight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originCode, setOriginCode] = useState('');
  const [destCode, setDestCode] = useState('');
  const [destName, setDestName] = useState('');
  const [departDateState, setDepartDateState] = useState('');
  const [returnDateState, setReturnDateState] = useState('');

  const search = useCallback(async (origin: string, destination: string, departDate: string, returnDate: string) => {
    if (!origin || !destination || !departDate || !returnDate) {
      setError('Preencha origem, destino e datas');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutboundFlights([]);
    setReturnFlights([]);
    setCombinedFlights([]);

    try {
      // Fetch outbound and return flights in parallel
      const outboundParams = new URLSearchParams({
        action: 'search',
        origin,
        destination,
        date: departDate,
      });
      const returnParams = new URLSearchParams({
        action: 'search',
        origin: destination,
        destination: origin,
        date: returnDate,
      });

      const [outboundRes, returnRes] = await Promise.all([
        fetch(getFlightPricesUrl(outboundParams), { headers: getAuthHeaders() }),
        fetch(getFlightPricesUrl(returnParams), { headers: getAuthHeaders() }),
      ]);

      if (!outboundRes.ok || !returnRes.ok) {
        throw new Error('Failed to fetch flights');
      }

      const [outboundData, returnData] = await Promise.all([
        outboundRes.json(),
        returnRes.json(),
      ]);

      const outbound: FlightPrice[] = outboundData.flights || [];
      const returnFlts: FlightPrice[] = returnData.flights || [];

      // Generate all combinations and sort by total price
      const combinations: CombinedFlight[] = [];
      
      for (const out of outbound.slice(0, 10)) {
        for (const ret of returnFlts.slice(0, 10)) {
          combinations.push({
            outbound: out,
            return: ret,
            totalPrice: out.price + ret.price,
            totalTransfers: out.transfers + ret.transfers,
          });
        }
      }

      // Sort by total price
      combinations.sort((a, b) => a.totalPrice - b.totalPrice);

      setOutboundFlights(outbound);
      setReturnFlights(returnFlts);
      setCombinedFlights(combinations.slice(0, 20));
      setOriginCode(outboundData.origin || origin);
      setDestCode(outboundData.destination || destination);
      setDestName(outboundData.destinationName || destination);
      setDepartDateState(departDate);
      setReturnDateState(returnDate);
    } catch (err) {
      console.error('Error searching round-trip flights:', err);
      setError(err instanceof Error ? err.message : 'Failed to search flights');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setOutboundFlights([]);
    setReturnFlights([]);
    setCombinedFlights([]);
    setError(null);
    setOriginCode('');
    setDestCode('');
    setDestName('');
    setDepartDateState('');
    setReturnDateState('');
  }, []);

  return {
    outboundFlights,
    returnFlights,
    combinedFlights,
    isLoading,
    error,
    origin: originCode,
    destination: destCode,
    destinationName: destName,
    departDate: departDateState,
    returnDate: returnDateState,
    search,
    clear,
  };
}
