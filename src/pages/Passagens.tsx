import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, MapPin, Calendar, Search, Filter, ChevronDown, 
  TrendingDown, Sparkles, Clock, ArrowUpDown, X, SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getAviasalesLink, getSkyscannerLink } from "@/lib/affiliateLinks";
import { FlightCompareButtons } from "@/components/flights/FlightCompareButtons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Extended flight deals data
const allFlightDeals = [
  { id: 1, from: "São Paulo", to: "Lisboa", airline: "TAP Portugal", price: 2890, originalPrice: 5200, discount: 44, dates: "Mar - Abr 2025", stops: "Direto", duration: "9h 30m", departure: "22:00", tag: "Mais Barato", image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600" },
  { id: 2, from: "Rio de Janeiro", to: "Paris", airline: "Air France", price: 3450, originalPrice: 5800, discount: 41, dates: "Fev - Mar 2025", stops: "Direto", duration: "11h 15m", departure: "21:30", tag: "Popular", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600" },
  { id: 3, from: "São Paulo", to: "Miami", airline: "LATAM", price: 2190, originalPrice: 3800, discount: 42, dates: "Jan - Fev 2025", stops: "Direto", duration: "8h 45m", departure: "23:00", tag: "Cashback 10%", image: "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=600" },
  { id: 4, from: "Brasília", to: "Roma", airline: "Alitalia", price: 3290, originalPrice: 5500, discount: 40, dates: "Abr - Mai 2025", stops: "1 parada", duration: "14h 20m", departure: "18:00", tag: "Promoção", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600" },
  { id: 5, from: "São Paulo", to: "Londres", airline: "British Airways", price: 3290, originalPrice: 5200, discount: 37, dates: "Mar - Abr 2025", stops: "1 parada", duration: "13h 00m", departure: "20:00", tag: "Promoção", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600" },
  { id: 6, from: "Rio de Janeiro", to: "Madri", airline: "Iberia", price: 2890, originalPrice: 4100, discount: 30, dates: "Fev - Mar 2025", stops: "Direto", duration: "10h 00m", departure: "22:30", tag: "Cashback 10%", image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600" },
  { id: 7, from: "São Paulo", to: "Nova York", airline: "American Airlines", price: 2490, originalPrice: 3800, discount: 34, dates: "Jan - Fev 2025", stops: "Direto", duration: "9h 50m", departure: "23:30", tag: "Popular", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600" },
  { id: 8, from: "Brasília", to: "Amsterdam", airline: "KLM", price: 3590, originalPrice: 5500, discount: 35, dates: "Abr - Mai 2025", stops: "1 parada", duration: "14h 00m", departure: "19:00", tag: "Últimas Vagas", image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600" },
  { id: 9, from: "São Paulo", to: "Dubai", airline: "Emirates", price: 4290, originalPrice: 6900, discount: 38, dates: "Mar - Abr 2025", stops: "Direto", duration: "14h 30m", departure: "02:00", tag: "Luxo", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600" },
  { id: 10, from: "Rio de Janeiro", to: "Cancún", airline: "Aeromexico", price: 1990, originalPrice: 3200, discount: 38, dates: "Fev - Mar 2025", stops: "1 parada", duration: "10h 30m", departure: "08:00", tag: "Praia", image: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=600" },
  { id: 11, from: "São Paulo", to: "Buenos Aires", airline: "Aerolíneas Argentinas", price: 890, originalPrice: 1500, discount: 41, dates: "Jan - Mar 2025", stops: "Direto", duration: "2h 50m", departure: "10:00", tag: "Mais Barato", image: "https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=600" },
  { id: 12, from: "São Paulo", to: "Santiago", airline: "LATAM", price: 1190, originalPrice: 2000, discount: 40, dates: "Fev - Abr 2025", stops: "Direto", duration: "4h 10m", departure: "07:30", tag: "Promoção", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600" },
  { id: 13, from: "Rio de Janeiro", to: "Orlando", airline: "GOL", price: 2390, originalPrice: 4000, discount: 40, dates: "Mar - Mai 2025", stops: "Direto", duration: "9h 00m", departure: "21:00", tag: "Família", image: "https://images.unsplash.com/photo-1575089976121-8ed7b2a54265?w=600" },
  { id: 14, from: "São Paulo", to: "Barcelona", airline: "Iberia", price: 3190, originalPrice: 4800, discount: 33, dates: "Abr - Jun 2025", stops: "1 parada", duration: "13h 30m", departure: "19:30", tag: "Popular", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600" },
  { id: 15, from: "Fortaleza", to: "Lisboa", airline: "TAP Portugal", price: 2490, originalPrice: 4200, discount: 41, dates: "Mar - Mai 2025", stops: "Direto", duration: "7h 00m", departure: "23:00", tag: "Mais Barato", image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600" },
  { id: 16, from: "São Paulo", to: "Tóquio", airline: "Japan Airlines", price: 5490, originalPrice: 8500, discount: 35, dates: "Abr - Jun 2025", stops: "1 parada", duration: "24h 30m", departure: "00:30", tag: "Aventura", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600" },
  { id: 17, from: "Rio de Janeiro", to: "Cape Town", airline: "South African Airways", price: 3890, originalPrice: 6000, discount: 35, dates: "Mar - Mai 2025", stops: "1 parada", duration: "12h 00m", departure: "17:00", tag: "Aventura", image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600" },
  { id: 18, from: "São Paulo", to: "Cartagena", airline: "Avianca", price: 1590, originalPrice: 2800, discount: 43, dates: "Fev - Abr 2025", stops: "1 parada", duration: "7h 30m", departure: "06:00", tag: "Praia", image: "https://images.unsplash.com/photo-1583531172005-521bb8cd40b7?w=600" },
];

const airlines = ["TAP Portugal", "Air France", "LATAM", "British Airways", "Iberia", "American Airlines", "KLM", "Emirates", "Aeromexico", "GOL", "Japan Airlines", "Avianca"];
const origins = ["São Paulo", "Rio de Janeiro", "Brasília", "Fortaleza"];
const destinations = ["Lisboa", "Paris", "Miami", "Roma", "Londres", "Madri", "Nova York", "Amsterdam", "Dubai", "Cancún", "Buenos Aires", "Santiago", "Orlando", "Barcelona", "Tóquio", "Cape Town", "Cartagena"];

const getTagColor = (tag: string) => {
  const colors: Record<string, string> = {
    "Mais Barato": "bg-green-500/10 text-green-600 border-green-500/20",
    "Cashback 10%": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Promoção": "bg-primary/10 text-primary border-primary/20",
    "Últimas Vagas": "bg-destructive/10 text-destructive border-destructive/20",
    "Luxo": "bg-purple-500/10 text-purple-600 border-purple-500/20",
    "Praia": "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    "Popular": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "Família": "bg-pink-500/10 text-pink-600 border-pink-500/20",
    "Aventura": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  };
  return colors[tag] || "bg-muted text-muted-foreground";
};

const Passagens = () => {
  const [searchOrigin, setSearchOrigin] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [priceRange, setPriceRange] = useState([0, 6000]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("discount");
  const [showFilters, setShowFilters] = useState(false);

  const filteredDeals = useMemo(() => {
    let filtered = allFlightDeals.filter((deal) => {
      const matchesOrigin = !searchOrigin || deal.from.toLowerCase().includes(searchOrigin.toLowerCase());
      const matchesDestination = !searchDestination || deal.to.toLowerCase().includes(searchDestination.toLowerCase());
      const matchesPrice = deal.price >= priceRange[0] && deal.price <= priceRange[1];
      const matchesAirline = selectedAirlines.length === 0 || selectedAirlines.includes(deal.airline);
      const matchesStops = selectedStops.length === 0 || selectedStops.includes(deal.stops);
      
      return matchesOrigin && matchesDestination && matchesPrice && matchesAirline && matchesStops;
    });

    // Sort
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        filtered.sort((a, b) => b.discount - a.discount);
        break;
      case "duration":
        filtered.sort((a, b) => {
          const durationA = parseInt(a.duration.split("h")[0]);
          const durationB = parseInt(b.duration.split("h")[0]);
          return durationA - durationB;
        });
        break;
    }

    return filtered;
  }, [searchOrigin, searchDestination, priceRange, selectedAirlines, selectedStops, sortBy]);

  const handleDealClick = (deal: typeof allFlightDeals[0], provider: "aviasales" | "skyscanner") => {
    const context = { city: deal.to, departureCity: deal.from };
    const link = provider === "aviasales" ? getAviasalesLink(context) : getSkyscannerLink(context);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleAviasalesSearch = () => {
    const context = { city: searchDestination || "europe", departureCity: searchOrigin || undefined };
    window.open(getAviasalesLink(context), "_blank", "noopener,noreferrer");
  };

  const handleSkyscannerSearch = () => {
    const context = { city: searchDestination || "europe", departureCity: searchOrigin || undefined };
    window.open(getSkyscannerLink(context), "_blank", "noopener,noreferrer");
  };

  const toggleAirline = (airline: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airline) ? prev.filter((a) => a !== airline) : [...prev, airline]
    );
  };

  const toggleStops = (stops: string) => {
    setSelectedStops((prev) =>
      prev.includes(stops) ? prev.filter((s) => s !== stops) : [...prev, stops]
    );
  };

  const clearFilters = () => {
    setSearchOrigin("");
    setSearchDestination("");
    setPriceRange([0, 6000]);
    setSelectedAirlines([]);
    setSelectedStops([]);
  };

  const activeFiltersCount = [
    searchOrigin,
    searchDestination,
    priceRange[0] > 0 || priceRange[1] < 6000,
    selectedAirlines.length > 0,
    selectedStops.length > 0,
  ].filter(Boolean).length;

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Faixa de Preço</Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={6000}
          step={100}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>R$ {priceRange[0].toLocaleString()}</span>
          <span>R$ {priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Stops */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Paradas</Label>
        <div className="space-y-2">
          {["Direto", "1 parada"].map((stops) => (
            <div key={stops} className="flex items-center space-x-2">
              <Checkbox
                id={stops}
                checked={selectedStops.includes(stops)}
                onCheckedChange={() => toggleStops(stops)}
              />
              <label htmlFor={stops} className="text-sm cursor-pointer">
                {stops}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Airlines */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Companhias Aéreas</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {airlines.map((airline) => (
            <div key={airline} className="flex items-center space-x-2">
              <Checkbox
                id={airline}
                checked={selectedAirlines.includes(airline)}
                onCheckedChange={() => toggleAirline(airline)}
              />
              <label htmlFor={airline} className="text-sm cursor-pointer">
                {airline}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="w-4 h-4 mr-2" />
          Limpar Filtros ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

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
              Até 50% de desconto + Cashback
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Passagens Aéreas{" "}
              <span className="text-primary">Baratas</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Compare preços de centenas de companhias aéreas e encontre as melhores ofertas
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-lg max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="De onde?"
                  value={searchOrigin}
                  onChange={(e) => setSearchOrigin(e.target.value)}
                  className="pl-10 h-12"
                  list="origins"
                />
                <datalist id="origins">
                  {origins.map((o) => <option key={o} value={o} />)}
                </datalist>
              </div>
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Para onde?"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  className="pl-10 h-12"
                  list="destinations"
                />
                <datalist id="destinations">
                  {destinations.map((d) => <option key={d} value={d} />)}
                </datalist>
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Quando?"
                  className="pl-10 h-12"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAviasalesSearch} size="lg" className="h-12 gap-2 flex-1 bg-orange-500 hover:bg-orange-600">
                  <Plane className="w-4 h-4" />
                  Aviasales
                </Button>
                <Button onClick={handleSkyscannerSearch} size="lg" className="h-12 gap-2 flex-1 bg-cyan-500 hover:bg-cyan-600">
                  <Plane className="w-4 h-4" />
                  Skyscanner
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8 md:py-12">
        <div className="container px-4">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredDeals.length}</span> ofertas encontradas
              </p>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount} filtro{activeFiltersCount > 1 ? "s" : ""} ativo{activeFiltersCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden flex-1">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filtros
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 overflow-y-auto">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">Maior Desconto</SelectItem>
                  <SelectItem value="price-asc">Menor Preço</SelectItem>
                  <SelectItem value="price-desc">Maior Preço</SelectItem>
                  <SelectItem value="duration">Menor Duração</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden md:block w-64 shrink-0">
              <div className="sticky top-24 bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtros
                  </h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-primary hover:underline"
                    >
                      Limpar
                    </button>
                  )}
                </div>
                <FiltersContent />
              </div>
            </aside>

            {/* Deals Grid */}
            <div className="flex-1">
              {filteredDeals.length === 0 ? (
                <div className="text-center py-12">
                  <Plane className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma oferta encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Tente ajustar os filtros ou buscar outro destino
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredDeals.map((deal, index) => (
                      <motion.div
                        key={deal.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ y: -4 }}
                        className="group bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                      >
                        {/* Image */}
                        <div className="relative h-32 sm:h-36 overflow-hidden">
                          <img
                            src={deal.image}
                            alt={deal.to}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          <Badge className={`absolute top-2 left-2 text-xs ${getTagColor(deal.tag)}`}>
                            {deal.tag}
                          </Badge>
                          
                          <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            {deal.discount}%
                          </div>

                          <div className="absolute bottom-2 left-2 right-2 text-white">
                            <div className="flex items-center gap-1 text-sm font-bold">
                              <span>{deal.from}</span>
                              <Plane className="w-3 h-3" />
                              <span>{deal.to}</span>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-3 sm:p-4">
                          <p className="text-xs text-muted-foreground mb-1">{deal.airline}</p>
                          
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-xl font-bold text-primary">
                              R$ {deal.price.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground line-through">
                              R$ {deal.originalPrice.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {deal.duration}
                            </span>
                            <span>{deal.stops}</span>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-2 mb-3">{deal.dates}</p>

                          {/* Compare Buttons */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 text-xs bg-orange-500 hover:bg-orange-600 text-white"
                              onClick={() => handleDealClick(deal, "aviasales")}
                            >
                              Aviasales
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 text-xs bg-cyan-500 hover:bg-cyan-600 text-white"
                              onClick={() => handleDealClick(deal, "skyscanner")}
                            >
                              Skyscanner
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Load More / CTA */}
              {filteredDeals.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="mt-10 text-center"
                >
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      size="lg"
                      onClick={handleAviasalesSearch}
                      className="gap-2 bg-orange-500 hover:bg-orange-600"
                    >
                      <Plane className="w-4 h-4" />
                      Ver Mais no Aviasales
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleSkyscannerSearch}
                      className="gap-2 bg-cyan-500 hover:bg-cyan-600"
                    >
                      <Plane className="w-4 h-4" />
                      Ver Mais no Skyscanner
                    </Button>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Compare preços em múltiplos sites
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Passagens;
