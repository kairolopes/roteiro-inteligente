import { motion } from "framer-motion";
import { QuizOption } from "../QuizOption";
import { QuizAnswers } from "@/types/quiz";

const budgets = [
  {
    id: "economic",
    emoji: "💰",
    title: "Econômico",
    description: "Até R$ 400/dia: Hostel, transporte público, refeições simples",
  },
  {
    id: "moderate",
    emoji: "💰💰",
    title: "Moderado",
    description: "R$ 400 - R$ 750/dia: Hotel 3★, transporte misto, restaurantes locais",
  },
  {
    id: "comfortable",
    emoji: "💰💰💰",
    title: "Confortável",
    description: "R$ 750 - R$ 1.500/dia: Hotel 4★, táxi/aluguel, experiências premium",
  },
  {
    id: "luxury",
    emoji: "💎",
    title: "Luxo",
    description: "Acima de R$ 1.500/dia: Hotel 5★, transfers privados, fine dining",
  },
  {
    id: "flexible",
    emoji: "🤷",
    title: "Flexível",
    description: "Depende das oportunidades e ofertas",
  },
];

const paces = [
  {
    id: "relaxed",
    emoji: "🐢",
    title: "Relaxado",
    description: "Poucos lugares, mais tempo em cada um",
  },
  {
    id: "moderate",
    emoji: "🚶",
    title: "Moderado",
    description: "Equilíbrio entre passeios e descanso",
  },
  {
    id: "intensive",
    emoji: "🏃",
    title: "Intenso",
    description: "Ver o máximo possível, dias cheios",
  },
];

interface BudgetStepProps {
  answers: QuizAnswers;
  onUpdate: (key: keyof QuizAnswers, value: any) => void;
}

export function BudgetStep({ answers, onUpdate }: BudgetStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10"
    >
      {/* Budget */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3">
            Qual seu <span className="text-primary">orçamento</span>?
          </h2>
          <p className="text-muted-foreground">
            Inclui hospedagem, alimentação, transporte local e passeios. Não inclui passagem aérea.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {budgets.map((budget) => (
            <QuizOption
              key={budget.id}
              emoji={budget.emoji}
              title={budget.title}
              description={budget.description}
              selected={answers.budget === budget.id}
              onClick={() => onUpdate("budget", budget.id)}
              variant="compact"
            />
          ))}
        </div>
      </div>

      {/* Pace */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-xl lg:text-2xl font-bold mb-2">
            Qual o <span className="text-primary">ritmo</span> ideal?
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {paces.map((pace) => (
            <QuizOption
              key={pace.id}
              emoji={pace.emoji}
              title={pace.title}
              description={pace.description}
              selected={answers.pace === pace.id}
              onClick={() => onUpdate("pace", pace.id)}
              variant="compact"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
