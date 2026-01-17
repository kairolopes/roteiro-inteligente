import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Check, Crown, Zap, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "itinerary" | "chat";
  title?: string;
  description?: string;
}

export function PaywallModal({
  isOpen,
  onClose,
  type,
  title,
  description,
}: PaywallModalProps) {
  const navigate = useNavigate();

  const defaultTitle =
    type === "itinerary"
      ? "Desbloqueie Roteiros Completos"
      : "Continue Conversando com a Sofia";

  const defaultDescription =
    type === "itinerary"
      ? "Você usou seu roteiro gratuito. Adquira créditos para gerar roteiros personalizados ilimitados!"
      : "Você atingiu o limite de mensagens gratuitas. Faça upgrade para continuar planejando sua viagem!";

  const handleGoToPricing = () => {
    onClose();
    navigate("/pricing");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-lg"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 pb-8">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-background/50 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Crown className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{title || defaultTitle}</h2>
                    <p className="text-sm text-muted-foreground">
                      TravelPlan Pro
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm">
                  {description || defaultDescription}
                </p>
              </div>

              {/* Benefits */}
              <div className="p-6 space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Benefícios do upgrade
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Roteiros completos ilimitados
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Gere quantos roteiros precisar
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Chat com IA expandido
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Até 50 mensagens/mês ou ilimitado
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Prioridade na geração
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Roteiros gerados mais rapidamente
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="p-6 pt-0 space-y-3">
                <Button
                  onClick={handleGoToPricing}
                  className="w-full gradient-primary text-primary-foreground h-12 text-base font-semibold gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Ver Planos e Preços
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  A partir de R$ 9,90 • Pagamento seguro via Mercado Pago
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
