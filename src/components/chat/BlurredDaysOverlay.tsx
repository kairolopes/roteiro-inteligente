import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlurredDaysOverlayProps {
  totalDays: number;
  freeDays: number;
  onLogin: () => void;
  onSubscribe: () => void;
  isLoggedIn?: boolean;
}

const BlurredDaysOverlay = ({
  totalDays,
  freeDays,
  onLogin,
  onSubscribe,
  isLoggedIn = false,
}: BlurredDaysOverlayProps) => {
  const lockedDays = totalDays - freeDays;

  if (lockedDays <= 0) return null;

  return (
    <div className="relative mt-4">
      {/* Gradient fade effect */}
      <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent z-10" />
      
      {/* Blurred content placeholder */}
      <div className="relative">
        <div className="filter blur-[6px] select-none pointer-events-none text-muted-foreground text-sm space-y-2 py-4">
          <p>📍 **Dia {freeDays + 1}**: Continuação da viagem com visitas a pontos turísticos incríveis...</p>
          <p>📍 **Dia {freeDays + 2}**: Explorando novos destinos e experiências culturais...</p>
          {totalDays > freeDays + 2 && (
            <p>📍 **Dias {freeDays + 3}-{totalDays}**: Mais aventuras e descobertas aguardam...</p>
          )}
        </div>

        {/* CTA Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl">
          <div className="text-center p-4 max-w-xs">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-bold text-sm mb-1">
              +{lockedDays} dias bloqueados
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              {isLoggedIn
                ? "Assine para ver o roteiro completo"
                : "Faça login ou assine para desbloquear"}
            </p>
            <div className="flex flex-col gap-2">
              {!isLoggedIn && (
                <Button size="sm" onClick={onLogin} className="w-full gradient-primary text-primary-foreground">
                  <Lock className="w-3 h-3 mr-1" />
                  Login Grátis
                </Button>
              )}
              <Button
                size="sm"
                variant={isLoggedIn ? "default" : "outline"}
                onClick={onSubscribe}
                className={isLoggedIn ? "w-full gradient-primary text-primary-foreground" : "w-full"}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {isLoggedIn ? "Assinar" : "Ver Planos"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlurredDaysOverlay;
