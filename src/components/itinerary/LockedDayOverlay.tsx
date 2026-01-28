import { motion } from "framer-motion";
import { Lock, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LockedDayOverlayProps {
  dayNumber: number;
  totalDays: number;
  onLogin: () => void;
  onSubscribe: () => void;
  isLoggedIn?: boolean;
}

const LockedDayOverlay = ({ 
  dayNumber, 
  totalDays, 
  onLogin, 
  onSubscribe,
  isLoggedIn = false 
}: LockedDayOverlayProps) => {
  const remainingDays = totalDays - dayNumber + 1;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl"
    >
      <div className="text-center p-4 lg:p-6 max-w-sm">
        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
        </div>
        
        <h3 className="text-lg lg:text-xl font-bold mb-2">
          Desbloqueie {remainingDays} {remainingDays === 1 ? 'dia' : 'dias'} restantes
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4">
          {isLoggedIn 
            ? "Assine para ver o roteiro completo"
            : "Faça login ou assine para ver o roteiro completo"
          }
        </p>

        {/* Benefits */}
        <div className="text-left bg-secondary/50 rounded-lg p-3 mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Acesso a todos os {totalDays} dias</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Coordenadas e mapas precisos</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
            <span>Exportar para PDF</span>
          </div>
        </div>

        <div className="space-y-2">
          {!isLoggedIn && (
            <Button 
              onClick={onLogin} 
              className="w-full gradient-primary text-primary-foreground"
            >
              <Lock className="w-4 h-4 mr-2" />
              Fazer Login Grátis
            </Button>
          )}
          <Button 
            onClick={onSubscribe} 
            variant={isLoggedIn ? "default" : "outline"} 
            className={isLoggedIn ? "w-full gradient-primary text-primary-foreground" : "w-full"}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isLoggedIn ? "Assinar Premium" : "Ver Planos Premium"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default LockedDayOverlay;
