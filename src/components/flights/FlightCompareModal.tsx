import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plane, ExternalLink, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { 
  getSkyscannerLink, 
  getDecolarLink, 
  getGoogleFlightsLink, 
  getKayakBrasilLink, 
  getMomondoLink,
  getAviasalesLink,
  BookingContext 
} from "@/lib/affiliateLinks";
import { trackAffiliateClick } from "@/hooks/useAffiliateTracking";

export interface FlightCompareData {
  origin: string;
  originIata: string;
  destination: string;
  destinationIata: string;
  price: number;
  departureAt?: string;
}

interface FlightCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: FlightCompareData | null;
}

const comparisonSites = [
  {
    id: "skyscanner",
    name: "Skyscanner Brasil",
    description: "Interface 100% em português",
    color: "bg-cyan-500 hover:bg-cyan-600",
    getLink: getSkyscannerLink,
  },
  {
    id: "decolar",
    name: "Decolar",
    description: "Maior agência da América Latina",
    color: "bg-purple-500 hover:bg-purple-600",
    getLink: getDecolarLink,
  },
  {
    id: "google_flights",
    name: "Google Flights",
    description: "Veja calendário de preços",
    color: "bg-blue-500 hover:bg-blue-600",
    getLink: getGoogleFlightsLink,
  },
  {
    id: "kayak",
    name: "Kayak Brasil",
    description: "Buscador de passagens",
    color: "bg-orange-500 hover:bg-orange-600",
    getLink: getKayakBrasilLink,
  },
  {
    id: "momondo",
    name: "Momondo",
    description: "Compare preços globais",
    color: "bg-pink-500 hover:bg-pink-600",
    getLink: getMomondoLink,
  },
];

export const FlightCompareModal = ({ isOpen, onClose, flight }: FlightCompareModalProps) => {
  if (!flight) return null;

  const departureDate = flight.departureAt?.split('T')[0];
  
  const context: BookingContext = {
    city: flight.destination,
    originIata: flight.originIata,
    destinationIata: flight.destinationIata,
    activityDate: departureDate,
  };

  const handleSiteClick = (site: typeof comparisonSites[0]) => {
    trackAffiliateClick({
      partnerId: site.id,
      partnerName: site.name,
      category: "flights",
      component: "FlightCompareModal",
      destination: flight.destination,
      origin: flight.origin,
    });
    
    window.open(site.getLink(context), "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Plane className="w-6 h-6 text-primary" />
            </div>
            <span className="text-lg font-medium text-muted-foreground">
              {flight.origin} → {flight.destination}
            </span>
            <span className="text-3xl font-bold text-primary">
              R$ {flight.price.toLocaleString('pt-BR')}
            </span>
            <span className="text-sm text-muted-foreground">
              Preço encontrado pela Sofia
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <p className="text-sm text-muted-foreground text-center">
            Compare e compre no site de sua preferência:
          </p>
          
          {comparisonSites.map((site, index) => (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                onClick={() => handleSiteClick(site)}
                className={`w-full justify-between h-auto py-3 px-4 ${site.color} text-white`}
                variant="default"
              >
                <div className="text-left">
                  <div className="font-semibold">{site.name}</div>
                  <div className="text-xs opacity-80">{site.description}</div>
                </div>
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Preços podem variar entre sites. Compare antes de finalizar sua compra.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
