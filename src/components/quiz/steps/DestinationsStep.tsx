import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizAnswers } from "@/types/quiz";

const destinations = [
  // América do Sul
  {
    id: "brazil",
    name: "Brasil",
    cities: "Rio, São Paulo, Salvador",
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&auto=format&fit=crop&q=80",
    flag: "🇧🇷",
    region: "americas",
  },
  {
    id: "argentina",
    name: "Argentina",
    cities: "Buenos Aires, Mendoza, Patagônia",
    image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=400&auto=format&fit=crop&q=80",
    flag: "🇦🇷",
    region: "americas",
  },
  {
    id: "peru",
    name: "Peru",
    cities: "Lima, Cusco, Machu Picchu",
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&auto=format&fit=crop&q=80",
    flag: "🇵🇪",
    region: "americas",
  },
  // América do Norte
  {
    id: "usa",
    name: "Estados Unidos",
    cities: "Nova York, Miami, Los Angeles",
    image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=400&auto=format&fit=crop&q=80",
    flag: "🇺🇸",
    region: "americas",
  },
  {
    id: "mexico",
    name: "México",
    cities: "Cancún, Cidade do México, Tulum",
    image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400&auto=format&fit=crop&q=80",
    flag: "🇲🇽",
    region: "americas",
  },
  {
    id: "canada",
    name: "Canadá",
    cities: "Toronto, Vancouver, Montreal",
    image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=400&auto=format&fit=crop&q=80",
    flag: "🇨🇦",
    region: "americas",
  },
  // Europa
  {
    id: "italy",
    name: "Itália",
    cities: "Roma, Florença, Veneza",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&auto=format&fit=crop&q=80",
    flag: "🇮🇹",
    region: "europe",
  },
  {
    id: "france",
    name: "França",
    cities: "Paris, Nice, Lyon",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&auto=format&fit=crop&q=80",
    flag: "🇫🇷",
    region: "europe",
  },
  {
    id: "spain",
    name: "Espanha",
    cities: "Barcelona, Madrid, Sevilha",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&auto=format&fit=crop&q=80",
    flag: "🇪🇸",
    region: "europe",
  },
  {
    id: "portugal",
    name: "Portugal",
    cities: "Lisboa, Porto, Algarve",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&auto=format&fit=crop&q=80",
    flag: "🇵🇹",
    region: "europe",
  },
  {
    id: "greece",
    name: "Grécia",
    cities: "Atenas, Santorini, Mykonos",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&auto=format&fit=crop&q=80",
    flag: "🇬🇷",
    region: "europe",
  },
  {
    id: "germany",
    name: "Alemanha",
    cities: "Berlim, Munique, Frankfurt",
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&auto=format&fit=crop&q=80",
    flag: "🇩🇪",
    region: "europe",
  },
  // Ásia
  {
    id: "japan",
    name: "Japão",
    cities: "Tóquio, Kyoto, Osaka",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&auto=format&fit=crop&q=80",
    flag: "🇯🇵",
    region: "asia",
  },
  {
    id: "thailand",
    name: "Tailândia",
    cities: "Bangkok, Phuket, Chiang Mai",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&auto=format&fit=crop&q=80",
    flag: "🇹🇭",
    region: "asia",
  },
  {
    id: "indonesia",
    name: "Indonésia",
    cities: "Bali, Jakarta, Lombok",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop&q=80",
    flag: "🇮🇩",
    region: "asia",
  },
  // Oceania
  {
    id: "australia",
    name: "Austrália",
    cities: "Sydney, Melbourne, Gold Coast",
    image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=400&auto=format&fit=crop&q=80",
    flag: "🇦🇺",
    region: "oceania",
  },
  // Oriente Médio & África
  {
    id: "uae",
    name: "Emirados Árabes",
    cities: "Dubai, Abu Dhabi",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&auto=format&fit=crop&q=80",
    flag: "🇦🇪",
    region: "middleeast",
  },
  {
    id: "egypt",
    name: "Egito",
    cities: "Cairo, Luxor, Hurghada",
    image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400&auto=format&fit=crop&q=80",
    flag: "🇪🇬",
    region: "africa",
  },
  {
    id: "morocco",
    name: "Marrocos",
    cities: "Marrakech, Fez, Casablanca",
    image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=400&auto=format&fit=crop&q=80",
    flag: "🇲🇦",
    region: "africa",
  },
  {
    id: "southafrica",
    name: "África do Sul",
    cities: "Cape Town, Joanesburgo, Kruger",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&auto=format&fit=crop&q=80",
    flag: "🇿🇦",
    region: "africa",
  },
  // Opção surpresa
  {
    id: "surprise",
    name: "Me Surpreenda!",
    cities: "Deixe a IA decidir",
    image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&auto=format&fit=crop&q=80",
    flag: "✨",
    region: "special",
  },
];

interface DestinationsStepProps {
  answers: QuizAnswers;
  onUpdate: (key: keyof QuizAnswers, value: any) => void;
}

export function DestinationsStep({ answers, onUpdate }: DestinationsStepProps) {
  const toggleDestination = (id: string) => {
    const current = answers.destinations;
    if (current.includes(id)) {
      onUpdate("destinations", current.filter((d) => d !== id));
    } else {
      onUpdate("destinations", [...current, id]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold mb-3">
          Quais <span className="text-primary">destinos</span> te interessam?
        </h2>
        <p className="text-muted-foreground">
          Selecione um ou mais países que você gostaria de visitar.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {destinations.map((destination) => {
          const isSelected = answers.destinations.includes(destination.id);
          
          return (
            <motion.button
              key={destination.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleDestination(destination.id)}
              className={cn(
                "relative overflow-hidden rounded-xl aspect-[4/3] group",
                isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
            >
              <img
                src={destination.image}
                alt={destination.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full gradient-primary flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{destination.flag}</span>
                  <h3 className="font-bold text-white">{destination.name}</h3>
                </div>
                <p className="text-xs text-white/70">{destination.cities}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
