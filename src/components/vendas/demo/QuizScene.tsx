import { motion } from "framer-motion";
import { MapPin, Check } from "lucide-react";

const destinations = [
  { name: "Paris", emoji: "🇫🇷" },
  { name: "Roma", emoji: "🇮🇹" },
  { name: "Tokyo", emoji: "🇯🇵" },
];

export function QuizScene() {
  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium mb-3">
          <MapPin className="h-3 w-3" />
          Passo 1 de 5
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Para onde você quer ir?
        </h3>
      </div>

      {/* Options */}
      <div className="flex-1 flex flex-col gap-3 max-w-xs mx-auto w-full">
        {destinations.map((dest, i) => (
          <motion.div
            key={dest.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="relative"
          >
            <motion.div
              animate={i === 0 ? {
                scale: [1, 1.02, 1],
                borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--primary))"],
              } : {}}
              transition={{ delay: 1.5, duration: 0.5 }}
              className={`
                flex items-center gap-3 p-4 rounded-xl border-2 bg-card/50 backdrop-blur-sm
                ${i === 0 ? "border-primary bg-primary/10" : "border-border"}
              `}
            >
              <span className="text-2xl">{dest.emoji}</span>
              <span className="font-medium text-foreground">{dest.name}</span>
              
              {i === 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 2, type: "spring" }}
                  className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="h-3 w-3 text-primary-foreground" />
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "20%" }}
            transition={{ delay: 2.5, duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
          />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Próximo: Datas da viagem
        </p>
      </div>
    </div>
  );
}
