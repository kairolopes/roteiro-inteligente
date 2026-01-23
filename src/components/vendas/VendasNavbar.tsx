import { Plane } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VendasNavbarProps {
  onCTAClick: () => void;
}

export function VendasNavbar({ onCTAClick }: VendasNavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <Plane className="h-6 w-6" />
          <span>Viaje com Sofia</span>
        </a>

        {/* CTA Button */}
        <Button 
          onClick={onCTAClick}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Quero Meu Roteiro
        </Button>
      </div>
    </nav>
  );
}
