import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Brazilian origins to track
const ORIGINS = [
  { code: 'SAO', name: 'São Paulo' },
  { code: 'RIO', name: 'Rio de Janeiro' },
  { code: 'BSB', name: 'Brasília' },
  { code: 'FOR', name: 'Fortaleza' },
  { code: 'SSA', name: 'Salvador' },
];

// Popular destinations - international + domestic
const DESTINATIONS = [
  // Internacional
  { code: 'LIS', name: 'Lisboa', domestic: false },
  { code: 'PAR', name: 'Paris', domestic: false },
  { code: 'MIA', name: 'Miami', domestic: false },
  { code: 'ROM', name: 'Roma', domestic: false },
  { code: 'LON', name: 'Londres', domestic: false },
  { code: 'MAD', name: 'Madri', domestic: false },
  { code: 'NYC', name: 'Nova York', domestic: false },
  { code: 'AMS', name: 'Amsterdam', domestic: false },
  { code: 'CUN', name: 'Cancún', domestic: false },
  { code: 'BUE', name: 'Buenos Aires', domestic: false },
  { code: 'SCL', name: 'Santiago', domestic: false },
  { code: 'MCO', name: 'Orlando', domestic: false },
  { code: 'BCN', name: 'Barcelona', domestic: false },
  { code: 'DXB', name: 'Dubai', domestic: false },
  // Doméstico Brasil
  { code: 'REC', name: 'Recife', domestic: true },
  { code: 'NAT', name: 'Natal', domestic: true },
  { code: 'MCZ', name: 'Maceió', domestic: true },
  { code: 'FLN', name: 'Florianópolis', domestic: true },
  { code: 'POA', name: 'Porto Alegre', domestic: true },
  { code: 'CWB', name: 'Curitiba', domestic: true },
  { code: 'BEL', name: 'Belém', domestic: true },
  { code: 'MAO', name: 'Manaus', domestic: true },
  { code: 'CGH', name: 'São Paulo (Congonhas)', domestic: true },
  { code: 'SDU', name: 'Rio (Santos Dumont)', domestic: true },
];

// Airline codes to names
const airlineNames: Record<string, string> = {
  "G3": "GOL",
  "JJ": "LATAM",
  "AD": "Azul",
  "LA": "LATAM",
  "TP": "TAP Portugal",
  "AF": "Air France",
  "BA": "British Airways",
  "IB": "Iberia",
  "KL": "KLM",
  "LH": "Lufthansa",
  "AA": "American Airlines",
  "UA": "United Airlines",
  "DL": "Delta",
  "EK": "Emirates",
  "AR": "Aerolíneas Argentinas",
  "AV": "Avianca",
  "CM": "Copa Airlines",
};

interface FlightData {
  origin_code: string;
  destination_code: string;
  destination_name: string;
  price: number;
  airline: string | null;
  airline_name: string | null;
  departure_at: string | null;
  return_at: string | null;
  transfers: number;
  flight_number: string | null;
  link: string | null;
  is_domestic: boolean;
  updated_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TRAVELPAYOUTS_TOKEN = Deno.env.get('TRAVELPAYOUTS_API_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!TRAVELPAYOUTS_TOKEN) {
      console.error('TRAVELPAYOUTS_API_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Database credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    console.log('Starting flight cache update...');
    
    const allPrices: FlightData[] = [];
    const now = new Date().toISOString();
    let successCount = 0;
    let errorCount = 0;

    // Fetch prices for each origin-destination pair
    for (const origin of ORIGINS) {
      for (const dest of DESTINATIONS) {
        // Skip same-city routes
        if (origin.code === dest.code) continue;
        // Skip domestic origins to domestic destinations (e.g., SAO to CGH)
        if (origin.code === 'SAO' && dest.code === 'CGH') continue;
        if (origin.code === 'RIO' && dest.code === 'SDU') continue;
        
        try {
          const apiUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${origin.code}&destination=${dest.code}&currency=BRL&sorting=price&direct=false&limit=1&token=${TRAVELPAYOUTS_TOKEN}`;
          
          const response = await fetch(apiUrl);
          const data = await response.json();
          
          if (data.success && data.data && data.data.length > 0) {
            const flight = data.data[0];
            const departDate = flight.departure_at ? flight.departure_at.split('T')[0] : '';
            const skyscannerDate = departDate ? departDate.replace(/-/g, '').slice(2) : '';
            
            allPrices.push({
              origin_code: origin.code,
              destination_code: dest.code,
              destination_name: dest.name,
              price: flight.price,
              airline: flight.airline,
              airline_name: airlineNames[flight.airline] || flight.airline,
              departure_at: flight.departure_at,
              return_at: flight.return_at,
              transfers: flight.transfers || 0,
              flight_number: flight.flight_number,
              link: `https://www.skyscanner.com.br/transporte/passagens-aereas/${origin.code.toLowerCase()}/${dest.code.toLowerCase()}/${skyscannerDate}/`,
              is_domestic: dest.domestic,
              updated_at: now,
            });
            
            successCount++;
          }
        } catch (err) {
          console.error(`Error fetching ${origin.code} -> ${dest.code}:`, err);
          errorCount++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Fetched ${allPrices.length} prices. Success: ${successCount}, Errors: ${errorCount}`);

    // Upsert all prices to database
    if (allPrices.length > 0) {
      const { error: upsertError } = await supabase
        .from('flight_price_cache')
        .upsert(allPrices, {
          onConflict: 'origin_code,destination_code',
          ignoreDuplicates: false,
        });

      if (upsertError) {
        console.error('Error upserting prices:', upsertError);
        return new Response(
          JSON.stringify({ error: 'Failed to save prices', details: upsertError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('Flight cache update completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        updated: allPrices.length,
        origins: ORIGINS.length,
        destinations: DESTINATIONS.length,
        successCount,
        errorCount,
        timestamp: now,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in update-flight-cache function:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Failed to update flight cache', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
