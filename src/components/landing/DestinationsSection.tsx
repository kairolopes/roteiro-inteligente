import { motion } from "framer-motion";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const destinations = [
  {
    id: 1,
    name: "Japão",
    cities: "Tóquio, Kyoto, Osaka, Nara",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    trips: "18k+ roteiros",
    highlight: "Tradição & Tecnologia",
  },
  {
    id: 2,
    name: "Estados Unidos",
    cities: "Nova York, Miami, Los Angeles, Las Vegas",
    image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&auto=format&fit=crop&q=80",
    rating: 4.8,
    trips: "25k+ roteiros",
    highlight: "Diversidade & Aventura",
  },
  {
    id: 3,
    name: "Brasil",
    cities: "Rio, São Paulo, Salvador, Floripa",
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&auto=format&fit=crop&q=80",
    rating: 4.8,
    trips: "20k+ roteiros",
    highlight: "Praias & Natureza",
  },
  {
    id: 4,
    name: "Tailândia",
    cities: "Bangkok, Phuket, Chiang Mai, Krabi",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    trips: "14k+ roteiros",
    highlight: "Templos & Praias",
  },
  {
    id: 5,
    name: "Itália",
    cities: "Roma, Florença, Veneza, Milão",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    trips: "15k+ roteiros",
    highlight: "Arte & Gastronomia",
  },
  {
    id: 6,
    name: "Emirados Árabes",
    cities: "Dubai, Abu Dhabi",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80",
    rating: 4.8,
    trips: "10k+ roteiros",
    highlight: "Luxo & Modernidade",
  },
];

export function DestinationsSection() {
  return (
    <section id="destinos" className="py-12 lg:py-32 relative">
      {/* Background accent */}
      <div className="absolute inset-0 gradient-dark opacity-50" />

      <div className="container relative mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 lg:gap-6 mb-8 lg:mb-12"
        >
          <div>
            <span className="inline-block px-3 py-1 lg:px-4 lg:py-1.5 rounded-full bg-primary/10 text-primary text-xs lg:text-sm font-medium mb-3 lg:mb-4">
              Destinos Populares
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-2 lg:mb-4">
              Explore o <span className="text-primary">Mundo</span>
            </h2>
            <p className="text-muted-foreground text-sm lg:text-lg max-w-xl">
              Descubra destinos incríveis em todos os continentes e deixe nossa IA criar o 
              roteiro perfeito para você.
            </p>
          </div>
          <Button variant="outline" className="w-fit text-sm">
            Ver Todos
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer touch-active"
            >
              <div className="relative glass-card rounded-xl lg:rounded-2xl overflow-hidden h-full">
                {/* Image */}
                <div className="relative h-36 lg:h-48 overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  
                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 lg:top-4 lg:right-4 flex items-center gap-1 px-2 py-1 rounded-full glass text-xs lg:text-sm">
                    <Star className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-gold fill-gold" />
                    <span className="font-medium">{destination.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 lg:p-6">
                  <div className="flex items-center gap-2 mb-1.5 lg:mb-2">
                    <h3 className="text-lg lg:text-xl font-bold">{destination.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium hidden sm:inline">
                      {destination.highlight}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs lg:text-sm mb-3 lg:mb-4 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
                    <span className="truncate">{destination.cities}</span>
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs lg:text-sm text-muted-foreground">
                      {destination.trips}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary group-hover:translate-x-1 transition-transform text-xs lg:text-sm h-8"
                    >
                      Explorar
                      <ArrowRight className="ml-1 w-3.5 h-3.5 lg:w-4 lg:h-4" />
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
