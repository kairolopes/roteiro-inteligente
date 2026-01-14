import { motion } from "framer-motion";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const destinations = [
  {
    id: 1,
    name: "Itália",
    cities: "Roma, Florença, Veneza, Milão",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    trips: "15k+ roteiros",
    highlight: "Arte & Gastronomia",
  },
  {
    id: 2,
    name: "França",
    cities: "Paris, Nice, Lyon, Bordeaux",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80",
    rating: 4.8,
    trips: "12k+ roteiros",
    highlight: "Romance & Cultura",
  },
  {
    id: 3,
    name: "Espanha",
    cities: "Barcelona, Madrid, Sevilha, Valencia",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop&q=80",
    rating: 4.8,
    trips: "10k+ roteiros",
    highlight: "Festas & Praias",
  },
  {
    id: 4,
    name: "Portugal",
    cities: "Lisboa, Porto, Algarve, Sintra",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    trips: "8k+ roteiros",
    highlight: "História & Vinhos",
  },
  {
    id: 5,
    name: "Grécia",
    cities: "Atenas, Santorini, Mykonos, Creta",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    trips: "9k+ roteiros",
    highlight: "Ilhas & Mitologia",
  },
  {
    id: 6,
    name: "Holanda",
    cities: "Amsterdam, Rotterdam, Utrecht",
    image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&auto=format&fit=crop&q=80",
    rating: 4.7,
    trips: "5k+ roteiros",
    highlight: "Canais & Museus",
  },
];

export function DestinationsSection() {
  return (
    <section id="destinos" className="py-20 lg:py-32 relative">
      {/* Background accent */}
      <div className="absolute inset-0 gradient-dark opacity-50" />

      <div className="container relative mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Destinos Populares
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Explore a <span className="text-primary">Europa</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Descubra os destinos mais procurados e deixe nossa IA criar o 
              roteiro perfeito para você.
            </p>
          </div>
          <Button variant="outline" className="w-fit">
            Ver Todos os Destinos
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>

        {/* Destinations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative glass-card rounded-2xl overflow-hidden h-full">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  
                  {/* Rating badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full glass text-sm">
                    <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                    <span className="font-medium">{destination.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">{destination.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {destination.highlight}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {destination.cities}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {destination.trips}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary group-hover:translate-x-1 transition-transform"
                    >
                      Explorar
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
