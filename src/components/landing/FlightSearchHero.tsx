import { motion } from "framer-motion";
import { Plane, MapPin, Calendar, Search, Sparkles, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { getWayAwayLink } from "@/lib/affiliateLinks";

const popularFlights = [
  { from: "São Paulo", to: "Lisboa", price: "R$ 2.890", discount: "-35%", image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400" },
  { from: "Rio de Janeiro", to: "Paris", price: "R$ 3.450", discount: "-28%", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400" },
  { from: "São Paulo", to: "Miami", price: "R$ 2.190", discount: "-42%", image: "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=400" },
  { from: "Brasília", to: "Roma", price: "R$ 3.290", discount: "-30%", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400" },
];

export const FlightSearchHero = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const handleSearch = () => {
    const link = getWayAwayLink({ 
      city: destination || "europe",
      activityName: "flight search"
    });
    window.open(link, "_blank");
  };

  const handleFlightClick = (to: string) => {
    const link = getWayAwayLink({ 
      city: to,
      activityName: "flight deal"
    });
    window.open(link, "_blank");
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
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="De onde?"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="pl-10 h-12 bg-background"
                />
              </div>
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Para onde?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-10 h-12 bg-background"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Quando?"
                  className="pl-10 h-12 bg-background"
                  onFocus={(e) => e.target.type = 'date'}
                  onBlur={(e) => { if (!e.target.value) e.target.type = 'text' }}
                />
              </div>
              <Button 
                onClick={handleSearch}
                size="lg" 
                className="h-12 gap-2 text-base"
              >
                <Search className="w-5 h-5" />
                Buscar Voos
              </Button>
            </div>

            {/* Cashback badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Ganhe cashback em todas as reservas com WayAway Plus</span>
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
                <motion.button
                  key={index}
                  onClick={() => handleFlightClick(flight.to)}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
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
                    <p className="text-lg font-bold">{flight.price}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
