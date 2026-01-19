import { motion } from "framer-motion";
import { Plane, MapPin, Calendar, Sparkles, TrendingDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { getAviasalesLink, getSkyscannerLink } from "@/lib/affiliateLinks";
import { trackAffiliateClick } from "@/hooks/useAffiliateTracking";
import { cn } from "@/lib/utils";

// Brazilian cities with IATA codes
const brazilianCities = [
  { name: "São Paulo", iata: "SAO" },
  { name: "Rio de Janeiro", iata: "RIO" },
  { name: "Brasília", iata: "BSB" },
  { name: "Salvador", iata: "SSA" },
  { name: "Fortaleza", iata: "FOR" },
  { name: "Belo Horizonte", iata: "BHZ" },
  { name: "Manaus", iata: "MAO" },
  { name: "Curitiba", iata: "CWB" },
  { name: "Recife", iata: "REC" },
  { name: "Porto Alegre", iata: "POA" },
  { name: "Goiânia", iata: "GYN" },
  { name: "Florianópolis", iata: "FLN" },
  { name: "Natal", iata: "NAT" },
  { name: "Maceió", iata: "MCZ" },
  { name: "Vitória", iata: "VIX" },
  { name: "Belém", iata: "BEL" },
  { name: "Campinas", iata: "VCP" },
  { name: "Campo Grande", iata: "CGR" },
  { name: "João Pessoa", iata: "JPA" },
  { name: "Aracaju", iata: "AJU" },
];

// International destinations
const internationalCities = [
  { name: "Lisboa", iata: "LIS" },
  { name: "Paris", iata: "CDG" },
  { name: "Miami", iata: "MIA" },
  { name: "Roma", iata: "FCO" },
  { name: "Nova York", iata: "NYC" },
  { name: "Buenos Aires", iata: "BUE" },
  { name: "Cancún", iata: "CUN" },
  { name: "Orlando", iata: "MCO" },
  { name: "Londres", iata: "LON" },
  { name: "Madri", iata: "MAD" },
  { name: "Barcelona", iata: "BCN" },
  { name: "Amsterdam", iata: "AMS" },
  { name: "Dubai", iata: "DXB" },
  { name: "Santiago", iata: "SCL" },
  { name: "Montevidéu", iata: "MVD" },
  { name: "Porto", iata: "OPO" },
  { name: "Cidade do México", iata: "MEX" },
  { name: "Lima", iata: "LIM" },
  { name: "Bogotá", iata: "BOG" },
  { name: "Los Angeles", iata: "LAX" },
];

const allCities = [...brazilianCities, ...internationalCities];

const popularFlights = [
  { from: "São Paulo", to: "Lisboa", price: "R$ 2.890", discount: "-35%", image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400" },
  { from: "Rio de Janeiro", to: "Paris", price: "R$ 3.450", discount: "-28%", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400" },
  { from: "São Paulo", to: "Miami", price: "R$ 2.190", discount: "-42%", image: "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=400" },
  { from: "Brasília", to: "Roma", price: "R$ 3.290", discount: "-30%", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400" },
];

interface CityAutocompleteProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
}

const CityAutocomplete = ({ placeholder, value, onChange, icon }: CityAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState<typeof allCities>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length > 0) {
      const normalizedInput = inputValue.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      const filtered = allCities.filter(city => {
        const normalizedCity = city.name.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return normalizedCity.includes(normalizedInput) || 
               city.iata.toLowerCase().includes(normalizedInput);
      });
      
      setFilteredCities(filtered.slice(0, 8));
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredCities([]);
      setIsOpen(false);
    }
  };

  const handleSelectCity = (city: typeof allCities[0]) => {
    onChange(city.name);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {icon}
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={() => value.length > 0 && filteredCities.length > 0 && setIsOpen(true)}
        className={cn(
          "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "pl-10"
        )}
      />
      
      {isOpen && filteredCities.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
        >
          {filteredCities.map((city, index) => (
            <button
              key={`${city.iata}-${index}`}
              type="button"
              onClick={() => handleSelectCity(city)}
              className="w-full px-4 py-3 text-left hover:bg-accent flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{city.name}</span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">{city.iata}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const FlightSearchHero = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  const getSearchContext = () => ({
    city: destination || "europe",
    departureCity: origin || undefined,
    checkIn: date || undefined,
  });

  const handleAviasalesSearch = () => {
    trackAffiliateClick({
      partnerId: "aviasales",
      partnerName: "Aviasales",
      category: "flights",
      component: "FlightSearchHero",
      destination: destination || "europe",
      origin: origin || undefined,
    });
    window.open(getAviasalesLink(getSearchContext()), "_blank", "noopener,noreferrer");
  };

  const handleSkyscannerSearch = () => {
    trackAffiliateClick({
      partnerId: "skyscanner",
      partnerName: "Skyscanner",
      category: "flights",
      component: "FlightSearchHero",
      destination: destination || "europe",
      origin: origin || undefined,
    });
    window.open(getSkyscannerLink(getSearchContext()), "_blank", "noopener,noreferrer");
  };

  const handleFlightClick = (to: string, provider: "aviasales" | "skyscanner") => {
    trackAffiliateClick({
      partnerId: provider,
      partnerName: provider === "aviasales" ? "Aviasales" : "Skyscanner",
      category: "flights",
      component: "FlightSearchHero-PopularFlights",
      destination: to,
    });
    const context = { city: to };
    const link = provider === "aviasales" ? getAviasalesLink(context) : getSkyscannerLink(context);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="container relative z-10 px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6"
          >
            <TrendingDown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Preços até 50% mais baratos</span>
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            Encontre{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Passagens Baratas
            </span>
            <br />
            para Qualquer Lugar
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Compare preços de centenas de companhias aéreas e encontre as melhores ofertas. 
            Ganhe até <span className="text-primary font-semibold">10% de cashback</span> em suas reservas!
          </motion.p>

          {/* Search box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 md:p-6 shadow-xl mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <CityAutocomplete
                placeholder="De onde?"
                value={origin}
                onChange={setOrigin}
                icon={<MapPin className="w-5 h-5" />}
              />
              <CityAutocomplete
                placeholder="Para onde?"
                value={destination}
                onChange={setDestination}
                icon={<Plane className="w-5 h-5" />}
              />
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={cn(
                    "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                    "placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "pl-10",
                    !date && "text-muted-foreground"
                  )}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleAviasalesSearch}
                  size="lg" 
                  className="h-12 gap-2 text-base flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  <Plane className="w-5 h-5" />
                  Aviasales
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={handleSkyscannerSearch}
                  size="lg" 
                  className="h-12 gap-2 text-base flex-1 bg-cyan-500 hover:bg-cyan-600"
                >
                  <Plane className="w-5 h-5" />
                  Skyscanner
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Partner badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Compare preços em Aviasales e Skyscanner</span>
            </div>
          </motion.div>

          {/* Popular flights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
              🔥 Ofertas Populares
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularFlights.map((flight, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="relative group bg-card border border-border rounded-xl overflow-hidden text-left transition-shadow hover:shadow-lg"
                >
                  <div className="aspect-[4/3] relative">
                    <img
                      src={flight.image}
                      alt={flight.to}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
                      {flight.discount}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="text-xs opacity-80">{flight.from} → {flight.to}</p>
                    <p className="text-lg font-bold mb-2">{flight.price}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleFlightClick(flight.to, "aviasales")}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs py-1 px-2 rounded transition-colors"
                      >
                        Aviasales
                      </button>
                      <button
                        onClick={() => handleFlightClick(flight.to, "skyscanner")}
                        className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white text-xs py-1 px-2 rounded transition-colors"
                      >
                        Skyscanner
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};