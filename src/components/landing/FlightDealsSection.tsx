import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plane, Clock, TrendingDown, ExternalLink, RefreshCw, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAviasalesLink } from "@/lib/affiliateLinks";
import { useFlightPrices, destinationImages, formatFlightDate } from "@/hooks/useFlightPrices";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Origin cities available
const originCities = [
  { value: "São Paulo", label: "São Paulo", code: "SAO" },
  { value: "Rio de Janeiro", label: "Rio de Janeiro", code: "RIO" },
  { value: "Brasília", label: "Brasília", code: "BSB" },
  { value: "Fortaleza", label: "Fortaleza", code: "FOR" },
  { value: "Salvador", label: "Salvador", code: "SSA" },
];

// Fallback static deals for when API fails
const fallbackDeals = [
  { id: 1, route: "São Paulo → Londres", airline: "British Airways", price: 3290, originalPrice: 5200, discount: 37, dates: "Mar - Abr 2025", stops: "1 parada", tag: "Promoção", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600", destination: "LON", link: "" },
  { id: 2, route: "São Paulo → Madri", airline: "Iberia", price: 2890, originalPrice: 4100, discount: 30, dates: "Fev - Mar 2025", stops: "Direto", tag: "Cashback 10%", image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600", destination: "MAD", link: "" },
  { id: 3, route: "São Paulo → Nova York", airline: "American Airlines", price: 2490, originalPrice: 3800, discount: 34, dates: "Jan - Fev 2025", stops: "Direto", tag: "Promoção", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600", destination: "NYC", link: "" },
  { id: 4, route: "São Paulo → Amsterdam", airline: "KLM", price: 3590, originalPrice: 5500, discount: 35, dates: "Abr - Mai 2025", stops: "1 parada", tag: "Últimas Vagas", image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600", destination: "AMS", link: "" },
  { id: 5, route: "São Paulo → Lisboa", airline: "TAP Portugal", price: 2890, originalPrice: 4500, discount: 36, dates: "Mar - Abr 2025", stops: "Direto", tag: "Mais Barato", image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=600", destination: "LIS", link: "" },
  { id: 6, route: "São Paulo → Cancún", airline: "Aeromexico", price: 1990, originalPrice: 3200, discount: 38, dates: "Fev - Mar 2025", stops: "1 parada", tag: "Praia", image: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=600", destination: "CUN", link: "" },
];

const getTagForPrice = (price: number, transfers: number): string => {
  if (price < 2000) return "Mais Barato";
  if (transfers === 0) return "Direto";
  if (price > 4000) return "Luxo";
  return "Promoção";
};

const getTagColor = (tag: string) => {
  const colors: Record<string, string> = {
    "Mais Barato": "bg-green-500/10 text-green-600 border-green-500/20",
    "Cashback 10%": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Promoção": "bg-primary/10 text-primary border-primary/20",
    "Últimas Vagas": "bg-destructive/10 text-destructive border-destructive/20",
    "Luxo": "bg-purple-500/10 text-purple-600 border-purple-500/20",
    "Praia": "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    "Direto": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };
  return colors[tag] || "bg-muted text-muted-foreground";
};

export const FlightDealsSection = () => {
  const [selectedOrigin, setSelectedOrigin] = useState("São Paulo");
  const { prices, isLoading, error, refetch } = useFlightPrices({ origin: selectedOrigin });
  const navigate = useNavigate();

  const handleDealClick = (deal: { 
    route: string; 
    destination: string; 
    departureAt?: string; 
    price: number;
  }) => {
    const originCode = originCities.find(c => c.value === selectedOrigin)?.code || 'SAO';
    const destinationCity = deal.route.split(' → ')[1] || deal.destination;
    
    // Formata a data para YYMMDD
    const dateParam = deal.departureAt?.split('T')[0]?.replace(/-/g, '') || 
      new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0].replace(/-/g, '');
    
    // Navega para página de detalhes da Sofia
    navigate(`/passagens/${originCode}/${deal.destination}/${dateParam}`, {
      state: {
        origin: selectedOrigin,
        originIata: originCode,
        destination: destinationCity,
        destinationIata: deal.destination,
        price: deal.price,
        departureAt: deal.departureAt,
      }
    });
  };

  const handleViewAll = () => {
    const link = getAviasalesLink({ city: "europe", activityName: "all deals" });
    window.open(link, "_blank");
  };

  const handleOriginChange = (value: string) => {
    setSelectedOrigin(value);
  };

  // Get selected origin IATA code
  const selectedOriginCode = originCities.find(c => c.value === selectedOrigin)?.code || 'SAO';

  // Transform API prices to display format or use fallback
  const deals = prices.length > 0 
    ? prices.slice(0, 6).map((price, index) => ({
        id: index + 1,
        route: `${selectedOrigin} → ${price.destinationName}`,
        airline: price.airline,
        price: price.price,
        originalPrice: Math.round(price.price * 1.4), // Estimate original price
        discount: 29 + Math.floor(Math.random() * 15), // Random discount 29-43%
        dates: formatFlightDate(price.departureAt),
        stops: price.transfers === 0 ? "Direto" : `${price.transfers} parada${price.transfers > 1 ? 's' : ''}`,
        tag: getTagForPrice(price.price, price.transfers),
        image: destinationImages[price.destination] || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600",
        destination: price.destination,
        departureAt: price.departureAt, // Incluir data de partida
        link: price.link,
      }))
    : fallbackDeals.map(deal => ({
        ...deal,
        route: `${selectedOrigin} → ${deal.route.split(' → ')[1]}`,
      }));

  const isLive = prices.length > 0;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-full px-4 py-2 mb-4"
          >
            {isLive ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-green-600">Preços em tempo real</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Ofertas por tempo limitado</span>
              </>
            )}
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            🔥 Ofertas da Semana
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto mb-6"
          >
            {isLive 
              ? "Preços atualizados em tempo real direto das companhias aéreas."
              : "Passagens com até 50% de desconto. Preços atualizados diariamente."
            }
          </motion.p>

          {/* Origin City Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 mb-2"
          >
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Saindo de:
            </span>
            <Select value={selectedOrigin} onValueChange={handleOriginChange}>
              <SelectTrigger className="w-48 bg-card border-border">
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {originCities.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    <span className="flex items-center gap-2">
                      <span>{city.label}</span>
                      <span className="text-xs text-muted-foreground">({city.code})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center justify-center gap-2"
            >
              <span className="text-sm text-muted-foreground">Não foi possível carregar preços ao vivo</span>
              <Button variant="ghost" size="sm" onClick={refetch} className="gap-1">
                <RefreshCw className="w-3 h-3" />
                Tentar novamente
              </Button>
            </motion.div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Deals grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {deals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                onClick={() => handleDealClick(deal)}
                className="group cursor-pointer bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.route}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Tag */}
                  <Badge className={`absolute top-3 left-3 ${getTagColor(deal.tag)}`}>
                    {deal.tag}
                  </Badge>
                  
                  {/* Discount */}
                  <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-sm font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    {deal.discount}%
                  </div>

                  {/* Route overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-2 text-lg font-bold">
                      <Plane className="w-4 h-4" />
                      {deal.route}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">{deal.airline}</p>
                    {isLive && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Ao vivo
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-primary">
                      R$ {deal.price.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      R$ {deal.originalPrice.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{deal.dates}</span>
                    <span className="flex items-center gap-1">
                      {deal.stops}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button 
            onClick={handleViewAll}
            size="lg" 
            variant="outline" 
            className="gap-2"
          >
            Ver Todas as Ofertas
            <ExternalLink className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

    </section>
  );
};
