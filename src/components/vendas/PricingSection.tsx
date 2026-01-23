import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Star, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Plan {
  id: "credit_1" | "credit_5" | "monthly" | "yearly";
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  credits?: number;
  features: string[];
  popular?: boolean;
  icon: typeof Star;
}

const plans: Plan[] = [
  {
    id: "credit_1",
    name: "1 Roteiro",
    price: 9.90,
    description: "Perfeito para testar",
    credits: 1,
    features: [
      "1 roteiro personalizado",
      "Mapa interativo",
      "Export PDF",
      "Suporte por email",
    ],
    icon: Star,
  },
  {
    id: "credit_5",
    name: "5 Roteiros",
    price: 39.90,
    originalPrice: 49.50,
    description: "Mais popular",
    credits: 5,
    features: [
      "5 roteiros personalizados",
      "Mapa interativo",
      "Export PDF",
      "Chat com Sofia",
      "Suporte prioritário",
    ],
    popular: true,
    icon: Sparkles,
  },
  {
    id: "monthly",
    name: "Pro Mensal",
    price: 29.90,
    description: "Roteiros ilimitados",
    features: [
      "Roteiros ilimitados",
      "Chat ilimitado com Sofia",
      "Acesso a novos recursos",
      "Suporte VIP",
      "Cancele quando quiser",
    ],
    icon: Zap,
  },
];

interface PricingSectionProps {
  onAuthRequired: () => void;
}

export function PricingSection({ onAuthRequired }: PricingSectionProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    setLoadingPlan(plan.id);

    try {
      // Usar a Edge Function de pagamento
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          planId: plan.id,
          userId: user.id,
          userEmail: user.email,
          returnUrl: `${window.location.origin}/vendas?status=`,
        },
      });

      if (error) throw error;

      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('URL de pagamento não recebida');
      }
    } catch (error: any) {
      console.error('Erro ao criar pagamento:', error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha seu plano
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Consultores de viagem cobram de{" "}
            <span className="line-through text-destructive">R$ 500 a R$ 2.000</span>
            {" "}por roteiro
          </p>
          <p className="text-lg text-primary font-medium">
            Com Sofia, você paga uma fração do preço
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-background rounded-2xl p-6 border ${
                plan.popular
                  ? "border-primary shadow-xl shadow-primary/10 scale-105"
                  : "border-border/50 shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                  Mais Popular
                </div>
              )}

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <plan.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                
                <div className="flex items-baseline justify-center gap-1">
                  {plan.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      R$ {plan.originalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                  <span className="text-4xl font-bold">
                    R$ {plan.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                {plan.credits && (
                  <p className="text-sm text-muted-foreground mt-1">
                    R$ {(plan.price / plan.credits).toFixed(2).replace('.', ',')} por roteiro
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan)}
                disabled={loadingPlan !== null}
                className={`w-full ${
                  plan.popular
                    ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    : ""
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                {loadingPlan === plan.id ? "Processando..." : "Escolher Plano"}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span>Pagamento seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span>Acesso imediato</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span>Garantia de 7 dias</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
