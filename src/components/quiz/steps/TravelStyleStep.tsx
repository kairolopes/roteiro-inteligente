import { motion } from "framer-motion";
import { Heart, Mountain, Palette, Utensils, Users, PartyPopper, Camera, Sparkles } from "lucide-react";
import { QuizOption } from "../QuizOption";
import { QuizAnswers } from "@/types/quiz";

const travelStyles = [
  {
    id: "romantic",
    icon: Heart,
    title: "Romântica",
    description: "Lua de mel, aniversário ou escapada a dois",
  },
  {
    id: "adventure",
    icon: Mountain,
    title: "Aventura",
    description: "Trilhas, esportes e experiências radicais",
  },
  {
    id: "cultural",
    icon: Palette,
    title: "Cultural",
    description: "Museus, história, arte e arquitetura",
  },
  {
    id: "gastronomy",
    icon: Utensils,
    title: "Gastronômica",
    description: "Restaurantes, vinícolas e culinária local",
  },
  {
    id: "family",
    icon: Users,
    title: "Família",
    description: "Atividades para todas as idades",
  },
  {
    id: "party",
    icon: PartyPopper,
    title: "Festas & Vida Noturna",
    description: "Baladas, bares e muita diversão",
  },
  {
    id: "photography",
    icon: Camera,
    title: "Fotogênica",
    description: "Lugares instagramáveis e paisagens",
  },
  {
    id: "relaxing",
    icon: Sparkles,
    title: "Relaxante",
    description: "Spas, praias e descanso total",
  },
];

interface TravelStyleStepProps {
  answers: QuizAnswers;
  onUpdate: (key: keyof QuizAnswers, value: any) => void;
}

export function TravelStyleStep({ answers, onUpdate }: TravelStyleStepProps) {
  const selectStyle = (id: string) => {
    onUpdate("travelStyle", id);
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
          Qual é o seu <span className="text-primary">estilo de viagem</span>?
        </h2>
        <p className="text-muted-foreground">
          Escolha o estilo que melhor define sua viagem
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {travelStyles.map((style) => (
          <QuizOption
            key={style.id}
            icon={style.icon}
            title={style.title}
            description={style.description}
            selected={answers.travelStyle === style.id}
            onClick={() => selectStyle(style.id)}
          />
        ))}
      </div>
    </motion.div>
  );
}
