import { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
  "G3": "GOL", "JJ": "LATAM", "AD": "Azul", "2Z": "Passaredo", "O6": "Avianca Brasil",
  "LA": "LATAM", "AR": "Aerolíneas Argentinas", "AV": "Avianca", "CM": "Copa Airlines",
  "AM": "Aeromexico", "DM": "Aeromexico Connect", "4O": "Interjet", "VH": "Viva Air",
  "H2": "Sky Airline", "JA": "JetSMART", "W4": "Wingo", "XL": "LATAM Ecuador",
  "4C": "LATAM Colombia", "PZ": "LATAM Paraguay", "LP": "LATAM Peru",
  "TP": "TAP Portugal", "AF": "Air France", "BA": "British Airways", "IB": "Iberia",
  "KL": "KLM", "LH": "Lufthansa", "AZ": "ITA Airways", "LX": "Swiss", "OS": "Austrian",
  "SN": "Brussels Airlines", "A3": "Aegean",
  "AA": "American Airlines", "UA": "United Airlines", "DL": "Delta", "WN": "Southwest",
  "B6": "JetBlue", "NK": "Spirit Airlines", "F9": "Frontier", "AS": "Alaska Airlines",
  "AC": "Air Canada",
  "EK": "Emirates", "QR": "Qatar Airways", "TK": "Turkish Airlines", "ET": "Ethiopian Airlines",
  "SA": "South African Airways", "NH": "ANA", "JL": "Japan Airlines", "SQ": "Singapore Airlines",
  "CX": "Cathay Pacific", "QF": "Qantas",
  "X1": "Voo Charter", "XX": "Voo Charter",
};

function getIATACode(input: string): string {
  const lower = input.toLowerCase().trim();
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

const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    const TRAVELPAYOUTS_TOKEN = process.env.TRAVELPAYOUTS_API_TOKEN;
    
    if (!TRAVELPAYOUTS_TOKEN) {
      console.error("TRAVELPAYOUTS_API_TOKEN not configured");
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "API token not configured" }),
      };
    }

    const params = new URLSearchParams(event.queryStringParameters as Record<string, string> || {});
    const action = params.get("action") || "popular";
    const origin = params.get("origin")?.toLowerCase() || "são paulo";
    const destination = params.get("destination")?.toLowerCase();
    const currency = params.get("currency") || "BRL";
    const date = params.get("date");
    const month = params.get("month");
    
    const originCode = getIATACode(origin);
    
    console.log(`Action: ${action}, Origin: ${originCode}, Destination: ${destination || "all"}`);

    // CALENDAR ACTION
    if (action === "calendar" && destination) {
      const destCode = getIATACode(destination);
      const targetMonth = month || new Date().toISOString().slice(0, 7);
      
      const apiUrl = `https://api.travelpayouts.com/v1/prices/calendar?origin=${originCode}&destination=${destCode}&currency=${currency}&token=${TRAVELPAYOUTS_TOKEN}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!data.success || !data.data) {
        const startDate = `${targetMonth}-01`;
        const fallbackUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${originCode}&destination=${destCode}&departure_at=${startDate}&currency=${currency}&sorting=price&limit=30&token=${TRAVELPAYOUTS_TOKEN}`;
        const fallbackResponse = await fetch(fallbackUrl);
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData.success && fallbackData.data) {
          const calendar: Record<string, CalendarPrice> = {};
          for (const flight of fallbackData.data) {
            const flightDate = flight.departure_at?.split("T")[0];
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
          return {
            statusCode: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            body: JSON.stringify({ calendar, origin: originCode, destination: destCode, destinationName: getDestinationName(destCode), month: targetMonth, source: "travelpayouts-fallback" }),
          };
        }
        return {
          statusCode: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ calendar: {}, month: targetMonth, source: "empty" }),
        };
      }

      const calendar: Record<string, CalendarPrice> = {};
      for (const [dateKey, flightData] of Object.entries(data.data)) {
        if (dateKey.startsWith(targetMonth)) {
          const flight = flightData as any;
          calendar[dateKey] = {
            date: dateKey,
            price: flight.price,
            airline: airlineNames[flight.airline] || flight.airline,
            transfers: flight.transfers || 0,
            flightNumber: flight.flight_number || "",
          };
        }
      }
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ calendar, origin: originCode, destination: destCode, destinationName: getDestinationName(destCode), month: targetMonth, source: "travelpayouts" }),
      };
    }

    // SEARCH ACTION
    if (action === "search" && destination && date) {
      const destCode = getIATACode(destination);
      const apiUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${originCode}&destination=${destCode}&departure_at=${date}&currency=${currency}&sorting=price&direct=false&limit=20&token=${TRAVELPAYOUTS_TOKEN}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!data.success || !data.data) {
        return {
          statusCode: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ flights: [], date, source: "empty" }),
        };
      }

      const flights: PriceResult[] = data.data.map((flight: any) => ({
        origin: originCode,
        destination: destCode,
        destinationName: getDestinationName(destCode),
        price: flight.price,
        airline: airlineNames[flight.airline] || flight.airline,
        departureAt: flight.departure_at,
        returnAt: flight.return_at,
        transfers: flight.transfers,
        flightNumber: flight.flight_number,
        link: buildSkyscannerLink(originCode, destCode, flight.departure_at?.split("T")[0] || date),
      }));

      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ flights, origin: originCode, destination: destCode, destinationName: getDestinationName(destCode), date, source: "travelpayouts" }),
      };
    }

    // MONTHLY ACTION
    if (action === "monthly" && destination) {
      const destCode = getIATACode(destination);
      const apiUrl = `https://api.travelpayouts.com/v1/prices/monthly?origin=${originCode}&destination=${destCode}&currency=${currency}&token=${TRAVELPAYOUTS_TOKEN}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!data.success || !data.data) {
        return {
          statusCode: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ monthly: [], source: "empty" }),
        };
      }

      const monthly = Object.entries(data.data).map(([monthKey, monthData]: [string, any]) => ({
        month: monthKey,
        price: monthData.price,
        airline: airlineNames[monthData.airline] || monthData.airline,
      })).sort((a, b) => a.month.localeCompare(b.month));

      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ monthly, origin: originCode, destination: destCode, destinationName: getDestinationName(destCode), source: "travelpayouts" }),
      };
    }

    // SPECIFIC DESTINATION
    if (destination && destinationToIATA[destination]) {
      const destInfo = destinationToIATA[destination];
      const apiUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${originCode}&destination=${destInfo.code}&currency=${currency}&sorting=price&direct=false&limit=5&token=${TRAVELPAYOUTS_TOKEN}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!data.success || !data.data) {
        return {
          statusCode: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ prices: [], source: "travelpayouts" }),
        };
      }

      const prices: PriceResult[] = data.data.map((flight: any) => ({
        origin: originCode,
        destination: destInfo.code,
        destinationName: destInfo.name,
        price: flight.price,
        airline: airlineNames[flight.airline] || flight.airline,
        departureAt: flight.departure_at,
        returnAt: flight.return_at,
        transfers: flight.transfers,
        flightNumber: flight.flight_number,
        link: buildSkyscannerLink(originCode, destInfo.code, flight.departure_at?.split("T")[0] || ""),
      }));

      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ prices, source: "travelpayouts" }),
      };
    }

    // POPULAR DESTINATIONS
    const popularDestinations = ["LIS", "PAR", "MIA", "ROM", "LON", "MAD", "NYC", "AMS", "CUN", "BUE"];
    
    const fetchPromises = popularDestinations.map(async (destCode) => {
      try {
        const apiUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${originCode}&destination=${destCode}&currency=${currency}&sorting=price&direct=false&limit=1&token=${TRAVELPAYOUTS_TOKEN}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          const flight = data.data[0];
          const departDate = flight.departure_at?.split("T")[0] || "";
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

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ prices: validPrices, source: "travelpayouts" }),
    };

  } catch (error) {
    console.error("Error in flight-prices function:", error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to fetch flight prices" }),
    };
  }
};

export { handler };
