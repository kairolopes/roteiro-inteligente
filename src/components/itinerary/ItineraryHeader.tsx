import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Coins, Download, Share2, Bookmark, Loader2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Itinerary } from "@/types/itinerary";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/auth/AuthModal";

interface ItineraryHeaderProps {
  itinerary: Itinerary;
  onExportPDF: () => void;
  isExporting: boolean;
}

const ItineraryHeader = ({ itinerary, onExportPDF, isExporting }: ItineraryHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
              <div className="flex items-center gap-4 text-sm">
                {itinerary.duration && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{itinerary.duration}</span>
                  </div>
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
    </>
  );
};

export default ItineraryHeader;
