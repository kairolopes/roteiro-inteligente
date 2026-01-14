import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { sampleItinerary } from "@/types/itinerary";
import { usePDFExport } from "@/hooks/usePDFExport";
import ItineraryHeader from "@/components/itinerary/ItineraryHeader";
import DaySelector from "@/components/itinerary/DaySelector";
import DayTimeline from "@/components/itinerary/DayTimeline";
import ItineraryMap from "@/components/itinerary/ItineraryMap";

const Itinerary = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { toast } = useToast();
  const { exportToPDF, isExporting } = usePDFExport();

  // Using sample itinerary for now - this would come from the chat/AI
  const itinerary = sampleItinerary;

  const handleExportPDF = async () => {
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
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              📅 {selectedDay ? `Dia ${selectedDay}` : "Todos os dias"}
            </h2>
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
