import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, MapPin, Calendar, Search, Loader2,
  TrendingDown, Sparkles, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FlightCalendar } from "@/components/flights/FlightCalendar";
import { FlightResultCard } from "@/components/flights/FlightResultCard";
import { MonthlyPriceChart } from "@/components/flights/MonthlyPriceChart";
import { FlightCompareModal, FlightCompareData } from "@/components/flights/FlightCompareModal";
import { useFlightCalendar, CalendarPrice } from "@/hooks/useFlightCalendar";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { useFlightMonthly } from "@/hooks/useFlightMonthly";
import { useFlightPrices } from "@/hooks/useFlightPrices";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BRAZILIAN_ORIGINS = [
  { value: "SAO", label: "São Paulo (GRU/CGH)" },
  { value: "RIO", label: "Rio de Janeiro (GIG/SDU)" },
  { value: "BSB", label: "Brasília (BSB)" },
  { value: "FOR", label: "Fortaleza (FOR)" },
  { value: "SSA", label: "Salvador (SSA)" },
  { value: "BHZ", label: "Belo Horizonte (CNF)" },
  { value: "CWB", label: "Curitiba (CWB)" },
  { value: "REC", label: "Recife (REC)" },
  { value: "POA", label: "Porto Alegre (POA)" },
];

const POPULAR_DESTINATIONS = [
  { value: "LIS", label: "Lisboa, Portugal" },
  { value: "PAR", label: "Paris, França" },
  { value: "MIA", label: "Miami, EUA" },
  { value: "NYC", label: "Nova York, EUA" },
  { value: "MCO", label: "Orlando, EUA" },
  { value: "LON", label: "Londres, Reino Unido" },
  { value: "MAD", label: "Madri, Espanha" },
  { value: "BCN", label: "Barcelona, Espanha" },
  { value: "ROM", label: "Roma, Itália" },
  { value: "AMS", label: "Amsterdam, Holanda" },
  { value: "CUN", label: "Cancún, México" },
  { value: "BUE", label: "Buenos Aires, Argentina" },
  { value: "SCL", label: "Santiago, Chile" },
  { value: "DXB", label: "Dubai, EAU" },
];

const Passagens = () => {
  // Search form state
  const [origin, setOrigin] = useState("SAO");
  const [destination, setDestination] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Calendar state
  const currentDate = new Date();
  const defaultMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Modal state
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<FlightCompareData | null>(null);

  // Data hooks
  const { calendar, cheapestDay, isLoading: calendarLoading } = useFlightCalendar({
    origin,
    destination,
    month: selectedMonth,
    enabled: hasSearched && !!destination,
  });

  const { monthly, cheapestMonth, isLoading: monthlyLoading } = useFlightMonthly({
    origin,
    destination,
    enabled: hasSearched && !!destination,
  });

  const { 
    flights, 
    isLoading: searchLoading, 
    search: searchFlights,
    destinationName,
  } = useFlightSearch();

  // Popular destinations prices (shown before search)
  const { prices: popularPrices, isLoading: popularLoading } = useFlightPrices({
    origin: origin.toLowerCase(),
    enabled: !hasSearched,
  });

  // Handle search
  const handleSearch = () => {
    if (!destination) return;
    setHasSearched(true);
    setSelectedDate(null);
  };

  // Handle day click in calendar
  const handleDayClick = (date: string, price: CalendarPrice) => {
    setSelectedDate(date);
    searchFlights(origin, destination, date);
  };

  // Handle month click in chart
  const handleMonthClick = (month: string) => {
    setSelectedMonth(month);
  };

  // Handle flight selection for comparison
  const handleFlightSelect = (flight: any) => {
    setSelectedFlight({
      origin: origin,
      originIata: flight.origin || origin,
      destination: flight.destinationName || destinationName || destination,
      destinationIata: flight.destination || destination,
      price: flight.price,
      departureAt: flight.departureAt,
    });
    setCompareModalOpen(true);
  };

  // Handle popular destination click
  const handlePopularClick = (destCode: string) => {
    setDestination(destCode);
    setHasSearched(true);
  };

  const getOriginLabel = () => {
    return BRAZILIAN_ORIGINS.find(o => o.value === origin)?.label.split(' ')[0] || origin;
  };

  const getDestinationLabel = () => {
    return POPULAR_DESTINATIONS.find(d => d.value === destination)?.label || destination;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Search */}
      <section className="pt-24 pb-8 md:pt-32 md:pb-12 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Preços reais atualizados em tempo real
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Encontre as Passagens{" "}
              <span className="text-primary">Mais Baratas</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Compare preços de centenas de companhias aéreas e encontre o melhor dia para viajar
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-lg max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Origin */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Select value={origin} onValueChange={setOrigin}>
                  <SelectTrigger className="pl-10 h-12">
                    <SelectValue placeholder="De onde?" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_ORIGINS.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Destination */}
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger className="pl-10 h-12">
                    <SelectValue placeholder="Para onde?" />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_DESTINATIONS.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <Button 
                onClick={handleSearch} 
                size="lg" 
                className="h-12 gap-2"
                disabled={!destination}
              >
                <Search className="w-4 h-4" />
                Buscar Preços
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8 md:py-12">
        <div className="container px-4">
          <AnimatePresence mode="wait">
            {/* Before Search - Show Popular Destinations */}
            {!hasSearched && (
              <motion.div
                key="popular"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">
                    Destinos Populares saindo de {getOriginLabel()}
                  </h2>
                  <p className="text-muted-foreground">
                    Preços mais baixos encontrados para os próximos meses
                  </p>
                </div>

                {popularLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {popularPrices.slice(0, 8).map((price, index) => (
                      <motion.div
                        key={price.destination}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handlePopularClick(price.destination)}
                        className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-lg">{price.destinationName}</p>
                            <p className="text-sm text-muted-foreground">{price.airline}</p>
                          </div>
                          {index === 0 && (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              <TrendingDown className="w-3 h-3 mr-1" />
                              Menor
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              R$ {price.price.toLocaleString('pt-BR')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {price.transfers === 0 ? 'Voo direto' : `${price.transfers} parada(s)`}
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* After Search - Show Calendar & Results */}
            {hasSearched && destination && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Route Header */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">
                    {getOriginLabel()} <ArrowRight className="inline h-5 w-5 mx-2" /> {getDestinationLabel()}
                  </h2>
                  <p className="text-muted-foreground">
                    Selecione uma data no calendário para ver os voos disponíveis
                  </p>
                  <Button 
                    variant="link" 
                    onClick={() => setHasSearched(false)}
                    className="mt-2"
                  >
                    ← Voltar para destinos populares
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Calendar */}
                  <FlightCalendar
                    calendar={calendar}
                    month={selectedMonth}
                    cheapestDay={cheapestDay}
                    isLoading={calendarLoading}
                    onDayClick={handleDayClick}
                    onMonthChange={setSelectedMonth}
                    selectedDate={selectedDate || undefined}
                  />

                  {/* Monthly Chart */}
                  <MonthlyPriceChart
                    monthly={monthly}
                    cheapestMonth={cheapestMonth}
                    isLoading={monthlyLoading}
                    onMonthClick={handleMonthClick}
                  />
                </div>

                {/* Flight Results */}
                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">
                        Voos para{' '}
                        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </h3>
                      {!searchLoading && flights.length > 0 && (
                        <Badge variant="outline">
                          {flights.length} voo(s) encontrado(s)
                        </Badge>
                      )}
                    </div>

                    {searchLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : flights.length > 0 ? (
                      <div className="space-y-4">
                        {flights.map((flight, index) => (
                          <FlightResultCard
                            key={`${flight.flightNumber}-${index}`}
                            flight={flight}
                            onSelect={handleFlightSelect}
                            isCheapest={index === 0}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Plane className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p>Nenhum voo encontrado para esta data.</p>
                        <p className="text-sm">Tente selecionar outra data no calendário.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Prompt to select date if none selected */}
                {!selectedDate && !calendarLoading && Object.keys(calendar).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 bg-muted/30 rounded-2xl"
                  >
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                    <p className="text-lg font-medium">
                      Clique em um dia no calendário para ver os voos
                    </p>
                    <p className="text-muted-foreground">
                      Os dias verdes têm os melhores preços
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Compare Modal */}
      <FlightCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        flight={selectedFlight}
      />

      <Footer />
    </div>
  );
};

export default Passagens;
