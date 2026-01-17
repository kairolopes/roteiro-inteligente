import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Sparkles,
  Zap,
  Crown,
  MessageCircle,
  Map,
  Loader2,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserCredits } from "@/hooks/useUserCredits";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/auth/AuthModal";
import { cn } from "@/lib/utils";

interface Plan {
  id: "credits_1" | "credits_5" | "subscription_monthly" | "subscription_annual";
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

const plans: Plan[] = [
  {
    id: "credits_1",
    name: "1 Crédito",
    price: "R$ 9,90",
    description: "Perfeito para testar",
    features: [
      "1 roteiro completo",
      "Geração com IA avançada",
      "Mapa interativo",
      "Exportar para PDF",
    ],
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: "credits_5",
    name: "5 Créditos",
    price: "R$ 39,90",
    priceNote: "R$ 7,98/roteiro",
    description: "Melhor custo-benefício",
    features: [
      "5 roteiros completos",
      "20% de economia",
      "Geração com IA avançada",
      "Mapa interativo",
      "Exportar para PDF",
    ],
    popular: true,
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: "subscription_monthly",
    name: "Mensal Pro",
    price: "R$ 29,90",
    priceNote: "/mês",
    description: "Para viajantes frequentes",
    features: [
      "10 roteiros por mês",
      "50 mensagens de chat IA",
      "Prioridade na geração",
      "Suporte prioritário",
    ],
    icon: <Crown className="w-5 h-5" />,
  },
  {
    id: "subscription_annual",
    name: "Anual Pro",
    price: "R$ 249",
    priceNote: "/ano • 2 meses grátis",
    description: "Máxima economia",
    features: [
      "Roteiros ilimitados",
      "Chat IA ilimitado",
      "Prioridade máxima",
      "Suporte VIP",
      "Recursos exclusivos",
    ],
    icon: <Crown className="w-5 h-5" />,
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { credits, refetch, hasActiveSubscription } = useUserCredits();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Handle payment status from redirect
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      toast({
        title: "Pagamento realizado! 🎉",
        description: "Seus créditos foram adicionados com sucesso.",
      });
      refetch();
      // Clear URL params
      window.history.replaceState({}, "", "/pricing");
    } else if (status === "failure") {
      toast({
        variant: "destructive",
        title: "Pagamento não concluído",
        description: "Houve um problema com o pagamento. Tente novamente.",
      });
      window.history.replaceState({}, "", "/pricing");
    } else if (status === "pending") {
      toast({
        title: "Pagamento pendente",
        description: "Aguardando confirmação do pagamento.",
      });
      window.history.replaceState({}, "", "/pricing");
    }
  }, [searchParams, toast, refetch]);

  const handleSelectPlan = async (planId: Plan["id"]) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLoadingPlan(planId);

    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { type: planId },
      });

      if (error) throw error;

      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error("URL de checkout não recebida");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar pagamento",
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-muted-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <a href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Plane className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold hidden sm:inline">
                  Travel<span className="text-primary">Plan</span>
                </span>
              </a>
            </div>

            {user && credits && (
              <div className="flex items-center gap-2 text-sm">
                <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
                  {hasActiveSubscription
                    ? `Plano ${credits.subscription_type === "annual" ? "Anual" : "Mensal"}`
                    : `${credits.paid_credits} créditos`}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 lg:px-8 pt-28 pb-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-lg text-muted-foreground">
            Desbloqueie roteiros personalizados ilimitados e aproveite ao máximo
            sua experiência de viagem.
          </p>
        </motion.div>

        {/* Free tier info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="glass-card rounded-xl p-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Map className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Plano Gratuito</p>
                <p className="text-sm text-muted-foreground">
                  1 roteiro parcial + 5 mensagens de chat
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Chat limitado para experimentar
              </span>
            </div>
          </div>
        </motion.div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={cn(
                "relative rounded-2xl border overflow-hidden",
                plan.popular
                  ? "border-primary bg-gradient-to-b from-primary/5 to-transparent"
                  : "border-border bg-card"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center text-xs font-semibold py-1.5">
                  MAIS POPULAR
                </div>
              )}

              <div className={cn("p-6", plan.popular && "pt-10")}>
                {/* Icon & name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      plan.popular
                        ? "gradient-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="font-bold">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.priceNote && (
                    <span className="text-sm text-muted-foreground ml-1">
                      {plan.priceNote}
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loadingPlan !== null}
                  className={cn(
                    "w-full",
                    plan.popular
                      ? "gradient-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  )}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Selecionar"
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ or trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Pagamento seguro via Mercado Pago • Cancele a qualquer momento
          </p>
          <div className="flex items-center justify-center gap-6 opacity-60">
            <span className="text-xs">🔒 SSL Seguro</span>
            <span className="text-xs">💳 Cartão, Pix, Boleto</span>
            <span className="text-xs">📧 Suporte 24h</span>
          </div>
        </motion.div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Pricing;
