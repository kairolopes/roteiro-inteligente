import { motion } from "framer-motion";
import { Gift, CheckCircle, Sparkles } from "lucide-react";

const bonuses = [
  {
    title: "Guia: 7 Erros que Viajantes Cometem",
    value: "R$ 47",
    description: "PDF exclusivo com os erros mais comuns e como evitá-los",
  },
  {
    title: "Checklist de Viagem Completo",
    value: "R$ 27",
    description: "O que levar, documentos, apps essenciais e mais",
  },
  {
    title: "Acesso ao Chat com Sofia",
    value: "R$ 97",
    description: "Tire dúvidas em tempo real sobre seu destino",
  },
  {
    title: "Atualizações Gratuitas",
    value: "R$ 47",
    description: "Receba melhorias e novos recursos sem custo extra",
  },
];

export function Offer() {
  const totalValue = bonuses.reduce((acc, bonus) => {
    const value = parseInt(bonus.value.replace(/\D/g, ''));
    return acc + value;
  }, 0);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Gift className="h-4 w-4" />
            <span>Oferta Especial</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo isso incluído no seu acesso
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Além do roteiro personalizado, você ainda recebe bônus exclusivos
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Bonuses List */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {bonuses.map((bonus, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border/50"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">{bonus.title}</h3>
                    <span className="text-sm text-muted-foreground line-through">{bonus.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{bonus.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Value Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20"
          >
            <p className="text-lg text-muted-foreground mb-2">Valor total dos bônus:</p>
            <p className="text-3xl font-bold text-muted-foreground line-through mb-4">
              R$ {totalValue}
            </p>
            <div className="flex items-center justify-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <p className="text-xl font-semibold">Hoje: GRÁTIS com seu roteiro</p>
              <Sparkles className="h-5 w-5" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
