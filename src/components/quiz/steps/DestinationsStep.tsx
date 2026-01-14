import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizAnswers } from "@/types/quiz";

const destinations = [
  {
    id: "italy",
    name: "Itália",
    cities: "Roma, Florença, Veneza",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&auto=format&fit=crop&q=80",
    flag: "🇮🇹",
  },
  {
    id: "france",
    name: "França",
    cities: "Paris, Nice, Lyon",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&auto=format&fit=crop&q=80",
    flag: "🇫🇷",
  },
  {
    id: "spain",
    name: "Espanha",
    cities: "Barcelona, Madrid, Sevilha",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&auto=format&fit=crop&q=80",
    flag: "🇪🇸",
  },
  {
    id: "portugal",
    name: "Portugal",
    cities: "Lisboa, Porto, Algarve",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&auto=format&fit=crop&q=80",
    flag: "🇵🇹",
  },
  {
    id: "greece",
    name: "Grécia",
    cities: "Atenas, Santorini, Mykonos",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&auto=format&fit=crop&q=80",
    flag: "🇬🇷",
  },
  {
    id: "netherlands",
    name: "Holanda",
    cities: "Amsterdam, Rotterdam",
    image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&auto=format&fit=crop&q=80",
    flag: "🇳🇱",
  },
  {
    id: "germany",
    name: "Alemanha",
    cities: "Berlim, Munique, Frankfurt",
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&auto=format&fit=crop&q=80",
    flag: "🇩🇪",
  },
  {
    id: "switzerland",
    name: "Suíça",
    cities: "Zurique, Genebra, Alpes",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=400&auto=format&fit=crop&q=80",
    flag: "🇨🇭",
  },
  {
    id: "surprise",
    name: "Me Surpreenda!",
    cities: "Deixe a IA decidir",
    image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&auto=format&fit=crop&q=80",
    flag: "✨",
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
