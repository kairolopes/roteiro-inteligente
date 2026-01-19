import { motion } from "framer-motion";
import { Plane, ArrowRight, Check, Clock, ArrowLeftRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlightPrice } from "@/hooks/useFlightPrices";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RoundTripResultCardProps {
  outbound: FlightPrice;
  returnFlight: FlightPrice;
  totalPrice: number;
  onSelect: () => void;
  isCheapest?: boolean;
  origin: string;
  originIata: string;
}

const AIRLINE_LOGOS: Record<string, { bg: string; text: string; abbr: string }> = {
  'GOL': { bg: 'bg-orange-500', text: 'text-white', abbr: 'G3' },
  'LATAM': { bg: 'bg-red-600', text: 'text-white', abbr: 'LA' },
  'Azul': { bg: 'bg-blue-600', text: 'text-white', abbr: 'AD' },
  'Aerolíneas Argentinas': { bg: 'bg-sky-500', text: 'text-white', abbr: 'AR' },
  'Avianca': { bg: 'bg-red-600', text: 'text-white', abbr: 'AV' },
  'Copa Airlines': { bg: 'bg-blue-700', text: 'text-white', abbr: 'CM' },
  'TAP Portugal': { bg: 'bg-green-600', text: 'text-white', abbr: 'TP' },
  'Air France': { bg: 'bg-blue-800', text: 'text-white', abbr: 'AF' },
  'Iberia': { bg: 'bg-red-600', text: 'text-white', abbr: 'IB' },
  'American Airlines': { bg: 'bg-blue-600', text: 'text-white', abbr: 'AA' },
  'United Airlines': { bg: 'bg-blue-700', text: 'text-white', abbr: 'UA' },
  'Delta': { bg: 'bg-blue-900', text: 'text-white', abbr: 'DL' },
  'Emirates': { bg: 'bg-red-700', text: 'text-white', abbr: 'EK' },
};

const getAirlineData = (airline: string) => {
  return AIRLINE_LOGOS[airline] || { bg: 'bg-slate-600', text: 'text-white', abbr: airline.slice(0, 2).toUpperCase() };
};

const formatTime = (dateString?: string) => {
  if (!dateString) return '--:--';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return format(date, "EEE, d MMM", { locale: ptBR });
  } catch {
    return '';
  }
};

const getStopsText = (transfers: number) => {
  if (transfers === 0) return 'Direto';
  if (transfers === 1) return '1 parada';
  return `${transfers} paradas`;
};

export function RoundTripResultCard({
  outbound,
  returnFlight,
  totalPrice,
  onSelect,
  isCheapest,
  origin,
  originIata,
}: RoundTripResultCardProps) {
  const outboundAirline = getAirlineData(outbound.airline);
  const returnAirline = getAirlineData(returnFlight.airline);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`bg-card border rounded-xl overflow-hidden transition-all hover:shadow-lg ${
        isCheapest ? 'border-green-500/50 ring-1 ring-green-500/20' : 'border-border'
      }`}
    >
      {/* Badges */}
      {isCheapest && (
        <div className="bg-green-500/10 px-4 py-2 border-b border-green-500/20">
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <Check className="h-4 w-4" />
            Melhor preço encontrado
          </div>
        </div>
      )}
      
      <div className="p-4">
        {/* Outbound Flight */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="gap-1 text-xs">
              <Plane className="h-3 w-3" />
              IDA
            </Badge>
            <span className="text-xs text-muted-foreground">{formatDate(outbound.departureAt)}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${outboundAirline.bg} ${outboundAirline.text} flex items-center justify-center font-bold text-sm shrink-0`}>
              {outboundAirline.abbr}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">{outbound.airline}</span>
                {outbound.flightNumber && (
                  <span className="text-muted-foreground">{outbound.flightNumber}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold">{formatTime(outbound.departureAt)}</span>
                <span className="text-xs text-muted-foreground">{originIata}</span>
                
                <div className="flex items-center gap-1 flex-1 px-2">
                  <div className="h-0.5 bg-border flex-1" />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <div className="h-0.5 bg-border flex-1" />
                </div>
                
                <span className="text-xs text-muted-foreground">{outbound.destination}</span>
                <span className="font-bold">{formatTime(outbound.returnAt)}</span>
              </div>
            </div>
            
            <div className="text-right shrink-0">
              <Badge variant={outbound.transfers === 0 ? "default" : "outline"} className={outbound.transfers === 0 ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}>
                {getStopsText(outbound.transfers)}
              </Badge>
              <p className="text-sm font-medium text-primary mt-1">R$ {outbound.price.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-dashed my-4 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2">
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        {/* Return Flight */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="gap-1 text-xs">
              <Plane className="h-3 w-3 rotate-180" />
              VOLTA
            </Badge>
            <span className="text-xs text-muted-foreground">{formatDate(returnFlight.departureAt)}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${returnAirline.bg} ${returnAirline.text} flex items-center justify-center font-bold text-sm shrink-0`}>
              {returnAirline.abbr}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">{returnFlight.airline}</span>
                {returnFlight.flightNumber && (
                  <span className="text-muted-foreground">{returnFlight.flightNumber}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold">{formatTime(returnFlight.departureAt)}</span>
                <span className="text-xs text-muted-foreground">{returnFlight.origin}</span>
                
                <div className="flex items-center gap-1 flex-1 px-2">
                  <div className="h-0.5 bg-border flex-1" />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <div className="h-0.5 bg-border flex-1" />
                </div>
                
                <span className="text-xs text-muted-foreground">{originIata}</span>
                <span className="font-bold">{formatTime(returnFlight.returnAt)}</span>
              </div>
            </div>
            
            <div className="text-right shrink-0">
              <Badge variant={returnFlight.transfers === 0 ? "default" : "outline"} className={returnFlight.transfers === 0 ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}>
                {getStopsText(returnFlight.transfers)}
              </Badge>
              <p className="text-sm font-medium text-primary mt-1">R$ {returnFlight.price.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>
        
        {/* Total & CTA */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Total ida + volta</p>
            <p className="text-2xl font-bold text-primary">R$ {totalPrice.toLocaleString('pt-BR')}</p>
          </div>
          
          <Button onClick={onSelect} size="lg" className="gap-2">
            Ver ofertas
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
