import { ExternalLink, Plane, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAviasalesLink, getWayAwayLink } from "@/lib/affiliateLinks";

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
  const wayawayLink = getWayAwayLink(context);

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
          className="flex-1 text-xs bg-amber-500/10 border-amber-500/30 text-amber-600 hover:bg-amber-500/20"
          onClick={() => handleClick(wayawayLink)}
        >
          <Sparkles className="mr-1 h-3 w-3" />
          Cashback
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
          onClick={() => handleClick(wayawayLink)}
          className="text-xs font-medium text-amber-500 hover:text-amber-600 hover:underline flex items-center gap-1"
        >
          <Sparkles className="h-3 w-3" />
          WayAway
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p className="text-xs text-muted-foreground text-center">Compare preços + ganhe cashback</p>
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
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
          onClick={() => handleClick(wayawayLink)}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Cashback
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
