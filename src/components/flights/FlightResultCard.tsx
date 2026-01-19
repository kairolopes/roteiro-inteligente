import { motion } from "framer-motion";
import { Plane, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlightPrice } from "@/hooks/useFlightPrices";

interface FlightResultCardProps {
  flight: FlightPrice;
  onSelect: (flight: FlightPrice) => void;
  isCheapest?: boolean;
}

const airlineLogos: Record<string, string> = {
  'GOL': '🟠',
  'LATAM': '🔴',
  'Azul': '🔵',
  'TAP Portugal': '🟢',
  'Air France': '🔵',
  'British Airways': '🔴',
  'Iberia': '🟡',
  'American Airlines': '🔴',
  'KLM': '🔵',
  'Emirates': '🟤',
  'Aeromexico': '🔵',
  'Avianca': '🔴',
  'Copa Airlines': '🔵',
  'United Airlines': '🔵',
  'Delta': '🔵',
  'Lufthansa': '🟡',
};

export function FlightResultCard({ flight, onSelect, isCheapest }: FlightResultCardProps) {
  const formatTime = (dateString: string) => {
    if (!dateString) return '--:--';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  const getStopsText = (transfers: number) => {
    if (transfers === 0) return 'Direto';
    if (transfers === 1) return '1 parada';
    return `${transfers} paradas`;
  };

  const airlineLogo = airlineLogos[flight.airline] || '✈️';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`bg-card border rounded-xl p-4 md:p-6 transition-shadow hover:shadow-lg ${
        isCheapest ? 'border-green-500/50 ring-1 ring-green-500/20' : 'border-border'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Airline Info */}
        <div className="flex items-center gap-3 min-w-[140px]">
          <span className="text-2xl">{airlineLogo}</span>
          <div>
            <p className="font-semibold text-sm">{flight.airline}</p>
            {flight.flightNumber && (
              <p className="text-xs text-muted-foreground">{flight.flightNumber}</p>
            )}
          </div>
        </div>

        {/* Flight Details */}
        <div className="flex items-center gap-4 flex-1">
          {/* Departure */}
          <div className="text-center">
            <p className="text-xl font-bold">{formatTime(flight.departureAt)}</p>
            <p className="text-xs text-muted-foreground">{flight.origin}</p>
            <p className="text-xs text-muted-foreground">{formatDate(flight.departureAt)}</p>
          </div>

          {/* Duration & Stops */}
          <div className="flex-1 flex flex-col items-center">
            <div className="flex items-center gap-2 w-full">
              <div className="h-px bg-border flex-1" />
              <Plane className="h-4 w-4 text-primary rotate-90 md:rotate-0" />
              <div className="h-px bg-border flex-1" />
            </div>
            <Badge variant="outline" className="mt-1 text-xs">
              {getStopsText(flight.transfers)}
            </Badge>
          </div>

          {/* Arrival */}
          <div className="text-center">
            <p className="text-xl font-bold">
              {flight.returnAt ? formatTime(flight.returnAt) : '--:--'}
            </p>
            <p className="text-xs text-muted-foreground">{flight.destination}</p>
            <p className="text-xs text-muted-foreground">
              {flight.returnAt ? formatDate(flight.returnAt) : ''}
            </p>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex flex-col items-end gap-2 min-w-[120px]">
          {isCheapest && (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              Mais Barato
            </Badge>
          )}
          <p className="text-2xl font-bold text-primary">
            R$ {flight.price.toLocaleString('pt-BR')}
          </p>
          <Button onClick={() => onSelect(flight)} className="gap-2">
            Comparar Preços
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
