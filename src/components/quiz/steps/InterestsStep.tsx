import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { QuizAnswers } from "@/types/quiz";

const interests = [
  { id: "art", emoji: "🎨", label: "Arte & Museus" },
  { id: "history", emoji: "🏛️", label: "História" },
  { id: "architecture", emoji: "🏰", label: "Arquitetura" },
  { id: "food", emoji: "🍝", label: "Gastronomia" },
  { id: "wine", emoji: "🍷", label: "Vinhos" },
  { id: "coffee", emoji: "☕", label: "Cafés" },
  { id: "beaches", emoji: "🏖️", label: "Praias" },
  { id: "mountains", emoji: "⛰️", label: "Montanhas" },
  { id: "nature", emoji: "🌲", label: "Natureza" },
  { id: "shopping", emoji: "🛍️", label: "Compras" },
  { id: "nightlife", emoji: "🎉", label: "Vida Noturna" },
  { id: "music", emoji: "🎵", label: "Música & Shows" },
  { id: "sports", emoji: "⚽", label: "Esportes" },
  { id: "photography", emoji: "📸", label: "Fotografia" },
  { id: "wellness", emoji: "🧘", label: "Bem-estar & Spa" },
  { id: "local", emoji: "🏘️", label: "Vida Local" },
];

interface InterestsStepProps {
  answers: QuizAnswers;
  onUpdate: (key: keyof QuizAnswers, value: any) => void;
}

export function InterestsStep({ answers, onUpdate }: InterestsStepProps) {
  const toggleInterest = (id: string) => {
    const current = answers.interests;
    if (current.includes(id)) {
      onUpdate("interests", current.filter((i) => i !== id));
    } else {
      onUpdate("interests", [...current, id]);
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
          O que você mais gosta de <span className="text-primary">fazer</span>?
        </h2>
        <p className="text-muted-foreground">
          Selecione seus principais interesses para personalizarmos seu roteiro.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {interests.map((interest) => {
          const isSelected = answers.interests.includes(interest.id);
          
          return (
            <motion.button
              key={interest.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleInterest(interest.id)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all",
                isSelected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-lg">{interest.emoji}</span>
              <span className="text-sm font-medium">{interest.label}</span>
            </motion.button>
          );
        })}
      </div>

      {answers.interests.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-primary"
        >
          {answers.interests.length} interesse{answers.interests.length !== 1 ? "s" : ""} selecionado{answers.interests.length !== 1 ? "s" : ""}
        </motion.p>
      )}
    </motion.div>
  );
}
