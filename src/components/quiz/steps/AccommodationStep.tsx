import { useMemo } from "react";
import { motion } from "framer-motion";
import { Crown, Building2, Home, Tent, Wallet, AlertTriangle } from "lucide-react";
import { QuizOption } from "../QuizOption";
import { QuizAnswers } from "@/types/quiz";

const accommodations = [
  {
    id: "luxury",
    icon: Crown,
    title: "Luxo",
    description: "Hotéis 5 estrelas, resorts e experiências premium",
    compatibleBudgets: ["luxury", "flexible"],
  },
  {
    id: "boutique",
    icon: Building2,
    title: "Boutique",
    description: "Hotéis charmosos com personalidade única",
    compatibleBudgets: ["comfortable", "luxury", "flexible"],
  },
  {
    id: "midrange",
    icon: Home,
    title: "Confortável",
    description: "Boa relação custo-benefício, 3-4 estrelas",
    compatibleBudgets: ["moderate", "comfortable", "luxury", "flexible"],
  },
  {
    id: "budget",
    icon: Wallet,
    title: "Econômico",
    description: "Hostels, pousadas e opções acessíveis",
    compatibleBudgets: ["economic", "moderate", "flexible"],
  },
  {
    id: "airbnb",
    icon: Tent,
    title: "Apartamentos",
    description: "Airbnb e aluguéis para sentir-se em casa",
    compatibleBudgets: ["economic", "moderate", "comfortable", "luxury", "flexible"],
  },
];

const budgetLabels: Record<string, string> = {
  economic: "Econômico",
  moderate: "Moderado",
  comfortable: "Confortável",
  luxury: "Luxo",
  flexible: "Flexível",
};

interface AccommodationStepProps {
  answers: QuizAnswers;
  onUpdate: (key: keyof QuizAnswers, value: any) => void;
}

export function AccommodationStep({ answers, onUpdate }: AccommodationStepProps) {
  const { compatibleAccommodations, incompatibleAccommodations } = useMemo(() => {
    if (!answers.budget || answers.budget === "flexible") {
      return { compatibleAccommodations: accommodations, incompatibleAccommodations: [] };
    }
    
    const compatible = accommodations.filter(acc => 
      acc.compatibleBudgets.includes(answers.budget)
    );
    const incompatible = accommodations.filter(acc => 
      !acc.compatibleBudgets.includes(answers.budget)
    );
    
    return { compatibleAccommodations: compatible, incompatibleAccommodations: incompatible };
  }, [answers.budget]);

  const budgetName = budgetLabels[answers.budget] || "";

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
        {budgetName && incompatibleAccommodations.length > 0 && (
          <p className="text-sm text-primary mt-2">
            Mostrando opções compatíveis com orçamento "{budgetName}"
          </p>
        )}
      </div>

      <div className="grid gap-4 max-w-xl mx-auto">
        {compatibleAccommodations.map((acc) => (
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

      {/* Opções incompatíveis - mostrar como desabilitadas */}
      {incompatibleAccommodations.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-4">
            <AlertTriangle className="w-4 h-4" />
            <span>Não recomendado para seu orçamento</span>
          </div>
          <div className="grid gap-3 max-w-xl mx-auto opacity-50">
            {incompatibleAccommodations.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/50 cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <acc.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">{acc.title}</p>
                  <p className="text-sm text-muted-foreground/70">{acc.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
