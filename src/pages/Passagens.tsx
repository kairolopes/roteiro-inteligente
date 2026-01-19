import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, MapPin, Calendar, Search, Loader2,
  TrendingDown, Sparkles, ArrowRight, ChevronLeft, ArrowLeftRight, Hotel
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FlightResultCard } from "@/components/flights/FlightResultCard";
import { FlightFilters, FilterState, getDefaultFilters } from "@/components/flights/FlightFilters";
import { FlightPriceTabs, SortOption, TabOption } from "@/components/flights/FlightPriceTabs";
import { ProductTabs, ProductType } from "@/components/flights/ProductTabs";
import { TripTypeSelector, TripType } from "@/components/flights/TripTypeSelector";
import { PassengerSelector, PassengerCounts } from "@/components/flights/PassengerSelector";
import { ClassSelector, CabinClass } from "@/components/flights/ClassSelector";
import { RoundTripResultCard } from "@/components/flights/RoundTripResultCard";
import { TripPackageUpsell } from "@/components/flights/TripPackageUpsell";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { useFlightPrices } from "@/hooks/useFlightPrices";
import { useRoundTripSearch } from "@/hooks/useRoundTripSearch";
import { getHotellookLink, getGetYourGuideLink, BookingContext } from "@/lib/affiliateLinks";
import { trackAffiliateClick } from "@/hooks/useAffiliateTracking";
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
  const navigate = useNavigate();
  
  // Product & Trip type
  const [activeProduct, setActiveProduct] = useState<ProductType>("flights");
  const [tripType, setTripType] = useState<TripType>("roundtrip");
  
  // Search form state
  const [origin, setOrigin] = useState("SAO");
  const [destination, setDestination] = useState("");
  const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [passengers, setPassengers] = useState<PassengerCounts>({ adults: 1, children: 0, infants: 0 });
  const [cabinClass, setCabinClass] = useState<CabinClass>("economy");
  const [hasSearched, setHasSearched] = useState(false);

  // Filter & Sort state
  const [filters, setFilters] = useState<FilterState>(getDefaultFilters());
  const [activeTab, setActiveTab] = useState<TabOption>("cheapest");
  const [sortBy, setSortBy] = useState<SortOption>("price");

  // Data hooks - One-way
  const { 
    flights, 
    isLoading: searchLoading, 
    search: searchFlights,
    destinationName,
    clear: clearFlights,
  } = useFlightSearch();
  
  // Data hooks - Round-trip
  const {
    combinedFlights,
    isLoading: roundTripLoading,
    search: searchRoundTrip,
    clear: clearRoundTrip,
    destinationName: roundTripDestName,
  } = useRoundTripSearch();

  // Popular destinations prices (shown before search)
  const { prices: popularPrices, isLoading: popularLoading } = useFlightPrices({
    origin: origin.toLowerCase(),
    enabled: !hasSearched && activeProduct === "flights",
  });

  // Handle search
  const handleSearch = () => {
    if (!destination) return;
    
    const dateStr = searchDate 
      ? format(searchDate, 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd');
    
    setHasSearched(true);
    
    if (tripType === 'roundtrip' && returnDate) {
      const returnDateStr = format(returnDate, 'yyyy-MM-dd');
      searchRoundTrip(origin, destination, dateStr, returnDateStr);
    } else {
      searchFlights(origin, destination, dateStr);
    }
  };

  // Handle back to popular destinations
  const handleBack = () => {
    setHasSearched(false);
    setDestination("");
    setSearchDate(undefined);
    setReturnDate(undefined);
    clearFlights();
    clearRoundTrip();
    setFilters(getDefaultFilters());
  };

  // Handle popular destination click
  const handlePopularClick = (destCode: string) => {
    setDestination(destCode);
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    setHasSearched(true);
    searchFlights(origin, destCode, dateStr);
  };

  // Handle product change
  const handleProductChange = (product: ProductType) => {
    setActiveProduct(product);
    
    if (product === "hotels" && destination) {
      const context: BookingContext = {
        city: getDestinationLabel(),
        destinationIata: destination,
      };
      trackAffiliateClick({
        partnerId: "hotellook",
        partnerName: "Hotellook",
        category: "hotels",
        component: "ProductTabs",
        destination: getDestinationLabel(),
      });
      window.open(getHotellookLink(context), "_blank", "noopener,noreferrer");
    } else if (product === "activities" && destination) {
      const context: BookingContext = {
        city: getDestinationLabel(),
        destinationIata: destination,
      };
      trackAffiliateClick({
        partnerId: "getyourguide",
        partnerName: "GetYourGuide",
        category: "tours",
        component: "ProductTabs",
        destination: getDestinationLabel(),
      });
      window.open(getGetYourGuideLink(context), "_blank", "noopener,noreferrer");
    } else if (product === "cars" && destination) {
      const rentalUrl = `https://www.rentalcars.com/SearchResults.do?country=${encodeURIComponent(getDestinationLabel())}`;
      window.open(rentalUrl, "_blank", "noopener,noreferrer");
    }
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

  // Filtered combined flights for round-trip
  const filteredCombinedFlights = useMemo(() => {
    let result = [...combinedFlights];
    
    if (activeTab === 'fastest') {
      result.sort((a, b) => a.totalTransfers - b.totalTransfers);
    } else if (activeTab === 'best') {
      result.sort((a, b) => {
        const scoreA = a.totalPrice + (a.totalTransfers * 500);
        const scoreB = b.totalPrice + (b.totalTransfers * 500);
        return scoreA - scoreB;
      });
    }
    
    return result;
  }, [combinedFlights, activeTab]);

  const getOriginLabel = () => {
    return BRAZILIAN_ORIGINS.find(o => o.value === origin)?.label.split(' ')[0] || origin;
  };

  const getDestinationLabel = () => {
    return POPULAR_DESTINATIONS.find(d => d.value === destination)?.label || 
           (tripType === 'roundtrip' ? roundTripDestName : destinationName) || 
           destination;
  };

  const isLoading = tripType === 'roundtrip' ? roundTripLoading : searchLoading;
  const hasResults = tripType === 'roundtrip' ? combinedFlights.length > 0 : flights.length > 0;

  // Navigate to flight details
  const handleFlightSelect = (outbound: any, returnFlight?: any) => {
    const dateForUrl = outbound.departureAt 
      ? `${outbound.departureAt.slice(2, 4)}${outbound.departureAt.slice(5, 7)}${outbound.departureAt.slice(8, 10)}`
      : format(searchDate || new Date(), 'yyMMdd');
    
    navigate(`/passagens/${origin.toLowerCase()}/${destination.toLowerCase()}/${dateForUrl}`, {
      state: { 
        flight: outbound, 
        returnFlight,
        originIata: origin,
        tripType,
        returnDate: returnDate ? format(returnDate, 'yyyy-MM-dd') : undefined,
      }
    });
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
              Compare preços em centenas de sites
            </Badge>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
              {hasSearched ? (
                <span className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-muted-foreground">{getOriginLabel()}</span>
                  {tripType === 'roundtrip' ? (
                    <ArrowLeftRight className="h-6 w-6 text-primary" />
                  ) : (
                    <ArrowRight className="h-6 w-6" />
                  )}
                  <span className="text-primary">{getDestinationLabel()}</span>
                </span>
              ) : (
                <>
                  Encontre as Melhores{" "}
                  <span className="text-primary">Ofertas de Viagem</span>
                </>
              )}
            </h1>
            {!hasSearched && (
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Voos, hotéis, carros e experiências em um só lugar
              </p>
            )}
          </motion.div>

          {/* Product Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex justify-center mb-4"
          >
            <ProductTabs 
              activeProduct={activeProduct} 
              onProductChange={handleProductChange}
            />
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-lg max-w-5xl mx-auto"
          >
            {/* Trip Type Selector */}
            <div className="mb-4">
              <TripTypeSelector value={tripType} onChange={setTripType} />
            </div>

            {/* Main Search Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
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

              {/* Swap Button (hidden on mobile) */}
              <div className="hidden lg:flex items-center justify-center -mx-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-muted hover:bg-muted/80"
                  onClick={() => {
                    if (destination) {
                      const temp = origin;
                      setOrigin(destination);
                      setDestination(temp);
                    }
                  }}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
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

              {/* Date Picker - Departure */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-11 justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {searchDate ? format(searchDate, "dd MMM", { locale: ptBR }) : "Ida"}
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

              {/* Date Picker - Return (only for round-trip) */}
              {tripType === 'roundtrip' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-11 justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {returnDate ? format(returnDate, "dd MMM", { locale: ptBR }) : "Volta"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={returnDate}
                      onSelect={setReturnDate}
                      disabled={(date) => date < (searchDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Secondary Fields */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <PassengerSelector value={passengers} onChange={setPassengers} />
              <ClassSelector value={cabinClass} onChange={setCabinClass} />
              
              <Button 
                onClick={handleSearch} 
                className="h-11 gap-2 col-span-2"
                disabled={!destination || (tripType === 'roundtrip' && !returnDate)}
              >
                <Search className="w-4 h-4" />
                Buscar voos
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

            {/* After Search - Show Results */}
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

                {isLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="text-center">
                      <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">Buscando as melhores ofertas...</p>
                    </div>
                  </div>
                ) : hasResults ? (
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                    {/* Main Content - Results */}
                    <div>
                      {/* Price Tabs & Sort */}
                      <FlightPriceTabs
                        flights={tripType === 'roundtrip' ? combinedFlights.map(c => c.outbound) : filteredFlights}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                      />

                      {/* Results Count */}
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-muted-foreground">
                          {tripType === 'roundtrip' 
                            ? `${filteredCombinedFlights.length} combinação(ões) encontrada(s)`
                            : `${filteredFlights.length} voo(s) encontrado(s)`
                          }
                          {searchDate && (
                            <> para {format(searchDate, "dd 'de' MMMM", { locale: ptBR })}</>
                          )}
                          {tripType === 'roundtrip' && returnDate && (
                            <> - {format(returnDate, "dd 'de' MMMM", { locale: ptBR })}</>
                          )}
                        </p>
                      </div>

                      {/* Upsell Banner */}
                      <TripPackageUpsell
                        destination={destination}
                        destinationName={getDestinationLabel()}
                        checkIn={searchDate ? format(searchDate, 'yyyy-MM-dd') : undefined}
                        checkOut={returnDate ? format(returnDate, 'yyyy-MM-dd') : undefined}
                        variant="compact"
                      />

                      {/* Flight Cards */}
                      <div className="space-y-3 mt-4">
                        {tripType === 'roundtrip' ? (
                          // Round-trip results
                          filteredCombinedFlights.map((combined, index) => (
                            <RoundTripResultCard
                              key={`${combined.outbound.flightNumber}-${combined.return.flightNumber}-${index}`}
                              outbound={combined.outbound}
                              returnFlight={combined.return}
                              totalPrice={combined.totalPrice}
                              onSelect={() => handleFlightSelect(combined.outbound, combined.return)}
                              isCheapest={index === 0 && activeTab === 'cheapest'}
                              origin={getOriginLabel()}
                              originIata={origin}
                            />
                          ))
                        ) : (
                          // One-way results
                          filteredFlights.map((flight, index) => (
                            <FlightResultCard
                              key={`${flight.flightNumber}-${index}`}
                              flight={flight}
                              onSelect={() => handleFlightSelect(flight)}
                              isCheapest={index === 0 && sortBy === 'price'}
                              origin={getOriginLabel()}
                              originIata={origin}
                            />
                          ))
                        )}
                      </div>

                      {!hasResults && (
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
                      <TripPackageUpsell
                        destination={destination}
                        destinationName={getDestinationLabel()}
                        checkIn={searchDate ? format(searchDate, 'yyyy-MM-dd') : undefined}
                        checkOut={returnDate ? format(returnDate, 'yyyy-MM-dd') : undefined}
                        variant="full"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Plane className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-lg font-medium">Nenhum voo encontrado</p>
                    <p className="text-sm text-muted-foreground">
                      Tente outra data ou destino
                    </p>
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
