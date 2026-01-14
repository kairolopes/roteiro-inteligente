import { motion } from "framer-motion";
import { Crown, Building2, Home, Tent, Wallet } from "lucide-react";
import { QuizOption } from "../QuizOption";
import { QuizAnswers } from "@/types/quiz";

const accommodations = [
  {
    id: "luxury",
    icon: Crown,
    title: "Luxo",
    description: "Hotéis 5 estrelas, resorts e experiências premium",
  },
  {
    id: "boutique",
    icon: Building2,
    title: "Boutique",
    description: "Hotéis charmosos com personalidade única",
  },
  {
    id: "midrange",
    icon: Home,
    title: "Confortável",
    description: "Boa relação custo-benefício, 3-4 estrelas",
  },
  {
    id: "budget",
    icon: Wallet,
    title: "Econômico",
    description: "Hostels, pousadas e opções acessíveis",
  },
  {
    id: "airbnb",
    icon: Tent,
    title: "Apartamentos",
    description: "Airbnb e aluguéis para sentir-se em casa",
  },
];

interface AccommodationStepProps {
  answers: QuizAnswers;
  onUpdate: (key: keyof QuizAnswers, value: any) => void;
}

export function AccommodationStep({ answers, onUpdate }: AccommodationStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold mb-3">
          Onde você prefere <span className="text-primary">se hospedar</span>?
        </h2>
        <p className="text-muted-foreground">
          Isso nos ajuda a encontrar as melhores opções para seu estilo.
        </p>
      </div>

      <div className="grid gap-4 max-w-xl mx-auto">
        {accommodations.map((acc) => (
          <QuizOption
            key={acc.id}
            icon={acc.icon}
            title={acc.title}
            description={acc.description}
            selected={answers.accommodation === acc.id}
            onClick={() => onUpdate("accommodation", acc.id)}
          />
        ))}
      </div>
    </motion.div>
  );
}
