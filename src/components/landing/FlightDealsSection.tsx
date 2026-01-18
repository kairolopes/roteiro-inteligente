import { motion } from "framer-motion";
import { Plane, Clock, TrendingDown, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getWayAwayLink, getAviasalesLink } from "@/lib/affiliateLinks";

const weeklyDeals = [
  {
    id: 1,
    route: "São Paulo → Londres",
    airline: "LATAM / British Airways",
    price: "R$ 3.290",
    originalPrice: "R$ 5.200",
    discount: 37,
    dates: "Mar - Abr 2025",
    stops: "1 parada",
    tag: "Mais Barato",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600",
  },
  {
    id: 2,
    route: "Rio de Janeiro → Madri",
    airline: "Iberia",
    price: "R$ 2.890",
    originalPrice: "R$ 4.100",
    discount: 30,
    dates: "Fev - Mar 2025",
    stops: "Direto",
    tag: "Cashback 10%",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600",
  },
  {
    id: 3,
    route: "São Paulo → Nova York",
    airline: "American Airlines",
    price: "R$ 2.490",
    originalPrice: "R$ 3.800",
    discount: 34,
    dates: "Jan - Fev 2025",
    stops: "Direto",
    tag: "Promoção",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600",
  },
  {
    id: 4,
    route: "Brasília → Amsterdam",
    airline: "KLM",
    price: "R$ 3.590",
    originalPrice: "R$ 5.500",
    discount: 35,
    dates: "Abr - Mai 2025",
    stops: "1 parada",
    tag: "Últimas Vagas",
    image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600",
  },
  {
    id: 5,
    route: "São Paulo → Dubai",
    airline: "Emirates",
    price: "R$ 4.290",
    originalPrice: "R$ 6.900",
    discount: 38,
    dates: "Mar - Abr 2025",
    stops: "Direto",
    tag: "Luxo Acessível",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600",
  },
  {
    id: 6,
    route: "Rio de Janeiro → Cancún",
    airline: "Aeromexico",
    price: "R$ 1.990",
    originalPrice: "R$ 3.200",
    discount: 38,
    dates: "Fev - Mar 2025",
    stops: "1 parada",
    tag: "Praia",
    image: "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=600",
  },
];

const getTagColor = (tag: string) => {
  switch (tag) {
    case "Mais Barato":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "Cashback 10%":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "Promoção":
      return "bg-primary/10 text-primary border-primary/20";
    case "Últimas Vagas":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "Luxo Acessível":
      return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    case "Praia":
      return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const FlightDealsSection = () => {
  const handleDealClick = (route: string) => {
    const destination = route.split("→")[1]?.trim() || "europe";
    const link = getWayAwayLink({ city: destination, activityName: "deal" });
    window.open(link, "_blank");
  };

  const handleViewAll = () => {
    const link = getAviasalesLink({ city: "europe", activityName: "all deals" });
    window.open(link, "_blank");
  };

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
            <Clock className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Ofertas por tempo limitado</span>
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
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Passagens com até 50% de desconto. Preços atualizados diariamente.
          </motion.p>
        </div>

        {/* Deals grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {weeklyDeals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => handleDealClick(deal.route)}
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
                <p className="text-sm text-muted-foreground mb-2">{deal.airline}</p>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-primary">{deal.price}</span>
                  <span className="text-sm text-muted-foreground line-through">{deal.originalPrice}</span>
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
          
          <p className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Ganhe cashback em todas as reservas com WayAway Plus
          </p>
        </motion.div>
      </div>
    </section>
  );
};
