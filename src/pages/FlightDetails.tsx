// Flight Details Page - Updated v2
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plane, Loader2, Users, Briefcase, ExternalLink, Check, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TripPackageUpsell } from "@/components/flights/TripPackageUpsell";
import { FlightPrice, useFlightPrices } from "@/hooks/useFlightPrices";
import { 
  BookingContext, 
  getSkyscannerLink, 
  getDecolarLink,
  get123MilhasLink,
  getGoogleFlightsLink, 
  getKayakBrasilLink, 
  getMomondoLink,
  getAviasalesLink,
  getWayAwayLink 
} from "@/lib/affiliateLinks";
import { trackAffiliateClick } from "@/hooks/useAffiliateTracking";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FlightOperator {
  id: string;
  name: string;
  description: string;
  logo: string;
  color: string;
  getLink: (context: BookingContext) => string;
  priceVariation: number;
  hasAffiliate: boolean;
}

const FLIGHT_OPERATORS: FlightOperator[] = [
  {
    id: 'skyscanner',
    name: 'Skyscanner Brasil',
    description: 'Interface 100% em português com preços em R$',
    logo: '🔵',
    color: 'bg-cyan-500',
    getLink: getSkyscannerLink,
    priceVariation: 0,
    hasAffiliate: false,
  },
  {
    id: 'decolar',
    name: 'Decolar.com',
    description: 'Maior agência de viagens da América Latina',
    logo: '🟣',
    color: 'bg-purple-600',
    getLink: getDecolarLink,
    priceVariation: 0.02,
    hasAffiliate: false,
  },
  {
    id: '123milhas',
    name: '123Milhas',
    description: 'Parcelamento em até 12x sem juros',
    logo: '🟢',
    color: 'bg-green-500',
    getLink: get123MilhasLink,
    priceVariation: 0.01,
    hasAffiliate: false,
  },
  {
    id: 'aviasales',
    name: 'Aviasales',
    description: 'Melhor preço garantido + Cashback',
    logo: '🔷',
    color: 'bg-sky-500',
    getLink: getAviasalesLink,
    priceVariation: -0.02,
    hasAffiliate: true,
  },
  {
    id: 'google_flights',
    name: 'Google Flights',
    description: 'Acompanhe preços e veja calendário de tarifas',
    logo: '🔴',
    color: 'bg-blue-500',
    getLink: getGoogleFlightsLink,
    priceVariation: 0.01,
    hasAffiliate: false,
  },
  {
    id: 'kayak',
    name: 'Kayak Brasil',
    description: 'Compare centenas de sites de viagem',
    logo: '🟠',
    color: 'bg-orange-500',
    getLink: getKayakBrasilLink,
    priceVariation: 0.015,
    hasAffiliate: false,
  },
  {
    id: 'momondo',
    name: 'Momondo',
    description: 'Buscador global de passagens',
    logo: '🩷',
    color: 'bg-pink-500',
    getLink: getMomondoLink,
    priceVariation: 0.03,
    hasAffiliate: false,
  },
  {
    id: 'wayaway',
    name: 'WayAway',
    description: 'Até 10% de cashback em passagens',
    logo: '💚',
    color: 'bg-emerald-500',
    getLink: getWayAwayLink,
    priceVariation: -0.01,
    hasAffiliate: true,
  },
];

const AIRLINE_LOGOS: Record<string, { bg: string; text: string; abbr: string }> = {
  'GOL': { bg: 'bg-orange-500', text: 'text-white', abbr: 'G3' },
  'LATAM': { bg: 'bg-red-600', text: 'text-white', abbr: 'LA' },
  'Azul': { bg: 'bg-blue-600', text: 'text-white', abbr: 'AD' },
  'Passaredo': { bg: 'bg-green-500', text: 'text-white', abbr: '2Z' },
  'Aerolíneas Argentinas': { bg: 'bg-sky-500', text: 'text-white', abbr: 'AR' },
  'Avianca': { bg: 'bg-red-600', text: 'text-white', abbr: 'AV' },
  'Copa Airlines': { bg: 'bg-blue-700', text: 'text-white', abbr: 'CM' },
  'Aeromexico': { bg: 'bg-blue-800', text: 'text-white', abbr: 'AM' },
  'Aeromexico Connect': { bg: 'bg-blue-700', text: 'text-white', abbr: 'DM' },
  'JetSMART': { bg: 'bg-orange-600', text: 'text-white', abbr: 'JA' },
  'Sky Airline': { bg: 'bg-green-600', text: 'text-white', abbr: 'H2' },
  'Viva Air': { bg: 'bg-yellow-500', text: 'text-black', abbr: 'VH' },
  'Wingo': { bg: 'bg-green-500', text: 'text-white', abbr: 'W4' },
  'TAP Portugal': { bg: 'bg-green-600', text: 'text-white', abbr: 'TP' },
  'Air France': { bg: 'bg-blue-800', text: 'text-white', abbr: 'AF' },
  'British Airways': { bg: 'bg-blue-900', text: 'text-white', abbr: 'BA' },
  'Iberia': { bg: 'bg-red-600', text: 'text-white', abbr: 'IB' },
  'KLM': { bg: 'bg-blue-500', text: 'text-white', abbr: 'KL' },
  'Lufthansa': { bg: 'bg-yellow-500', text: 'text-blue-900', abbr: 'LH' },
  'ITA Airways': { bg: 'bg-green-600', text: 'text-white', abbr: 'AZ' },
  'Swiss': { bg: 'bg-red-600', text: 'text-white', abbr: 'LX' },
  'American Airlines': { bg: 'bg-blue-600', text: 'text-white', abbr: 'AA' },
  'United Airlines': { bg: 'bg-blue-700', text: 'text-white', abbr: 'UA' },
  'Delta': { bg: 'bg-blue-900', text: 'text-white', abbr: 'DL' },
  'JetBlue': { bg: 'bg-blue-500', text: 'text-white', abbr: 'B6' },
  'Spirit Airlines': { bg: 'bg-yellow-400', text: 'text-black', abbr: 'NK' },
  'Air Canada': { bg: 'bg-red-600', text: 'text-white', abbr: 'AC' },
  'Emirates': { bg: 'bg-red-700', text: 'text-white', abbr: 'EK' },
  'Qatar Airways': { bg: 'bg-purple-800', text: 'text-white', abbr: 'QR' },
  'Turkish Airlines': { bg: 'bg-red-600', text: 'text-white', abbr: 'TK' },
  'Ethiopian Airlines': { bg: 'bg-green-700', text: 'text-white', abbr: 'ET' },
  'Singapore Airlines': { bg: 'bg-yellow-600', text: 'text-blue-900', abbr: 'SQ' },
  'Voo Charter': { bg: 'bg-gray-500', text: 'text-white', abbr: 'CH' },
};

const getAirlineData = (airlineName: string) => {
  if (AIRLINE_LOGOS[airlineName]) {
    return AIRLINE_LOGOS[airlineName];
  }
  const colors = [
    { bg: 'bg-slate-600', text: 'text-white' },
    { bg: 'bg-zinc-600', text: 'text-white' },
    { bg: 'bg-neutral-600', text: 'text-white' },
    { bg: 'bg-stone-600', text: 'text-white' },
  ];
  const colorIndex = airlineName.charCodeAt(0) % colors.length;
  return {
    ...colors[colorIndex],
    abbr: airlineName.substring(0, 2).toUpperCase(),
  };
};

const CITY_NAMES: Record<string, string> = {
  'SAO': 'São Paulo',
  'GRU': 'São Paulo (Guarulhos)',
  'CGH': 'São Paulo (Congonhas)',
  'RIO': 'Rio de Janeiro',
  'GIG': 'Rio de Janeiro',
  'SDU': 'Rio de Janeiro (Santos Dumont)',
  'BUE': 'Buenos Aires',
  'EZE': 'Buenos Aires (Ezeiza)',
  'AEP': 'Buenos Aires (Aeroparque)',
  'LIS': 'Lisboa',
  'MAD': 'Madrid',
  'MIA': 'Miami',
  'NYC': 'Nova York',
  'JFK': 'Nova York (JFK)',
  'PAR': 'Paris',
  'CDG': 'Paris (Charles de Gaulle)',
  'LON': 'Londres',
  'LHR': 'Londres (Heathrow)',
  'SCL': 'Santiago',
  'LIM': 'Lima',
  'BOG': 'Bogotá',
  'MEX': 'Cidade do México',
  'ORL': 'Orlando',
  'MCO': 'Orlando',
  'LAX': 'Los Angeles',
  'CUN': 'Cancún',
  'BCN': 'Barcelona',
  'ROM': 'Roma',
  'AMS': 'Amsterdam',
  'DXB': 'Dubai',
};

export default function FlightDetails() {
  const { origem, destino, data } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchProgress, setSearchProgress] = useState(0);
  const [isSearching, setIsSearching] = useState(true);
  const [visibleOperators, setVisibleOperators] = useState<number>(0);
  
  // Get flight data from navigation state
  const flightFromState = location.state?.flight as FlightPrice | undefined;
  const returnFlightFromState = location.state?.returnFlight as FlightPrice | undefined;
  const originIata = location.state?.originIata || origem?.toUpperCase() || 'SAO';
  const tripType = location.state?.tripType || 'oneway';
  const returnDateStr = location.state?.returnDate;
  
  const isRoundTrip = tripType === 'roundtrip' && returnFlightFromState;
  
  // Fetch other flights for this route
  const { prices: otherFlights, isLoading } = useFlightPrices({
    origin: CITY_NAMES[originIata] || 'São Paulo',
    destination: destino?.toUpperCase(),
  });
  
  // Convert URL date format (AAMMDD) to Date
  const formattedDate = useMemo(() => {
    if (!data) return 'Data não especificada';
    try {
      let year, month, day;
      
      if (data.length === 8) {
        // Formato YYYYMMDD (8 dígitos)
        year = data.slice(0, 4);
        month = data.slice(4, 6);
        day = data.slice(6, 8);
      } else {
        // Formato YYMMDD (6 dígitos)
        year = `20${data.slice(0, 2)}`;
        month = data.slice(2, 4);
        day = data.slice(4, 6);
      }
      
      const dateObj = new Date(`${year}-${month}-${day}`);
      return format(dateObj, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  }, [data]);

  const formattedReturnDate = useMemo(() => {
    if (!returnDateStr) return '';
    try {
      const dateObj = new Date(returnDateStr);
      return format(dateObj, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return '';
    }
  }, [returnDateStr]);
  
  const isoDate = useMemo(() => {
    if (!data) return undefined;
    
    if (data.length === 8) {
      // Formato YYYYMMDD (8 dígitos)
      return `${data.slice(0, 4)}-${data.slice(4, 6)}-${data.slice(6, 8)}`;
    } else {
      // Formato YYMMDD (6 dígitos)
      const year = `20${data.slice(0, 2)}`;
      const month = data.slice(2, 4);
      const day = data.slice(4, 6);
      return `${year}-${month}-${day}`;
    }
  }, [data]);
  
  const originName = CITY_NAMES[originIata] || originIata;
  const destinationName = CITY_NAMES[destino?.toUpperCase() || ''] || destino?.toUpperCase() || '';
  
  // Simulate search progress
  useEffect(() => {
    setSearchProgress(0);
    setIsSearching(true);
    setVisibleOperators(0);
    
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsSearching(false);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    
    return () => clearInterval(progressInterval);
  }, [origem, destino, data]);
  
  // Reveal operators one by one
  useEffect(() => {
    if (searchProgress >= 30 && visibleOperators < FLIGHT_OPERATORS.length) {
      const revealInterval = setInterval(() => {
        setVisibleOperators(prev => {
          if (prev >= FLIGHT_OPERATORS.length) {
            clearInterval(revealInterval);
            return FLIGHT_OPERATORS.length;
          }
          return prev + 1;
        });
      }, 200);
      
      return () => clearInterval(revealInterval);
    }
  }, [searchProgress, visibleOperators]);
  
  // Calculate prices with variations
  const outboundPrice = flightFromState?.price || 500;
  const returnPrice = returnFlightFromState?.price || 0;
  const totalBasePrice = outboundPrice + returnPrice;
  
  const operatorsWithPrices = useMemo(() => {
    return FLIGHT_OPERATORS.map(op => ({
      ...op,
      calculatedPrice: Math.round(totalBasePrice * (1 + op.priceVariation)),
    })).sort((a, b) => a.calculatedPrice - b.calculatedPrice);
  }, [totalBasePrice]);
  
  const bestPrice = operatorsWithPrices[0]?.calculatedPrice || totalBasePrice;
  
  const handleSelectOperator = (operator: FlightOperator & { calculatedPrice: number }) => {
    const context: BookingContext = {
      city: destinationName,
      originIata: originIata,
      destinationIata: destino?.toUpperCase(),
      activityDate: isoDate,
    };
    
    trackAffiliateClick({
      partnerId: operator.id,
      partnerName: operator.name,
      category: "flights",
      component: "FlightDetails",
      destination: destino?.toUpperCase(),
      origin: originIata,
    });
    
    window.open(operator.getLink(context), "_blank", "noopener,noreferrer");
  };
  
  const handleViewOtherFlight = (flight: FlightPrice) => {
    const dateForUrl = flight.departureAt 
      ? `${flight.departureAt.slice(2, 4)}${flight.departureAt.slice(5, 7)}${flight.departureAt.slice(8, 10)}`
      : data;
    navigate(`/passagens/${originIata.toLowerCase()}/${flight.destination.toLowerCase()}/${dateForUrl}`, {
      state: { flight, originIata }
    });
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
  
  const getStopsText = (transfers: number) => {
    if (transfers === 0) return 'Direto';
    if (transfers === 1) return '1 parada';
    return `${transfers} paradas`;
  };

  const getDuration = (transfers: number) => {
    const base = transfers === 0 ? 3 : transfers === 1 ? 8 : 14;
    const hours = Math.floor(base);
    const mins = (base - hours) * 60;
    return `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`;
  };

  const outboundAirlineData = flightFromState 
    ? getAirlineData(flightFromState.airline)
    : { bg: 'bg-primary', text: 'text-white', abbr: 'VL' };

  const returnAirlineData = returnFlightFromState
    ? getAirlineData(returnFlightFromState.airline)
    : { bg: 'bg-primary', text: 'text-white', abbr: 'VL' };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back button */}
          <Button 
            variant="ghost" 
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para resultados
          </Button>
          
          {/* Route header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6 mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold">{originIata}</div>
                  {isRoundTrip ? (
                    <ArrowLeftRight className="h-5 w-5 text-primary" />
                  ) : (
                    <Plane className="h-5 w-5 text-primary" />
                  )}
                  <div className="text-2xl font-bold">{destino?.toUpperCase()}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Users className="h-3 w-3" />
                  1 adulto
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Briefcase className="h-3 w-3" />
                  Econômica
                </Badge>
                {isRoundTrip && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                    <ArrowLeftRight className="h-3 w-3" />
                    Ida e volta
                  </Badge>
                )}
              </div>
            </div>
            <div className="mt-3 text-muted-foreground">
              {formattedDate}
              {isRoundTrip && formattedReturnDate && (
                <> — {formattedReturnDate}</>
              )}
              {!isRoundTrip && ' • Só ida'}
            </div>
          </motion.div>
          
          {/* Search progress */}
          {isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border border-border rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Buscando em {FLIGHT_OPERATORS.length} operadoras...
                </span>
                <span className="text-sm font-medium text-primary ml-auto">{searchProgress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${searchProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.div>
          )}
          
          {/* Selected flight card(s) */}
          {flightFromState && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-semibold">✨ {isRoundTrip ? 'Voos selecionados' : 'Voo selecionado'}</span>
              </div>
              
              <div className="bg-card border-2 border-primary/30 rounded-xl overflow-hidden">
                {/* Outbound flight */}
                <div className="p-5">
                  {isRoundTrip && (
                    <Badge variant="outline" className="mb-3 gap-1">
                      <Plane className="h-3 w-3" />
                      IDA
                    </Badge>
                  )}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <div className={`w-10 h-10 rounded-lg ${outboundAirlineData.bg} ${outboundAirlineData.text} flex items-center justify-center font-bold text-sm`}>
                        {outboundAirlineData.abbr}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{flightFromState.airline}</p>
                        {flightFromState.flightNumber && (
                          <p className="text-xs text-muted-foreground">{flightFromState.flightNumber}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-center">
                        <p className="text-xl font-bold">{formatTime(flightFromState.departureAt)}</p>
                        <p className="text-xs text-muted-foreground">{originIata}</p>
                      </div>
                      
                      <div className="flex-1 flex flex-col items-center px-2">
                        <span className="text-xs text-muted-foreground mb-1">{getDuration(flightFromState.transfers)}</span>
                        <div className="flex items-center gap-1 w-full">
                          <div className="h-0.5 bg-border flex-1 rounded" />
                          <Plane className="h-4 w-4 text-primary" />
                          <div className="h-0.5 bg-border flex-1 rounded" />
                        </div>
                        <Badge 
                          variant={flightFromState.transfers === 0 ? "default" : "outline"} 
                          className={`mt-1 text-xs ${flightFromState.transfers === 0 ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}`}
                        >
                          {getStopsText(flightFromState.transfers)}
                        </Badge>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xl font-bold">
                          {flightFromState.returnAt ? formatTime(flightFromState.returnAt) : '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">{destino?.toUpperCase()}</p>
                      </div>
                    </div>
                    
                    <div className="text-right min-w-[120px] border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-4">
                      <p className="text-xs text-muted-foreground">Preço ida</p>
                      <p className="text-xl font-bold text-primary">
                        R$ {flightFromState.price.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Return flight */}
                {isRoundTrip && returnFlightFromState && (
                  <>
                    <div className="border-t border-dashed border-border" />
                    <div className="p-5">
                      <Badge variant="outline" className="mb-3 gap-1">
                        <Plane className="h-3 w-3 rotate-180" />
                        VOLTA
                      </Badge>
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-3 min-w-[140px]">
                          <div className={`w-10 h-10 rounded-lg ${returnAirlineData.bg} ${returnAirlineData.text} flex items-center justify-center font-bold text-sm`}>
                            {returnAirlineData.abbr}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{returnFlightFromState.airline}</p>
                            {returnFlightFromState.flightNumber && (
                              <p className="text-xs text-muted-foreground">{returnFlightFromState.flightNumber}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-center">
                            <p className="text-xl font-bold">{formatTime(returnFlightFromState.departureAt)}</p>
                            <p className="text-xs text-muted-foreground">{destino?.toUpperCase()}</p>
                          </div>
                          
                          <div className="flex-1 flex flex-col items-center px-2">
                            <span className="text-xs text-muted-foreground mb-1">{getDuration(returnFlightFromState.transfers)}</span>
                            <div className="flex items-center gap-1 w-full">
                              <div className="h-0.5 bg-border flex-1 rounded" />
                              <Plane className="h-4 w-4 text-primary rotate-180" />
                              <div className="h-0.5 bg-border flex-1 rounded" />
                            </div>
                            <Badge 
                              variant={returnFlightFromState.transfers === 0 ? "default" : "outline"} 
                              className={`mt-1 text-xs ${returnFlightFromState.transfers === 0 ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}`}
                            >
                              {getStopsText(returnFlightFromState.transfers)}
                            </Badge>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-xl font-bold">
                              {returnFlightFromState.returnAt ? formatTime(returnFlightFromState.returnAt) : '—'}
                            </p>
                            <p className="text-xs text-muted-foreground">{originIata}</p>
                          </div>
                        </div>
                        
                        <div className="text-right min-w-[120px] border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-4">
                          <p className="text-xs text-muted-foreground">Preço volta</p>
                          <p className="text-xl font-bold text-primary">
                            R$ {returnFlightFromState.price.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Total */}
                {isRoundTrip && (
                  <div className="bg-primary/5 border-t border-primary/20 px-5 py-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total ida + volta</span>
                      <span className="text-2xl font-bold text-primary">
                        R$ {totalBasePrice.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Operators list */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-semibold">📊 Compare preços em diferentes sites</span>
            </div>
            
            <div className="space-y-3">
              {operatorsWithPrices.slice(0, visibleOperators).map((operator, index) => {
                const isBest = operator.calculatedPrice === bestPrice;
                
                return (
                  <motion.div
                    key={operator.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-card border rounded-xl p-4 transition-all hover:shadow-md ${
                      isBest ? 'border-green-500/50 ring-1 ring-green-500/20' : 'border-border'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-xl ${operator.color} flex items-center justify-center text-2xl`}>
                          {operator.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{operator.name}</p>
                            {isBest && (
                              <Badge className="bg-green-500 text-white text-xs gap-1">
                                <Check className="h-3 w-3" />
                                Melhor preço
                              </Badge>
                            )}
                            {operator.hasAffiliate && (
                              <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600">
                                Cashback
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{operator.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <div className="text-right">
                          <p className={`text-xl font-bold ${isBest ? 'text-green-600' : 'text-foreground'}`}>
                            R$ {operator.calculatedPrice.toLocaleString('pt-BR')}
                          </p>
                          {!isBest && operator.calculatedPrice > bestPrice && (
                            <p className="text-xs text-muted-foreground">
                              +R$ {(operator.calculatedPrice - bestPrice).toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <Button 
                          onClick={() => handleSelectOperator(operator)}
                          className="gap-2 min-w-[120px]"
                          variant={isBest ? "default" : "outline"}
                        >
                          Selecionar
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {visibleOperators > 0 && (
              <p className="text-xs text-muted-foreground mt-4">
                ⚠️ Preços estimados. Valores podem variar no site da operadora.
              </p>
            )}
          </div>
          
          {/* Cross-sell */}
          <TripPackageUpsell
            destination={destino?.toUpperCase() || ''}
            destinationName={destinationName}
            checkIn={isoDate}
            checkOut={returnDateStr}
          />
          
          {/* Other flights on this date */}
          {otherFlights.length > 0 && !isLoading && !isRoundTrip && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-semibold">📅 Outros voos nesta rota</span>
              </div>
              
              <div className="space-y-2">
                {otherFlights.slice(0, 5).filter(f => f.price !== flightFromState?.price).map((flight, index) => {
                  const flightAirlineData = getAirlineData(flight.airline);
                  
                  return (
                    <div
                      key={index}
                      className="bg-card border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className={`w-8 h-8 rounded ${flightAirlineData.bg} ${flightAirlineData.text} flex items-center justify-center font-bold text-xs`}>
                          {flightAirlineData.abbr}
                        </div>
                        <span className="text-sm font-medium">{flight.airline}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1 text-sm">
                        <span className="font-medium">{formatTime(flight.departureAt)}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium">{formatTime(flight.returnAt)}</span>
                        <Badge variant="outline" className="text-xs ml-2">
                          {getStopsText(flight.transfers)}
                        </Badge>
                        <span className="text-muted-foreground text-xs ml-1">
                          {getDuration(flight.transfers)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">
                          R$ {flight.price.toLocaleString('pt-BR')}
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewOtherFlight(flight)}
                        >
                          Ver ofertas
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
