import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { QuizAnswers } from "@/types/quiz";
import { CityAutocomplete } from "@/components/quiz/CityAutocomplete";
import { Textarea } from "@/components/ui/textarea";

interface DestinationsStepProps {
  answers: QuizAnswers;
  onUpdate: (key: keyof QuizAnswers, value: any) => void;
}

export const DestinationsStep = ({ answers, onUpdate }: DestinationsStepProps) => {
  // Usamos answers.destination (string) como fonte de verdade visível
  // e sincronizamos answers.destinations (array) para retrocompatibilidade com a IA.
  const value = answers.destination || (answers.destinations || []).join(", ");

  const handleChange = (next: string) => {
    onUpdate("destination", next);
    const arr = next.split(",").map(s => s.trim()).filter(Boolean);
    onUpdate("destinations", arr);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary mb-2">
          <Plane className="w-7 h-7 text-primary-foreground" />
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold">
          Para onde você quer ir? ✈️
        </h2>
        <p className="text-muted-foreground text-sm lg:text-base max-w-md mx-auto">
          Pode ser uma cidade, um país, uma região ou vários lugares. Digite à vontade.
        </p>
      </div>

      {/* Campo principal — autocomplete inteligente */}
      <div className="bg-card/50 backdrop-blur rounded-2xl p-5 lg:p-6 border border-border">
        <CityAutocomplete
          value={value}
          onChange={handleChange}
          placeholder="Ex: Paris, Japão, Toscana..."
        />
      </div>

      {/* Campo opcional — descrição livre */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          💭 Ainda na dúvida ou quer dar mais contexto?
          <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
        </label>
        <Textarea
          value={answers.customRequests || ""}
          onChange={(e) => onUpdate("customRequests", e.target.value)}
          placeholder="Ex: lugar tranquilo com praia e cultura, fugir do frio, lua de mel romântica..."
          className="min-h-[88px] resize-none bg-background border-border focus:border-primary"
          maxLength={300}
        />
        <p className="text-xs text-muted-foreground text-right">
          {(answers.customRequests || "").length}/300
        </p>
      </div>
    </motion.div>
  );
};
