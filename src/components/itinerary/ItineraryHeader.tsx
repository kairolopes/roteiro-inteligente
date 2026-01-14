import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Coins, Download, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Itinerary } from "@/types/itinerary";

interface ItineraryHeaderProps {
  itinerary: Itinerary;
  onExportPDF: () => void;
  isExporting: boolean;
}

const ItineraryHeader = ({ itinerary, onExportPDF, isExporting }: ItineraryHeaderProps) => {
  const navigate = useNavigate();

  return (
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
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{itinerary.duration}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{itinerary.destinations.join(" → ")}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Coins className="w-4 h-4" />
                <span>{itinerary.totalBudget}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Compartilhar</span>
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
  );
};

export default ItineraryHeader;
