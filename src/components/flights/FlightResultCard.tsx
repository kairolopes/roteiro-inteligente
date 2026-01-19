import { motion } from "framer-motion";
import { Plane, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlightPrice } from "@/hooks/useFlightPrices";
import { useNavigate } from "react-router-dom";

interface FlightResultCardProps {
  flight: FlightPrice;
  onSelect: (flight: FlightPrice) => void;
  isCheapest?: boolean;
  origin: string;
  originIata: string;
}

const AIRLINE_LOGOS: Record<string, { bg: string; text: string; abbr: string }> = {
  'GOL': { bg: 'bg-orange-500', text: 'text-white', abbr: 'GL' },
  'LATAM': { bg: 'bg-red-600', text: 'text-white', abbr: 'LA' },
  'Azul': { bg: 'bg-blue-600', text: 'text-white', abbr: 'AD' },
  'TAP Portugal': { bg: 'bg-green-600', text: 'text-white', abbr: 'TP' },
  'Air France': { bg: 'bg-blue-800', text: 'text-white', abbr: 'AF' },
  'British Airways': { bg: 'bg-red-700', text: 'text-white', abbr: 'BA' },
  'Iberia': { bg: 'bg-yellow-500', text: 'text-red-700', abbr: 'IB' },
  'American Airlines': { bg: 'bg-blue-900', text: 'text-white', abbr: 'AA' },
  'KLM': { bg: 'bg-cyan-600', text: 'text-white', abbr: 'KL' },
  'Emirates': { bg: 'bg-red-800', text: 'text-white', abbr: 'EK' },
  'Aeromexico': { bg: 'bg-blue-700', text: 'text-white', abbr: 'AM' },
  'Avianca': { bg: 'bg-red-600', text: 'text-white', abbr: 'AV' },
  'Copa Airlines': { bg: 'bg-blue-500', text: 'text-white', abbr: 'CM' },
  'United Airlines': { bg: 'bg-blue-800', text: 'text-white', abbr: 'UA' },
  'Delta': { bg: 'bg-blue-900', text: 'text-white', abbr: 'DL' },
  'Lufthansa': { bg: 'bg-yellow-400', text: 'text-blue-900', abbr: 'LH' },
  'Aerolíneas Argentinas': { bg: 'bg-sky-500', text: 'text-white', abbr: 'AR' },
};

export function FlightResultCard({ 
  flight, 
  onSelect, 
  isCheapest,
  origin,
  originIata 
}: FlightResultCardProps) {
  const navigate = useNavigate();
  
  const formatTime = (dateString: string) => {
    if (!dateString) return '--:--';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const getStopsText = (transfers: number) => {
    if (transfers === 0) return 'Direto';
    if (transfers === 1) return '1 parada';
    return `${transfers} paradas`;
  };

  const getDuration = () => {
    // Estimate based on transfers (rough estimate)
    const base = flight.transfers === 0 ? 3 : flight.transfers === 1 ? 8 : 14;
    const hours = Math.floor(base);
    const mins = (base - hours) * 60;
    return `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`;
  };

  const airlineData = AIRLINE_LOGOS[flight.airline] || { 
    bg: 'bg-gray-600', 
    text: 'text-white', 
    abbr: flight.airline.substring(0, 2).toUpperCase() 
  };

  const handleViewMore = () => {
    // Build URL: /passagens/{origem}/{destino}/{AAMMDD}
    const dateForUrl = flight.departureAt 
      ? `${flight.departureAt.slice(2, 4)}${flight.departureAt.slice(5, 7)}${flight.departureAt.slice(8, 10)}`
      : '260101';
    
    navigate(`/passagens/${originIata.toLowerCase()}/${flight.destination.toLowerCase()}/${dateForUrl}`, {
      state: { flight, originIata }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      className={`bg-card border rounded-xl overflow-hidden transition-all hover:shadow-lg ${
        isCheapest ? 'border-green-500/50 ring-1 ring-green-500/20' : 'border-border'
      }`}
    >
      {isCheapest && (
        <div className="bg-green-500 text-white text-xs font-medium py-1 px-4 text-center">
          ✨ Melhor preço encontrado
        </div>
      )}

      <div className="p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Airline Logo */}
          <div className="flex items-center gap-3 min-w-[160px]">
            <div className={`w-10 h-10 rounded-lg ${airlineData.bg} ${airlineData.text} flex items-center justify-center font-bold text-sm`}>
              {airlineData.abbr}
            </div>
            <div>
              <p className="font-medium text-sm">{flight.airline}</p>
              {flight.flightNumber && (
                <p className="text-xs text-muted-foreground">{flight.flightNumber}</p>
              )}
            </div>
          </div>

          {/* Flight Route */}
          <div className="flex items-center gap-3 flex-1">
            {/* Departure */}
            <div className="text-center min-w-[60px]">
              <p className="text-xl font-bold">{formatTime(flight.departureAt)}</p>
              <p className="text-xs text-muted-foreground">{originIata}</p>
            </div>

            {/* Duration & Route Line */}
            <div className="flex-1 flex flex-col items-center px-2">
              <span className="text-xs text-muted-foreground mb-1">{getDuration()}</span>
              <div className="flex items-center gap-1 w-full">
                <div className="h-0.5 bg-border flex-1 rounded" />
                <div className="relative">
                  <Plane className="h-4 w-4 text-primary" />
                </div>
                <div className="h-0.5 bg-border flex-1 rounded" />
              </div>
              <Badge 
                variant={flight.transfers === 0 ? "default" : "outline"} 
                className={`mt-1 text-xs ${flight.transfers === 0 ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}`}
              >
                {getStopsText(flight.transfers)}
              </Badge>
            </div>

            {/* Arrival */}
            <div className="text-center min-w-[60px]">
              <p className="text-xl font-bold">
                {flight.returnAt ? formatTime(flight.returnAt) : '—'}
              </p>
              <p className="text-xs text-muted-foreground">{flight.destination}</p>
            </div>
          </div>

          {/* Offers & Price */}
          <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 min-w-[150px] border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">A partir de</p>
              <p className="text-2xl font-bold text-primary">
                R$ {flight.price.toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-muted-foreground">por pessoa, só ida</p>
            </div>
            <Button 
              onClick={handleViewMore}
              className="gap-2 w-full sm:w-auto"
              size="sm"
            >
              Veja mais
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
