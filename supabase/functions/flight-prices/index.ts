import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

interface CalendarPrice {
  date: string;
  price: number;
  airline: string;
  transfers: number;
  flightNumber: string;
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
  "florianópolis": "FLN",
  "florianopolis": "FLN",
  "campinas": "VCP",
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
  // Brasileiras
  "G3": "GOL",
  "JJ": "LATAM",
  "AD": "Azul",
  "2Z": "Passaredo",
  "O6": "Avianca Brasil",
  // Latinas
  "LA": "LATAM",
  "AR": "Aerolíneas Argentinas",
  "AV": "Avianca",
  "CM": "Copa Airlines",
  "AM": "Aeromexico",
  "DM": "Aeromexico Connect",
  "4O": "Interjet",
  "VH": "Viva Air",
  "H2": "Sky Airline",
  "JA": "JetSMART",
  "W4": "Wingo",
  "XL": "LATAM Ecuador",
  "4C": "LATAM Colombia",
  "PZ": "LATAM Paraguay",
  "LP": "LATAM Peru",
  // Europeias
  "TP": "TAP Portugal",
  "AF": "Air France",
  "BA": "British Airways",
  "IB": "Iberia",
  "KL": "KLM",
  "LH": "Lufthansa",
  "AZ": "ITA Airways",
  "LX": "Swiss",
  "OS": "Austrian",
  "SN": "Brussels Airlines",
  "A3": "Aegean",
  // Norte-americanas
  "AA": "American Airlines",
  "UA": "United Airlines",
  "DL": "Delta",
  "WN": "Southwest",
  "B6": "JetBlue",
  "NK": "Spirit Airlines",
  "F9": "Frontier",
  "AS": "Alaska Airlines",
  "AC": "Air Canada",
  // Outras internacionais
  "EK": "Emirates",
  "QR": "Qatar Airways",
  "TK": "Turkish Airlines",
  "ET": "Ethiopian Airlines",
  "SA": "South African Airways",
  "NH": "ANA",
  "JL": "Japan Airlines",
  "SQ": "Singapore Airlines",
  "CX": "Cathay Pacific",
  "QF": "Qantas",
  // Charters e genéricos
  "X1": "Voo Charter",
  "XX": "Voo Charter",
};

// Get IATA code from city name or return as-is if already IATA
function getIATACode(input: string): string {
  const lower = input.toLowerCase().trim();
  // Check if it's already a 3-letter IATA code
  if (/^[A-Z]{3}$/i.test(input.trim())) {
    return input.trim().toUpperCase();
  }
  return cityToIATA[lower] || destinationToIATA[lower]?.code || input.toUpperCase().slice(0, 3);
}

function getDestinationName(code: string): string {
  const entry = Object.values(destinationToIATA).find(d => d.code === code);
  return entry?.name || code;
}

function buildSkyscannerLink(originCode: string, destCode: string, departDate: string): string {
  const dateParts = departDate.split('-');
  const skyscannerDate = dateParts.length === 3 
    ? `${dateParts[0].slice(2)}${dateParts[1]}${dateParts[2]}` 
    : '';
  return `https://www.skyscanner.com.br/transporte/passagens-aereas/${originCode.toLowerCase()}/${destCode.toLowerCase()}/${skyscannerDate}/`;
}

serve(async (req) => {
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
    const action = url.searchParams.get('action') || 'popular';
    const origin = url.searchParams.get('origin')?.toLowerCase() || 'são paulo';
    const destination = url.searchParams.get('destination')?.toLowerCase();
    const currency = url.searchParams.get('currency') || 'BRL';
    const date = url.searchParams.get('date'); // YYYY-MM-DD for specific date search
    const month = url.searchParams.get('month'); // YYYY-MM for calendar
    
    const originCode = getIATACode(origin);
    
    console.log(`Action: ${action}, Origin: ${originCode} (${origin}), Destination: ${destination || 'all'}`);

    // ====== CALENDAR ACTION - Get daily prices for a month ======
    if (action === 'calendar' && destination) {
      const destCode = getIATACode(destination);
      const targetMonth = month || new Date().toISOString().slice(0, 7); // Default to current month
      
      console.log(`Fetching calendar prices: ${originCode} -> ${destCode} for ${targetMonth}`);
      
      // Use prices/calendar endpoint - returns daily prices
      const apiUrl = `https://api.travelpayouts.com/v1/prices/calendar?origin=${originCode}&destination=${destCode}&currency=${currency}&token=${TRAVELPAYOUTS_TOKEN}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!data.success || !data.data) {
        // Fallback: try prices_for_dates with depart_date range
        const startDate = `${targetMonth}-01`;
        const endDate = `${targetMonth}-28`;
        
        const fallbackUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${originCode}&destination=${destCode}&departure_at=${startDate}&return_at=&currency=${currency}&sorting=price&limit=30&token=${TRAVELPAYOUTS_TOKEN}`;
        
        const fallbackResponse = await fetch(fallbackUrl);
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData.success && fallbackData.data) {
          const calendar: Record<string, CalendarPrice> = {};
          
          for (const flight of fallbackData.data) {
            const flightDate = flight.departure_at?.split('T')[0];
            if (flightDate && flightDate.startsWith(targetMonth)) {
              if (!calendar[flightDate] || flight.price < calendar[flightDate].price) {
                calendar[flightDate] = {
                  date: flightDate,
                  price: flight.price,
                  airline: airlineNames[flight.airline] || flight.airline,
                  transfers: flight.transfers,
                  flightNumber: flight.flight_number,
                };
              }
            }
          }
          
          return new Response(
            JSON.stringify({ 
              calendar, 
              origin: originCode,
              destination: destCode,
              destinationName: getDestinationName(destCode),
              month: targetMonth,
              source: 'travelpayouts-fallback' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ calendar: {}, month: targetMonth, source: 'empty' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Process calendar data - filter to requested month
      const calendar: Record<string, CalendarPrice> = {};
      
      for (const [dateKey, flightData] of Object.entries(data.data)) {
        if (dateKey.startsWith(targetMonth)) {
          const flight = flightData as any;
          calendar[dateKey] = {
            date: dateKey,
            price: flight.price,
            airline: airlineNames[flight.airline] || flight.airline,
            transfers: flight.transfers || 0,
            flightNumber: flight.flight_number || '',
          };
        }
      }
      
      return new Response(
        JSON.stringify({ 
          calendar, 
          origin: originCode,
          destination: destCode,
          destinationName: getDestinationName(destCode),
          month: targetMonth,
          source: 'travelpayouts' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ====== SEARCH ACTION - Get flights for specific date ======
    if (action === 'search' && destination && date) {
      const destCode = getIATACode(destination);
      
      console.log(`Searching flights: ${originCode} -> ${destCode} on ${date}`);
      
      // Get multiple flights for the date
      const apiUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${originCode}&destination=${destCode}&departure_at=${date}&currency=${currency}&sorting=price&direct=false&limit=20&token=${TRAVELPAYOUTS_TOKEN}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!data.success || !data.data) {
        return new Response(
          JSON.stringify({ flights: [], date, source: 'empty' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const flights: PriceResult[] = data.data.map((flight: any) => {
        const departDate = flight.departure_at ? flight.departure_at.split('T')[0] : date;
        
        return {
          origin: originCode,
          destination: destCode,
          destinationName: getDestinationName(destCode),
          price: flight.price,
          airline: airlineNames[flight.airline] || flight.airline,
          departureAt: flight.departure_at,
          returnAt: flight.return_at,
          transfers: flight.transfers,
          flightNumber: flight.flight_number,
          link: buildSkyscannerLink(originCode, destCode, departDate),
        };
      });

      return new Response(
        JSON.stringify({ 
          flights, 
          origin: originCode,
          destination: destCode,
          destinationName: getDestinationName(destCode),
          date,
          source: 'travelpayouts' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ====== MONTHLY ACTION - Get best prices per month ======
    if (action === 'monthly' && destination) {
      const destCode = getIATACode(destination);
      
      console.log(`Fetching monthly prices: ${originCode} -> ${destCode}`);
      
      const apiUrl = `https://api.travelpayouts.com/v1/prices/monthly?origin=${originCode}&destination=${destCode}&currency=${currency}&token=${TRAVELPAYOUTS_TOKEN}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!data.success || !data.data) {
        return new Response(
          JSON.stringify({ monthly: [], source: 'empty' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const monthly = Object.entries(data.data).map(([monthKey, monthData]: [string, any]) => ({
        month: monthKey,
        price: monthData.price,
        airline: airlineNames[monthData.airline] || monthData.airline,
      })).sort((a, b) => a.month.localeCompare(b.month));

      return new Response(
        JSON.stringify({ 
          monthly, 
          origin: originCode,
          destination: destCode,
          destinationName: getDestinationName(destCode),
          source: 'travelpayouts' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ====== DEFAULT: Popular destinations ======
    if (destination && destinationToIATA[destination]) {
      const destInfo = destinationToIATA[destination];
      const apiUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${originCode}&destination=${destInfo.code}&currency=${currency}&sorting=price&direct=false&limit=5&token=${TRAVELPAYOUTS_TOKEN}`;
      
      console.log(`Fetching specific route: ${originCode} -> ${destInfo.code}`);
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!data.success || !data.data) {
        return new Response(
          JSON.stringify({ prices: [], source: 'travelpayouts' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const prices: PriceResult[] = data.data.map((flight: any) => {
        const departDate = flight.departure_at ? flight.departure_at.split('T')[0] : '';
        
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
          link: buildSkyscannerLink(originCode, destInfo.code, departDate),
        };
      });

      return new Response(
        JSON.stringify({ prices, source: 'travelpayouts' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get popular destinations prices
    const popularDestinations = ['LIS', 'PAR', 'MIA', 'ROM', 'LON', 'MAD', 'NYC', 'AMS', 'CUN', 'BUE'];
    
    const fetchPromises = popularDestinations.map(async (destCode) => {
      try {
        const apiUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${originCode}&destination=${destCode}&currency=${currency}&sorting=price&direct=false&limit=1&token=${TRAVELPAYOUTS_TOKEN}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          const flight = data.data[0];
          const destName = getDestinationName(destCode);
          const departDate = flight.departure_at ? flight.departure_at.split('T')[0] : '';
          
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
            link: buildSkyscannerLink(originCode, destCode, departDate),
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
