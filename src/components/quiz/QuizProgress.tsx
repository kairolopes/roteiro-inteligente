import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export function QuizProgress({ currentStep, totalSteps, stepTitles }: QuizProgressProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 gradient-primary"
        />
      </div>

      {/* Step indicators - mobile */}
      <div className="flex justify-between items-center lg:hidden">
        <span className="text-sm text-muted-foreground">
          Passo {currentStep + 1} de {totalSteps}
        </span>
        <span className="text-sm font-medium text-primary">
          {stepTitles[currentStep]}
        </span>
      </div>

      {/* Step indicators - desktop */}
      <div className="hidden lg:flex justify-between">
        {stepTitles.map((title, index) => (
          <div
            key={title}
            className={cn(
              "flex items-center gap-2 text-sm transition-colors",
              index === currentStep && "text-primary font-medium",
              index < currentStep && "text-primary",
              index > currentStep && "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all",
                index === currentStep && "gradient-primary text-primary-foreground",
                index < currentStep && "bg-primary text-primary-foreground",
                index > currentStep && "bg-secondary text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <Check className="w-3 h-3" />
              ) : (
                index + 1
              )}
            </div>
            <span className="hidden xl:inline">{title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
