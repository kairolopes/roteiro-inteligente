import { motion } from "framer-motion";
import { Hotel, Car, Ticket, Shield, Sparkles, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getHotellookLink, getGetYourGuideLink, BookingContext } from "@/lib/affiliateLinks";
import { trackAffiliateClick } from "@/hooks/useAffiliateTracking";

interface TripPackageUpsellProps {
  destination: string;
  destinationName: string;
  checkIn?: string;
  checkOut?: string;
  variant?: "compact" | "full";
}

export function TripPackageUpsell({
  destination,
  destinationName,
  checkIn,
  checkOut,
  variant = "full",
}: TripPackageUpsellProps) {
  const context: BookingContext = {
    city: destinationName,
    destinationIata: destination,
    checkIn,
    checkOut,
  };

  const handleHotelClick = () => {
    trackAffiliateClick({
      partnerId: "hotellook",
      partnerName: "Hotellook",
      category: "hotels",
      component: "TripPackageUpsell",
      destination: destinationName,
    });
    window.open(getHotellookLink(context), "_blank", "noopener,noreferrer");
  };

  const handleCarClick = () => {
    // Rental Cars via Travelpayouts
    const rentalUrl = `https://www.rentalcars.com/SearchResults.do?country=${encodeURIComponent(destinationName)}&puDay=${checkIn?.slice(8, 10) || '01'}&puMonth=${checkIn?.slice(5, 7) || '01'}&puYear=${checkIn?.slice(0, 4) || '2026'}`;
    window.open(rentalUrl, "_blank", "noopener,noreferrer");
  };

  const handleToursClick = () => {
    trackAffiliateClick({
      partnerId: "getyourguide",
      partnerName: "GetYourGuide",
      category: "tours",
      component: "TripPackageUpsell",
      destination: destinationName,
    });
    window.open(getGetYourGuideLink(context), "_blank", "noopener,noreferrer");
  };

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Complete sua viagem com até 30% de economia</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={handleHotelClick} className="gap-2">
            <Hotel className="h-4 w-4" />
            Hotéis
          </Button>
          <Button size="sm" variant="outline" onClick={handleCarClick} className="gap-2">
            <Car className="h-4 w-4" />
            Carros
          </Button>
          <Button size="sm" variant="outline" onClick={handleToursClick} className="gap-2">
            <Ticket className="h-4 w-4" />
            Passeios
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Complete sua viagem para {destinationName}</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione hotel, carro e passeios com preços especiais
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Hotels */}
        <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer" onClick={handleHotelClick}>
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Hotel className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">Hotéis em {destinationName}</h4>
              <Badge variant="secondary" className="text-xs">Até 40% OFF</Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">Compara Booking, Hotels.com e mais</p>
          </div>
          <Button size="sm" variant="ghost" className="shrink-0">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Cars */}
        <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer" onClick={handleCarClick}>
          <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
            <Car className="h-6 w-6 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">Aluguel de Carro</h4>
              <Badge variant="secondary" className="text-xs">A partir de R$ 89/dia</Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">Econômico, SUV, Luxo e mais</p>
          </div>
          <Button size="sm" variant="ghost" className="shrink-0">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Tours */}
        <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer" onClick={handleToursClick}>
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <Ticket className="h-6 w-6 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">Tours e Atividades</h4>
              <Badge variant="secondary" className="text-xs">Experiências únicas</Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">Passeios, ingressos, experiências</p>
          </div>
          <Button size="sm" variant="ghost" className="shrink-0">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Insurance */}
        <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl opacity-60">
          <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
            <Shield className="h-6 w-6 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">Seguro Viagem</h4>
              <Badge variant="outline" className="text-xs">Em breve</Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">Proteção completa para sua viagem</p>
          </div>
          <Button size="sm" variant="ghost" className="shrink-0" disabled>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
