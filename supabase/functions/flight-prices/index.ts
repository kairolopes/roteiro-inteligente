import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FlightSearchParams {
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string;
  currency?: string;
}

interface PriceResult {
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

// IATA codes mapping for Brazilian cities
const cityToIATA: Record<string, string> = {
  "são paulo": "SAO",
  "sao paulo": "SAO",
  "rio de janeiro": "RIO",
  "brasília": "BSB",
  "brasilia": "BSB",
  "fortaleza": "FOR",
  "salvador": "SSA",
  "belo horizonte": "BHZ",
  "curitiba": "CWB",
  "recife": "REC",
  "porto alegre": "POA",
};

// Destination IATA codes
const destinationToIATA: Record<string, { code: string; name: string }> = {
  "lisboa": { code: "LIS", name: "Lisboa" },
  "paris": { code: "PAR", name: "Paris" },
  "miami": { code: "MIA", name: "Miami" },
  "roma": { code: "ROM", name: "Roma" },
  "londres": { code: "LON", name: "Londres" },
  "madri": { code: "MAD", name: "Madri" },
  "nova york": { code: "NYC", name: "Nova York" },
  "amsterdam": { code: "AMS", name: "Amsterdam" },
  "dubai": { code: "DXB", name: "Dubai" },
  "cancún": { code: "CUN", name: "Cancún" },
  "cancun": { code: "CUN", name: "Cancún" },
  "buenos aires": { code: "BUE", name: "Buenos Aires" },
  "santiago": { code: "SCL", name: "Santiago" },
  "orlando": { code: "MCO", name: "Orlando" },
  "barcelona": { code: "BCN", name: "Barcelona" },
  "tóquio": { code: "TYO", name: "Tóquio" },
  "toquio": { code: "TYO", name: "Tóquio" },
  "cape town": { code: "CPT", name: "Cape Town" },
  "cartagena": { code: "CTG", name: "Cartagena" },
};

// Airline codes to names
const airlineNames: Record<string, string> = {
  "G3": "GOL",
  "JJ": "LATAM",
  "AD": "Azul",
  "TP": "TAP Portugal",
  "AF": "Air France",
  "BA": "British Airways",
  "IB": "Iberia",
  "AA": "American Airlines",
  "KL": "KLM",
  "EK": "Emirates",
  "AM": "Aeromexico",
  "AR": "Aerolíneas Argentinas",
  "LA": "LATAM",
  "AV": "Avianca",
  "CM": "Copa Airlines",
  "UA": "United Airlines",
  "DL": "Delta",
  "LH": "Lufthansa",
  "AZ": "ITA Airways",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TRAVELPAYOUTS_TOKEN = Deno.env.get('TRAVELPAYOUTS_API_TOKEN');
    
    if (!TRAVELPAYOUTS_TOKEN) {
      console.error('TRAVELPAYOUTS_API_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const origin = url.searchParams.get('origin')?.toLowerCase() || 'são paulo';
    const destination = url.searchParams.get('destination')?.toLowerCase();
    const currency = url.searchParams.get('currency') || 'BRL';
    
    // Get IATA codes
    const originCode = cityToIATA[origin] || 'SAO';
    
    console.log(`Fetching flight prices from ${originCode} (${origin})`);

    // If specific destination requested
    if (destination && destinationToIATA[destination]) {
      const destInfo = destinationToIATA[destination];
      const apiUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${originCode}&destination=${destInfo.code}&currency=${currency}&sorting=price&direct=false&limit=5&token=${TRAVELPAYOUTS_TOKEN}`;
      
      console.log(`Fetching specific route: ${originCode} -> ${destInfo.code}`);
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!data.success || !data.data) {
        console.log('No data for specific route, returning empty');
        return new Response(
          JSON.stringify({ prices: [], source: 'travelpayouts' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const prices: PriceResult[] = data.data.map((flight: any) => {
          // Skyscanner Brasil - sempre em português e R$ BRL
          const skyscannerLink = `https://www.skyscanner.com.br/transporte/passagens-aereas/${originCode.toLowerCase()}/${destInfo.code.toLowerCase()}/`;
          
          return {
            origin: originCode,
            destination: destInfo.code,
            destinationName: destInfo.name,
            price: flight.price,
            airline: airlineNames[flight.airline] || flight.airline,
            departureAt: flight.departure_at,
            returnAt: flight.return_at,
            transfers: flight.transfers,
            flightNumber: flight.flight_number,
            link: skyscannerLink,
          };
      });

      return new Response(
        JSON.stringify({ prices, source: 'travelpayouts' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get popular destinations prices
    const popularDestinations = ['LIS', 'PAR', 'MIA', 'ROM', 'LON', 'MAD', 'NYC', 'AMS', 'CUN', 'BUE'];
    const allPrices: PriceResult[] = [];

    // Fetch prices for each destination in parallel
    const fetchPromises = popularDestinations.map(async (destCode) => {
      try {
        const apiUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${originCode}&destination=${destCode}&currency=${currency}&sorting=price&direct=false&limit=1&token=${TRAVELPAYOUTS_TOKEN}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          const flight = data.data[0];
          const destName = Object.values(destinationToIATA).find(d => d.code === destCode)?.name || destCode;
          
          // Skyscanner Brasil - sempre em português e R$ BRL
          const skyscannerLink = `https://www.skyscanner.com.br/transporte/passagens-aereas/${originCode.toLowerCase()}/${destCode.toLowerCase()}/`;
          
          return {
            origin: originCode,
            destination: destCode,
            destinationName: destName,
            price: flight.price,
            airline: airlineNames[flight.airline] || flight.airline,
            departureAt: flight.departure_at,
            returnAt: flight.return_at,
            transfers: flight.transfers,
            flightNumber: flight.flight_number,
            link: skyscannerLink,
          };
        }
        return null;
      } catch (err) {
        console.error(`Error fetching ${destCode}:`, err);
        return null;
      }
    });

    const results = await Promise.all(fetchPromises);
    const validPrices = results.filter((p): p is PriceResult => p !== null);

    // Sort by price
    validPrices.sort((a, b) => a.price - b.price);

    console.log(`Found ${validPrices.length} price results`);

    return new Response(
      JSON.stringify({ prices: validPrices, source: 'travelpayouts' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in flight-prices function:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch flight prices', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
