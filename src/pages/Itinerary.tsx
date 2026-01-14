import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Itinerary as ItineraryType, createEmptyItinerary } from "@/types/itinerary";
import { usePDFExport } from "@/hooks/usePDFExport";
import ItineraryHeader from "@/components/itinerary/ItineraryHeader";
import DaySelector from "@/components/itinerary/DaySelector";
import DayTimeline from "@/components/itinerary/DayTimeline";
import ItineraryMap from "@/components/itinerary/ItineraryMap";
import { QuizAnswers } from "@/types/quiz";

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-itinerary`;

const Itinerary = () => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { exportToPDF, isExporting } = usePDFExport();

  useEffect(() => {
    // Check if we have a cached itinerary
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

    // Generate new itinerary
    generateItinerary();
  }, []);

  const generateItinerary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get quiz answers from session
      const quizData = sessionStorage.getItem("quizAnswers");
      const quizAnswers: QuizAnswers | null = quizData ? JSON.parse(quizData) : null;

      if (!quizAnswers) {
        setError("Nenhuma preferência encontrada. Por favor, refaça o quiz.");
        setIsLoading(false);
        return;
      }

      // Get conversation summary if available
      const conversationSummary = sessionStorage.getItem("chatSummary") || "";

      const response = await fetch(GENERATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ quizAnswers, conversationSummary }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error("Limite de requisições atingido. Aguarde um momento.");
        }
        if (response.status === 402) {
          throw new Error("Créditos insuficientes.");
        }
        throw new Error(errorData.error || "Erro ao gerar roteiro");
      }

      const data = await response.json();
      
      if (!data.itinerary) {
        throw new Error("Roteiro não gerado corretamente");
      }

      // Cache the itinerary
      sessionStorage.setItem("generatedItinerary", JSON.stringify(data.itinerary));
      setItinerary(data.itinerary);
      
      toast({
        title: "Roteiro criado! 🎉",
        description: "Seu roteiro personalizado está pronto.",
      });
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
  };

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
    sessionStorage.removeItem("generatedItinerary");
    generateItinerary();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Criando seu roteiro...</h2>
          <p className="text-muted-foreground max-w-md">
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
      />

      <DaySelector
        days={itinerary.days}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />

      <main className="container mx-auto px-4 lg:px-8 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="order-2 lg:order-1"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                📅 {selectedDay ? `Dia ${selectedDay}` : "Todos os dias"}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerar
              </Button>
            </div>
            <div className="space-y-4">
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
            className="order-1 lg:order-2 lg:sticky lg:top-[160px] h-[300px] lg:h-[calc(100vh-200px)]"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              🗺️ Mapa do Roteiro
            </h2>
            <div className="h-[calc(100%-40px)]">
              <ItineraryMap
                days={itinerary.days}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Itinerary;
