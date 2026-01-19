import { ExternalLink, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAviasalesLink, getSkyscannerLink } from "@/lib/affiliateLinks";

interface FlightCompareButtonsProps {
  destination: string;
  origin?: string;
  date?: string;
  variant?: "default" | "compact" | "inline";
  className?: string;
}

export const FlightCompareButtons = ({
  destination,
  origin = "GYN",
  date,
  variant = "default",
  className = "",
}: FlightCompareButtonsProps) => {
  const context = {
    city: destination,
    departureCity: origin,
    checkIn: date,
  };

  const aviasalesLink = getAviasalesLink(context);
  const skyscannerLink = getSkyscannerLink(context);

  const handleClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (variant === "compact") {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs bg-orange-500/10 border-orange-500/30 text-orange-600 hover:bg-orange-500/20"
          onClick={() => handleClick(aviasalesLink)}
        >
          Aviasales
          <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs bg-cyan-500/10 border-cyan-500/30 text-cyan-600 hover:bg-cyan-500/20"
          onClick={() => handleClick(skyscannerLink)}
        >
          Skyscanner
          <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-xs text-muted-foreground">Compare em:</span>
        <button
          onClick={() => handleClick(aviasalesLink)}
          className="text-xs font-medium text-orange-500 hover:text-orange-600 hover:underline"
        >
          Aviasales
        </button>
        <span className="text-muted-foreground">•</span>
        <button
          onClick={() => handleClick(skyscannerLink)}
          className="text-xs font-medium text-cyan-500 hover:text-cyan-600 hover:underline"
        >
          Skyscanner
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p className="text-xs text-muted-foreground text-center">Compare preços em 2 sites</p>
      <div className="flex gap-2">
        <Button
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => handleClick(aviasalesLink)}
        >
          <Plane className="mr-2 h-4 w-4" />
          Aviasales
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
        <Button
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
          onClick={() => handleClick(skyscannerLink)}
        >
          <Plane className="mr-2 h-4 w-4" />
          Skyscanner
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
