import { motion, AnimatePresence } from "framer-motion";
import { 
  Image, 
  Map, 
  FileText, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export type PDFProgressStep = 
  | 'fetching-images'
  | 'generating-map'
  | 'creating-pdf'
  | 'complete';

interface PDFProgressModalProps {
  isOpen: boolean;
  currentStep: PDFProgressStep;
  progress: number;
}

const steps: { id: PDFProgressStep; label: string; icon: typeof Image }[] = [
  { id: 'fetching-images', label: 'Buscando imagens...', icon: Image },
  { id: 'generating-map', label: 'Gerando mapa da rota...', icon: Map },
  { id: 'creating-pdf', label: 'Criando PDF...', icon: FileText },
  { id: 'complete', label: 'Concluído!', icon: CheckCircle2 },
];

const PDFProgressModal = ({ isOpen, currentStep, progress }: PDFProgressModalProps) => {
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <div className="flex flex-col items-center py-6">
          {/* Animated Icon */}
          <motion.div
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6"
          >
            {currentStep === 'complete' ? (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            ) : (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            )}
          </motion.div>

          {/* Title */}
          <h3 className="text-lg font-semibold mb-2">
            Gerando seu PDF Premium
          </h3>

          {/* Current step label */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-muted-foreground text-sm mb-6"
            >
              {steps.find(s => s.id === currentStep)?.label}
            </motion.p>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="w-full px-4 mb-6">
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {steps.slice(0, -1).map((step, index) => {
              const isComplete = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const StepIcon = step.icon;

              return (
                <motion.div
                  key={step.id}
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-colors
                    ${isComplete 
                      ? 'bg-green-100 text-green-600' 
                      : isCurrent 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Estimated time */}
          {currentStep !== 'complete' && (
            <p className="text-xs text-muted-foreground mt-4">
              Tempo estimado: 5-10 segundos
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFProgressModal;
