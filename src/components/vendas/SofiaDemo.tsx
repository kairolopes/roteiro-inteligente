import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { QuizScene } from "./demo/QuizScene";
import { ChatScene } from "./demo/ChatScene";
import { ItineraryScene } from "./demo/ItineraryScene";
import { cn } from "@/lib/utils";

const scenes = [
  { id: "quiz", label: "Quiz", component: QuizScene, duration: 4000 },
  { id: "chat", label: "Chat", component: ChatScene, duration: 5000 },
  { id: "itinerary", label: "Roteiro", component: ItineraryScene, duration: 4000 },
];

export function SofiaDemo() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [key, setKey] = useState(0); // For resetting animations

  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % scenes.length);
      setKey((k) => k + 1); // Reset animations on scene change
    }, scenes[currentScene].duration);

    return () => clearTimeout(timer);
  }, [currentScene, isPaused, key]);

  const handleDotClick = (index: number) => {
    setCurrentScene(index);
    setKey((k) => k + 1);
  };

  const handleRestart = () => {
    setCurrentScene(0);
    setKey((k) => k + 1);
    setIsPaused(false);
  };

  const CurrentSceneComponent = scenes[currentScene].component;

  return (
    <div className="relative">
      {/* Browser mockup */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-card to-card/80 border border-border/50 shadow-2xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
            <div className="w-3 h-3 rounded-full bg-green-400/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md bg-background/50 text-xs text-muted-foreground font-mono">
              viagecomsofia.com
            </div>
          </div>
          <div className="w-12" /> {/* Spacer for symmetry */}
        </div>

        {/* Scene content */}
        <div className="relative h-[calc(100%-40px)] bg-background/95">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentScene}-${key}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <CurrentSceneComponent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Scene label overlay */}
        <motion.div
          key={`label-${currentScene}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-12 right-3"
        >
          <div className="px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-medium backdrop-blur-sm">
            {scenes[currentScene].label}
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {/* Scene indicators */}
        <div className="flex items-center gap-2">
          {scenes.map((scene, i) => (
            <button
              key={scene.id}
              onClick={() => handleDotClick(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300 hover:opacity-80",
                currentScene === i
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Ir para ${scene.label}`}
            />
          ))}
        </div>

        {/* Play/Pause button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          aria-label={isPaused ? "Continuar" : "Pausar"}
        >
          {isPaused ? (
            <Play className="h-4 w-4 text-foreground" />
          ) : (
            <Pause className="h-4 w-4 text-foreground" />
          )}
        </button>

        {/* Restart button */}
        <button
          onClick={handleRestart}
          className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          aria-label="Reiniciar"
        >
          <RotateCcw className="h-4 w-4 text-foreground" />
        </button>
      </div>

      {/* Caption */}
      <p className="text-center text-sm text-muted-foreground mt-3">
        Veja Sofia criando um roteiro em tempo real
      </p>
    </div>
  );
}
