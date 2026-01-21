import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Coins, Download, Bookmark, Loader2, Check, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Itinerary } from "@/types/itinerary";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/auth/AuthModal";
import PDFProgressModal, { PDFProgressStep } from "@/components/itinerary/PDFProgressModal";
import { cn } from "@/lib/utils";

interface ItineraryHeaderProps {
  itinerary: Itinerary;
  onExportPDF: () => void;
  isExporting: boolean;
  pdfProgress?: number;
  pdfStep?: PDFProgressStep;
  startDate?: Date | null;
  onStartDateChange?: (date: Date) => void;
}

const ItineraryHeader = ({ itinerary, onExportPDF, isExporting, pdfProgress = 0, pdfStep = 'fetching-images', startDate, onStartDateChange }: ItineraryHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSave = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("saved_itineraries").insert([{
        user_id: user.id,
        title: itinerary.title,
        summary: itinerary.summary,
        duration: itinerary.duration,
        total_budget: itinerary.totalBudget,
        destinations: itinerary.destinations,
        itinerary_data: JSON.parse(JSON.stringify(itinerary)),
      }]);

      if (error) throw error;

      setIsSaved(true);
      toast({
        title: "Roteiro salvo! 🎉",
        description: "Acesse seus roteiros na página 'Meus Roteiros'.",
      });
    } catch (error) {
      console.error("Error saving itinerary:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar o roteiro. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && onStartDateChange) {
      onStartDateChange(date);
      setIsCalendarOpen(false);
      toast({
        title: "Data atualizada! 📅",
        description: "As datas do roteiro foram recalculadas.",
      });
    }
  };

  const formatStartDate = (date: Date) => {
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dayNum = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${weekDays[date.getDay()]}, ${dayNum}/${month}/${year}`;
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass border-b border-border sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Back & Title */}
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/chat")}
                className="text-muted-foreground mt-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold">{itinerary.title}</h1>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 max-w-2xl">
                  {itinerary.summary}
                </p>
              </div>
            </div>

            {/* Meta & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pl-14 lg:pl-0">
              {/* Stats */}
              <div className="flex items-center gap-3 text-sm flex-wrap">
                {itinerary.duration && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{itinerary.duration}</span>
                  </div>
                )}
                
                {/* Editable Start Date */}
                {onStartDateChange && (
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "gap-1.5 h-7 text-xs font-normal",
                          startDate ? "text-primary border-primary/50" : "text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                        {startDate ? formatStartDate(startDate) : "Definir início"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={startDate || undefined}
                        onSelect={handleDateSelect}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                )}

                {itinerary.destinations?.length > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{itinerary.destinations.join(" → ")}</span>
                  </div>
                )}
                {itinerary.totalBudget && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Coins className="w-4 h-4" />
                    <span>{itinerary.totalBudget}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleSave}
                  disabled={isSaving || isSaved}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isSaved ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {isSaved ? "Salvo" : "Salvar"}
                  </span>
                </Button>
                <Button
                  size="sm"
                  className="gradient-primary text-primary-foreground gap-2"
                  onClick={onExportPDF}
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isExporting ? "Gerando..." : "Exportar PDF"}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <PDFProgressModal 
        isOpen={isExporting} 
        currentStep={pdfStep} 
        progress={pdfProgress} 
      />
    </>
  );
};

export default ItineraryHeader;
