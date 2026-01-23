import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, ArrowRight } from "lucide-react";

interface FinalCTAProps {
  onCTAClick: () => void;
}

const finalBenefits = [
  "Roteiro 100% personalizado em 2 minutos",
  "Mapa interativo com todos os pontos",
  "Sugestões de restaurantes e experiências",
  "Export PDF para acessar offline",
  "Chat com Sofia para tirar dúvidas",
  "Garantia de 7 dias",
];

export function FinalCTA({ onCTAClick }: FinalCTAProps) {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-background" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-background/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-border/50 shadow-2xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Última chance</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para sua viagem perfeita?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se a mais de 12.500 viajantes que já descobriram a forma mais fácil de planejar viagens
            </p>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-10">
              {finalBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <Button
              onClick={onCTAClick}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground text-xl px-12 py-8 font-bold shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105 group"
            >
              <Sparkles className="mr-2 h-6 w-6" />
              Criar Meu Roteiro Agora
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="mt-6 text-sm text-muted-foreground">
              Acesso imediato • Pagamento 100% seguro • Garantia de 7 dias
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
