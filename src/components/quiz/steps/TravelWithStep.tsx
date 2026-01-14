import { motion } from "framer-motion";
import { User, Users, Heart, Baby, Dog } from "lucide-react";
import { QuizOption } from "../QuizOption";
import { QuizAnswers } from "@/types/quiz";

const companions = [
  {
    id: "solo",
    icon: User,
    title: "Sozinho(a)",
    description: "Viagem solo para autoconhecimento",
  },
  {
    id: "couple",
    icon: Heart,
    title: "Casal",
    description: "Viagem romântica a dois",
  },
  {
    id: "friends",
    icon: Users,
    title: "Amigos",
    description: "Grupo de amigos",
  },
  {
    id: "family-kids",
    icon: Baby,
    title: "Família com crianças",
    description: "Pais e filhos pequenos",
  },
  {
    id: "family-adults",
    icon: Users,
    title: "Família adultos",
    description: "Pais e filhos adultos",
  },
  {
    id: "pets",
    icon: Dog,
    title: "Com pet",
    description: "Viajando com animal de estimação",
  },
];

const dietary = [
  { id: "none", emoji: "✅", label: "Nenhuma" },
  { id: "vegetarian", emoji: "🥬", label: "Vegetariano" },
  { id: "vegan", emoji: "🌱", label: "Vegano" },
  { id: "gluten-free", emoji: "🌾", label: "Sem Glúten" },
  { id: "lactose-free", emoji: "🥛", label: "Sem Lactose" },
  { id: "kosher", emoji: "✡️", label: "Kosher" },
  { id: "halal", emoji: "☪️", label: "Halal" },
];

const mobility = [
  { id: "none", emoji: "🚶", label: "Sem restrições" },
  { id: "limited", emoji: "🦯", label: "Mobilidade reduzida" },
  { id: "wheelchair", emoji: "♿", label: "Cadeira de rodas" },
];

interface TravelWithStepProps {
  answers: QuizAnswers;
  onUpdate: (key: keyof QuizAnswers, value: any) => void;
}

export function TravelWithStep({ answers, onUpdate }: TravelWithStepProps) {
  const toggleDietary = (id: string) => {
    if (id === "none") {
      onUpdate("dietary", ["none"]);
      return;
    }
    
    let current = answers.dietary.filter((d) => d !== "none");
    if (current.includes(id)) {
      current = current.filter((d) => d !== id);
    } else {
      current = [...current, id];
    }
    onUpdate("dietary", current.length > 0 ? current : []);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10"
    >
      {/* Travel companion */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3">
            Com quem você vai <span className="text-primary">viajar</span>?
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {companions.map((companion) => (
            <QuizOption
              key={companion.id}
              icon={companion.icon}
              title={companion.title}
              description={companion.description}
              selected={answers.travelWith === companion.id}
              onClick={() => onUpdate("travelWith", companion.id)}
              variant="compact"
            />
          ))}
        </div>
      </div>

      {/* Dietary restrictions */}
      <div>
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Restrições alimentares?</h3>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {dietary.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleDietary(item.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition-all ${
                answers.dietary.includes(item.id)
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mobility */}
      <div>
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Mobilidade</h3>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {mobility.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onUpdate("mobility", item.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm transition-all ${
                answers.mobility === item.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
