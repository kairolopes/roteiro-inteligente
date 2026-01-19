import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, MapPin, Calendar, Search, Loader2,
  TrendingDown, Sparkles, ArrowRight, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FlightResultCard } from "@/components/flights/FlightResultCard";
import { FlightFilters, FilterState, getDefaultFilters } from "@/components/flights/FlightFilters";
import { FlightPriceTabs, SortOption, TabOption } from "@/components/flights/FlightPriceTabs";
import { FlightSidebar } from "@/components/flights/FlightSidebar";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { useFlightPrices } from "@/hooks/useFlightPrices";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);
  const [hasSearched, setHasSearched] = useState(false);

  // Filter & Sort state
  const [filters, setFilters] = useState<FilterState>(getDefaultFilters());
  const [activeTab, setActiveTab] = useState<TabOption>("cheapest");
  const [sortBy, setSortBy] = useState<SortOption>("price");

  // Data hooks
  const { 
    flights, 
    isLoading: searchLoading, 
    search: searchFlights,
    destinationName,
    clear: clearFlights,
  } = useFlightSearch();

  // Popular destinations prices (shown before search)
  const { prices: popularPrices, isLoading: popularLoading } = useFlightPrices({
    origin: origin.toLowerCase(),
    enabled: !hasSearched,
  });

  // Handle search
  const handleSearch = () => {
    if (!destination) return;
    const dateStr = searchDate 
      ? format(searchDate, 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd');
    
    setHasSearched(true);
    searchFlights(origin, destination, dateStr);
  };

  // Handle back to popular destinations
  const handleBack = () => {
    setHasSearched(false);
    setDestination("");
    setSearchDate(undefined);
    clearFlights();
    setFilters(getDefaultFilters());
  };

  // Handle popular destination click
  const handlePopularClick = (destCode: string) => {
    setDestination(destCode);
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    setHasSearched(true);
    searchFlights(origin, destCode, dateStr);
  };

  // Apply filters to flights
  const filteredFlights = useMemo(() => {
    let result = [...flights];

    // Filter by stops
    result = result.filter(f => {
      if (f.transfers >= 2) return filters.stops.includes(2);
      return filters.stops.includes(f.transfers);
    });

    // Filter by airlines
    if (filters.airlines.length > 0) {
      result = result.filter(f => filters.airlines.includes(f.airline));
    }

    // Filter by departure time
    result = result.filter(f => {
      if (!f.departureAt) return true;
      const date = new Date(f.departureAt);
      const minutes = date.getHours() * 60 + date.getMinutes();
      return minutes >= filters.minDepartureTime && minutes <= filters.maxDepartureTime;
    });

    // Sort
    if (sortBy === 'price') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'duration') {
      result.sort((a, b) => a.transfers - b.transfers);
    } else if (sortBy === 'departure') {
      result.sort((a, b) => {
        const timeA = a.departureAt ? new Date(a.departureAt).getTime() : 0;
        const timeB = b.departureAt ? new Date(b.departureAt).getTime() : 0;
        return timeA - timeB;
      });
    }

    // Apply tab filter
    if (activeTab === 'fastest') {
      result.sort((a, b) => a.transfers - b.transfers);
    } else if (activeTab === 'best') {
      result.sort((a, b) => {
        const scoreA = a.price + (a.transfers * 500);
        const scoreB = b.price + (b.transfers * 500);
        return scoreA - scoreB;
      });
    }

    return result;
  }, [flights, filters, sortBy, activeTab]);

  const getOriginLabel = () => {
    return BRAZILIAN_ORIGINS.find(o => o.value === origin)?.label.split(' ')[0] || origin;
  };

  const getDestinationLabel = () => {
    return POPULAR_DESTINATIONS.find(d => d.value === destination)?.label || destinationName || destination;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Search */}
      <section className="pt-24 pb-6 md:pt-32 md:pb-8 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Preços reais atualizados em tempo real
            </Badge>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
              {hasSearched ? (
                <>
                  <span className="text-muted-foreground">{getOriginLabel()}</span>
                  <ArrowRight className="inline h-6 w-6 mx-2" />
                  <span className="text-primary">{getDestinationLabel()}</span>
                </>
              ) : (
                <>
                  Encontre as Passagens{" "}
                  <span className="text-primary">Mais Baratas</span>
                </>
              )}
            </h1>
            {!hasSearched && (
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Compare preços de centenas de companhias aéreas
              </p>
            )}
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-4 shadow-lg max-w-5xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Origin */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Select value={origin} onValueChange={setOrigin}>
                  <SelectTrigger className="pl-9 h-11">
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
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger className="pl-9 h-11">
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

              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-11 justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {searchDate ? format(searchDate, "dd MMM yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={searchDate}
                    onSelect={setSearchDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Search Button */}
              <Button 
                onClick={handleSearch} 
                className="h-11 gap-2"
                disabled={!destination}
              >
                <Search className="w-4 h-4" />
                Buscar
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-6 md:py-8">
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
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold mb-1">
                    Destinos Populares saindo de {getOriginLabel()}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Clique para ver os voos disponíveis
                  </p>
                </div>

                {popularLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
                            <p className="font-semibold">{price.destinationName}</p>
                            <p className="text-xs text-muted-foreground">{price.airline}</p>
                          </div>
                          {index === 0 && (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                              <TrendingDown className="w-3 h-3 mr-1" />
                              Menor
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xl font-bold text-primary">
                              R$ {price.price.toLocaleString('pt-BR')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {price.transfers === 0 ? 'Direto' : `${price.transfers} parada(s)`}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* After Search - Show Skyscanner-style Results */}
            {hasSearched && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Back Button */}
                <Button 
                  variant="ghost" 
                  onClick={handleBack}
                  className="mb-4 -ml-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Voltar para destinos
                </Button>

                {searchLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="text-center">
                      <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">Buscando as melhores ofertas...</p>
                    </div>
                  </div>
                ) : flights.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_200px] gap-6">
                    {/* Left Sidebar - Filters */}
                    <div className="hidden lg:block">
                      <FlightFilters
                        flights={flights}
                        filters={filters}
                        onFiltersChange={setFilters}
                      />
                    </div>

                    {/* Main Content - Results */}
                    <div>
                      {/* Price Tabs & Sort */}
                      <FlightPriceTabs
                        flights={filteredFlights}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                      />

                      {/* Results Count */}
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-muted-foreground">
                          {filteredFlights.length} voo(s) encontrado(s)
                          {searchDate && (
                            <> para {format(searchDate, "dd 'de' MMMM", { locale: ptBR })}</>
                          )}
                        </p>
                      </div>

                      {/* Flight Cards */}
                      <div className="space-y-3">
                        {filteredFlights.map((flight, index) => (
                          <FlightResultCard
                            key={`${flight.flightNumber}-${index}`}
                            flight={flight}
                            onSelect={() => {}}
                            isCheapest={index === 0 && sortBy === 'price'}
                            origin={getOriginLabel()}
                            originIata={origin}
                          />
                        ))}
                      </div>

                      {filteredFlights.length === 0 && (
                        <div className="text-center py-12 bg-muted/30 rounded-xl">
                          <Plane className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                          <p className="text-lg font-medium">Nenhum voo encontrado</p>
                          <p className="text-sm text-muted-foreground">
                            Tente ajustar os filtros ou buscar outra data
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Sidebar - Cross-sell */}
                    <div className="hidden lg:block">
                      <FlightSidebar
                        destination={destination}
                        destinationName={getDestinationLabel()}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Plane className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-lg font-medium">Nenhum voo encontrado</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Não encontramos voos para essa rota e data
                    </p>
                    <Button onClick={handleBack}>
                      Tentar outro destino
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Passagens;
