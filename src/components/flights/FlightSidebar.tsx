import { motion } from "framer-motion";
import { Hotel, Car, Ticket, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHotellookLink, getGetYourGuideLink, BookingContext } from "@/lib/affiliateLinks";
import { trackAffiliateClick } from "@/hooks/useAffiliateTracking";

interface FlightSidebarProps {
  destination: string;
  destinationName: string;
}

export function FlightSidebar({ destination, destinationName }: FlightSidebarProps) {
  const context: BookingContext = {
    city: destinationName,
    destinationIata: destination,
  };

  const handleHotelClick = () => {
    trackAffiliateClick({
      partnerId: "hotellook",
      partnerName: "Hotellook",
      category: "hotels",
      component: "FlightSidebar",
      destination: destinationName,
    });
    window.open(getHotellookLink(context), "_blank", "noopener,noreferrer");
  };

  const handleToursClick = () => {
    trackAffiliateClick({
      partnerId: "getyourguide",
      partnerName: "GetYourGuide",
      category: "tours",
      component: "FlightSidebar",
      destination: destinationName,
    });
    window.open(getGetYourGuideLink(context), "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4 sticky top-24"
    >
      {/* Hotels Card */}
      <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Hotel className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Hotéis em {destinationName}</h4>
            <p className="text-xs text-muted-foreground">Compare preços de hospedagem</p>
          </div>
        </div>
        <Button 
          onClick={handleHotelClick}
          className="w-full gap-2" 
          variant="outline"
        >
          Explorar hotéis
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {/* Car Rental Card */}
      <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Car className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Aluguel de Carro</h4>
            <p className="text-xs text-muted-foreground">Em breve</p>
          </div>
        </div>
        <Button 
          className="w-full gap-2" 
          variant="outline"
          disabled
        >
          Em breve
        </Button>
      </div>

      {/* Tours Card */}
      <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Ticket className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Tours e Atividades</h4>
            <p className="text-xs text-muted-foreground">Experiências imperdíveis</p>
          </div>
        </div>
        <Button 
          onClick={handleToursClick}
          className="w-full gap-2" 
          variant="outline"
        >
          Ver passeios
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {/* Price Alert Card */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
        <h4 className="font-semibold text-sm mb-2">🔔 Alerta de Preço</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Receba notificações quando os preços baixarem
        </p>
        <Button 
          className="w-full" 
          size="sm"
          variant="secondary"
          disabled
        >
          Em breve
        </Button>
      </div>
    </motion.div>
  );
}
