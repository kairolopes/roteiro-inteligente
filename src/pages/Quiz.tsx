import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { TravelStyleStep } from "@/components/quiz/steps/TravelStyleStep";
import { AccommodationStep } from "@/components/quiz/steps/AccommodationStep";
import { BudgetStep } from "@/components/quiz/steps/BudgetStep";
import { DatesStep } from "@/components/quiz/steps/DatesStep";
import { DestinationsStep } from "@/components/quiz/steps/DestinationsStep";
import { InterestsStep } from "@/components/quiz/steps/InterestsStep";
import { TravelWithStep } from "@/components/quiz/steps/TravelWithStep";
import { QuizSummary } from "@/components/quiz/QuizSummary";
import { QuizAnswers, defaultQuizAnswers } from "@/types/quiz";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: "style", title: "Estilo" },
  { id: "accommodation", title: "Hospedagem" },
  { id: "budget", title: "Orçamento" },
  { id: "dates", title: "Datas" },
  { id: "destinations", title: "Destinos" },
  { id: "interests", title: "Interesses" },
  { id: "companion", title: "Companhia" },
  { id: "summary", title: "Resumo" },
];

const stepComponents = [
  TravelStyleStep,
  AccommodationStep,
  BudgetStep,
  DatesStep,
  DestinationsStep,
  InterestsStep,
  TravelWithStep,
];

const Quiz = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(defaultQuizAnswers);

  const updateAnswer = (key: keyof QuizAnswers, value: any) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Travel style
        return answers.travelStyle !== "";
      case 1: // Accommodation
        return answers.accommodation !== "";
      case 2: // Budget
        return answers.budget !== "" && answers.pace !== "";
      case 3: // Dates
        return answers.duration !== "";
      case 4: // Destinations
        return answers.destinations.length > 0;
      case 5: // Interests
        return answers.interests.length > 0;
      case 6: // Travel with
        return answers.travelWith !== "";
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast({
        title: "Complete esta etapa",
        description: "Por favor, faça pelo menos uma seleção para continuar.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCreateItinerary = () => {
    // Store answers in sessionStorage
    sessionStorage.setItem("quizAnswers", JSON.stringify(answers));
    toast({
      title: "Roteiro em criação!",
      description: "Nossa IA está montando seu roteiro personalizado...",
    });
    // Navigate to chat page
    navigate("/chat");
  };

  const CurrentStepComponent = stepComponents[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass safe-area-top">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-14 lg:h-20 items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Plane className="w-4 h-4 lg:w-5 lg:h-5 text-primary-foreground" />
              </div>
              <span className="text-lg lg:text-xl font-bold">
                Travel<span className="text-primary">Plan</span>
              </span>
            </a>

            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-muted-foreground text-sm touch-active"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 lg:pt-28 pb-28 lg:pb-32">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Progress */}
          <div className="mb-6 lg:mb-10">
            <QuizProgress
              currentStep={currentStep}
              totalSteps={steps.length}
              stepTitles={steps.map((s) => s.title)}
            />
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {isLastStep ? (
                <QuizSummary
                  answers={answers}
                  onCreateItinerary={handleCreateItinerary}
                />
              ) : (
                CurrentStepComponent && (
                  <CurrentStepComponent
                    answers={answers}
                    onUpdate={updateAnswer}
                  />
                )
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation Footer */}
      {!isLastStep && (
        <footer className="fixed bottom-0 left-0 right-0 glass border-t border-border safe-area-bottom">
          <div className="container mx-auto px-4 lg:px-8 py-3 lg:py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-1.5 lg:gap-2 touch-active h-11 lg:h-10 px-3 lg:px-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>

              <span className="text-xs lg:text-sm text-muted-foreground">
                {currentStep + 1} / {steps.length}
              </span>

              <Button
                onClick={handleNext}
                className="gradient-primary text-primary-foreground gap-1.5 lg:gap-2 touch-active h-11 lg:h-10 px-4 lg:px-6"
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Quiz;
