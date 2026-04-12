import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, RefreshCw, CheckCircle2, MapPin, Plane, Camera, Utensils, Hotel, Globe } from "lucide-react";

interface ProgressState {
  step: string;
  message: string;
  model?: string;
  attempt?: number;
  totalModels?: number;
}

interface ItineraryLoadingScreenProps {
  progress: ProgressState | null;
}

const TRAVEL_TIPS = [
  "Sabia que visitar atrações logo cedo evita filas?",
  "Leve sempre uma garrafa d'água reutilizável nas viagens.",
  "Fazer reservas antecipadas economiza até 40%.",
  "Experimente a culinária local — é a melhor parte da viagem!",
  "Caminhar pelo bairro é a melhor forma de conhecer uma cidade.",
  "Baixe mapas offline para não depender de internet.",
  "Sempre tenha uma cópia digital dos documentos importantes.",
];

const floatingIcons = [
  { Icon: MapPin, delay: 0, x: -60, y: -80 },
  { Icon: Plane, delay: 0.5, x: 70, y: -60 },
  { Icon: Camera, delay: 1, x: -80, y: 20 },
  { Icon: Utensils, delay: 1.5, x: 80, y: 40 },
  { Icon: Hotel, delay: 2, x: -40, y: 80 },
  { Icon: Globe, delay: 2.5, x: 50, y: -90 },
];

const steps = [
  { id: "starting", label: "Preparando", icon: Loader2 },
  { id: "ai_generation", label: "Gerando roteiro", icon: Sparkles },
  { id: "ai_retry", label: "Otimizando", icon: RefreshCw },
  { id: "ai_success", label: "Roteiro gerado", icon: CheckCircle2 },
  { id: "enriching", label: "Adicionando detalhes", icon: MapPin },
  { id: "complete", label: "Pronto!", icon: CheckCircle2 },
  { id: "done", label: "Pronto!", icon: CheckCircle2 },
];

function getStepIndex(step: string): number {
  const idx = steps.findIndex((s) => s.id === step);
  return idx >= 0 ? idx : 0;
}

function getProgressPercent(step: string): number {
  const map: Record<string, number> = {
    starting: 10,
    ai_generation: 35,
    ai_retry: 45,
    ai_success: 70,
    enriching: 85,
    complete: 100,
    done: 100,
  };
  return map[step] || 15;
}

export default function ItineraryLoadingScreen({ progress }: ItineraryLoadingScreenProps) {
  const currentStep = progress?.step || "starting";
  const percent = getProgressPercent(currentStep);
  const tipIndex = Math.floor(Date.now() / 5000) % TRAVEL_TIPS.length;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden relative">
      {/* Floating travel icons */}
      {floatingIcons.map(({ Icon, delay, x, y }, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/10"
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 0.15, 0.15, 0],
            x: [0, x * 0.5, x, x * 1.2],
            y: [0, y * 0.5, y, y * 1.2],
          }}
          transition={{
            duration: 6,
            delay: delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ left: "50%", top: "45%" }}
        >
          <Icon className="w-8 h-8 lg:w-10 lg:h-10" />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm px-6 relative z-10"
      >
        {/* Animated globe/plane icon */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          {/* Outer ring pulse */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/20"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-primary/15"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 2, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Central icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-lg">
              <Globe className="w-10 h-10 text-primary-foreground" />
            </div>
          </motion.div>

          {/* Orbiting plane */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <motion.div className="absolute -top-1 left-1/2 -translate-x-1/2">
              <Plane className="w-5 h-5 text-primary rotate-45" />
            </motion.div>
          </motion.div>
        </div>

        {/* Title */}
        <motion.h2
          className="text-xl lg:text-2xl font-bold mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Sofia está criando seu roteiro
        </motion.h2>
        <motion.p
          className="text-sm text-muted-foreground mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Personalizando cada detalhe da sua viagem...
        </motion.p>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-4 overflow-hidden">
          <motion.div
            className="h-full rounded-full gradient-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Current step */}
        <div className="bg-card border border-border rounded-xl p-4 mb-5">
          <AnimatePresence mode="wait">
            {progress && (
              <motion.div
                key={progress.step + progress.message}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {currentStep === "ai_generation" ? (
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  ) : currentStep === "ai_retry" ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : currentStep === "complete" || currentStep === "done" || currentStep === "ai_success" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  )}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{progress.message}</p>
                  {progress.model && (
                    <p className="text-xs text-muted-foreground">
                      IA: {progress.model}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step timeline dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {["starting", "ai_generation", "ai_success", "enriching", "complete"].map((s, i) => {
            const active = getStepIndex(currentStep) >= getStepIndex(s);
            return (
              <motion.div
                key={s}
                className={`rounded-full transition-colors duration-300 ${
                  active ? "bg-primary" : "bg-muted-foreground/20"
                }`}
                animate={{
                  width: currentStep === s ? 20 : 8,
                  height: 8,
                }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </div>

        {/* Travel tip */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-3"
          >
            <p className="text-xs text-muted-foreground">
              <span className="text-primary font-medium">💡 Dica:</span>{" "}
              {TRAVEL_TIPS[tipIndex]}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
