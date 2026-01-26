import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, RefreshCw, ArrowLeft, Sparkles, MapPin, CheckCircle2, Lock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Itinerary as ItineraryType } from "@/types/itinerary";
import { usePDFExport } from "@/hooks/usePDFExport";
import ItineraryHeader from "@/components/itinerary/ItineraryHeader";
import DaySelector from "@/components/itinerary/DaySelector";
import DayTimeline from "@/components/itinerary/DayTimeline";
import ItineraryMap from "@/components/itinerary/ItineraryMap";
import { QuizAnswers } from "@/types/quiz";
import { useAuth } from "@/hooks/useAuth";
import { useUserCredits } from "@/hooks/useUserCredits";
import { PaywallModal } from "@/components/PaywallModal";
import AuthModal from "@/components/auth/AuthModal";
import { getGenerateItineraryUrl, getAuthHeaders } from "@/lib/apiRouting";

interface ProgressState {
  step: string;
  message: string;
  model?: string;
  attempt?: number;
  totalModels?: number;
}

const Itinerary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canGenerateItinerary, consumeItineraryCredit, refetch: refetchCredits } = useUserCredits();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isPartialItinerary, setIsPartialItinerary] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const { toast } = useToast();
  const { exportToPDF, isExporting, currentStep: pdfStep, progress: pdfProgress } = usePDFExport();

  const generateItineraryWithStreaming = useCallback(async (skipCreditCheck = false) => {
    // Check if user needs to login
    if (!user) {
      setShowAuthModal(true);
      setIsLoading(false);
      return;
    }

    // Check credits (unless skipping for regeneration with existing credit)
    if (!skipCreditCheck && !canGenerateItinerary) {
      setShowPaywall(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress({ step: "starting", message: "Iniciando geração do roteiro..." });

    try {
      const quizData = sessionStorage.getItem("quizAnswers");
      const quizAnswers: QuizAnswers | null = quizData ? JSON.parse(quizData) : null;

      if (!quizAnswers) {
        setError("Nenhuma preferência encontrada. Por favor, refaça o quiz.");
        setIsLoading(false);
        return;
      }

      // Store startDate for DaySelector
      if (quizAnswers.startDate) {
        setStartDate(new Date(quizAnswers.startDate));
      }

      const conversationSummary = sessionStorage.getItem("chatSummary") || "";

      const response = await fetch(getGenerateItineraryUrl(), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ quizAnswers, conversationSummary, stream: true }),
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error("Sofia está ocupada. Tente novamente em 30 segundos.");
        }
        if (response.status === 402) {
          throw new Error("Créditos insuficientes para gerar o roteiro.");
        }
        if (response.status >= 500) {
          throw new Error("Falha temporária no servidor. Tente novamente.");
        }
        throw new Error(errorData.error || "Verifique sua conexão e tente novamente.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === "progress") {
              setProgress(event.data);
            } else if (event.type === "complete") {
              // Consume credit on successful generation
              if (!skipCreditCheck) {
                await consumeItineraryCredit();
                await refetchCredits();
              }
              sessionStorage.setItem("generatedItinerary", JSON.stringify(event.data.itinerary));
              setItinerary(event.data.itinerary);
              setIsPartialItinerary(false);
              setProgress({ step: "done", message: "Roteiro pronto!" });
              toast({
                title: "Roteiro criado! 🎉",
                description: "Seu roteiro personalizado está pronto.",
              });
            } else if (event.type === "error") {
              throw new Error(event.data.error);
            }
          } catch (parseError) {
            console.error("Error parsing SSE event:", parseError);
          }
        }
      }
    } catch (err) {
      console.error("Error generating itinerary:", err);
      setError(err instanceof Error ? err.message : "Erro ao gerar roteiro");
      toast({
        variant: "destructive",
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro ao gerar roteiro",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user, canGenerateItinerary, consumeItineraryCredit, refetchCredits]);

  useEffect(() => {
    // Load startDate from quiz answers
    const quizData = sessionStorage.getItem("quizAnswers");
    if (quizData) {
      try {
        const quizAnswers = JSON.parse(quizData);
        if (quizAnswers.startDate) {
          setStartDate(new Date(quizAnswers.startDate));
        }
      } catch (e) {
        console.error("Error parsing quiz answers for startDate:", e);
      }
    }

    const cached = sessionStorage.getItem("generatedItinerary");
    if (cached) {
      try {
        setItinerary(JSON.parse(cached));
        setIsLoading(false);
        return;
      } catch (e) {
        console.error("Error parsing cached itinerary:", e);
      }
    }

    generateItineraryWithStreaming();
  }, [generateItineraryWithStreaming]);

  const handleExportPDF = async () => {
    if (!itinerary) return;
    try {
      await exportToPDF(itinerary);
      toast({
        title: "PDF exportado! 📄",
        description: "Seu roteiro foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: "Não foi possível gerar o PDF. Tente novamente.",
      });
    }
  };

  const handleRegenerate = () => {
    if (!canGenerateItinerary) {
      setShowPaywall(true);
      return;
    }
    sessionStorage.removeItem("generatedItinerary");
    generateItineraryWithStreaming(false);
  };

  const getProgressIcon = () => {
    if (!progress) return <Loader2 className="w-6 h-6 animate-spin" />;
    
    switch (progress.step) {
      case "ai_generation":
        return <Sparkles className="w-6 h-6 animate-pulse" />;
      case "ai_retry":
        return <RefreshCw className="w-6 h-6 animate-spin" />;
      case "ai_success":
      case "complete":
      case "done":
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      default:
        return <Loader2 className="w-6 h-6 animate-spin" />;
    }
  };

  // Loading state with detailed progress
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md px-4"
        >
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Criando seu roteiro...</h2>
          
          {/* Progress Steps */}
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <AnimatePresence mode="wait">
              {progress && (
                <motion.div
                  key={progress.step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {getProgressIcon()}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm">{progress.message}</p>
                    {progress.model && (
                      <p className="text-xs text-muted-foreground">
                        Modelo: {progress.model}
                        {progress.attempt && progress.totalModels && progress.totalModels > 1 && (
                          <span> ({progress.attempt}/{progress.totalModels})</span>
                        )}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-muted-foreground text-sm">
            A IA está gerando um roteiro personalizado baseado nas suas preferências. 
            Isso pode levar alguns segundos.
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Ops! Algo deu errado</h2>
          <p className="text-muted-foreground mb-6">{error || "Não foi possível gerar o roteiro."}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/quiz")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Refazer Quiz
            </Button>
            <Button onClick={handleRegenerate} className="gradient-primary text-primary-foreground">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const filteredDays = selectedDay
    ? itinerary.days.filter((day) => day.day === selectedDay)
    : itinerary.days;

  return (
    <div className="min-h-screen bg-background">
      <ItineraryHeader
        itinerary={itinerary}
        onExportPDF={handleExportPDF}
        isExporting={isExporting}
        pdfProgress={pdfProgress}
        pdfStep={pdfStep}
        startDate={startDate}
        onStartDateChange={setStartDate}
      />

      <DaySelector
        days={itinerary.days}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        startDate={startDate}
      />

      <main className="container mx-auto px-3 lg:px-8 py-4 lg:py-6">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="order-2 lg:order-1"
          >
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h2 className="text-base lg:text-lg font-bold flex items-center gap-2">
                📅 {selectedDay ? `Dia ${selectedDay}` : "Todos os dias"}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                className="gap-1.5 lg:gap-2 text-xs lg:text-sm h-8 lg:h-9 touch-active"
              >
                <RefreshCw className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Regenerar</span>
              </Button>
            </div>
            <div className="space-y-3 lg:space-y-4">
              {filteredDays.map((day) => (
                <DayTimeline
                  key={day.day}
                  day={day}
                  isSelected={selectedDay === day.day || selectedDay === null}
                  onSelect={() => setSelectedDay(selectedDay === day.day ? null : day.day)}
                />
              ))}
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="order-1 lg:order-2 lg:sticky lg:top-[140px] h-[200px] lg:h-[calc(100vh-180px)]"
          >
            <h2 className="text-base lg:text-lg font-bold mb-2 lg:mb-4 flex items-center gap-2">
              🗺️ Mapa
            </h2>
            <div className="h-[calc(100%-32px)] lg:h-[calc(100%-48px)] rounded-lg lg:rounded-xl overflow-hidden">
              <ItineraryMap
                days={itinerary.days}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
              />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        type="itinerary"
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Itinerary;
