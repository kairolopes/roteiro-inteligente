import { motion } from "framer-motion";
import { Clock, Sparkles, MapPin, Wallet, Heart, Shield } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Economize Tempo",
    description: "De horas de pesquisa para minutos. Sofia faz em 2 minutos o que levaria dias.",
    highlight: "2 minutos",
  },
  {
    icon: Sparkles,
    title: "100% Personalizado",
    description: "Roteiros criados para o SEU estilo de viagem, não roteiros genéricos de blog.",
    highlight: "Único",
  },
  {
    icon: MapPin,
    title: "Lugares Secretos",
    description: "Descubra restaurantes, mirantes e experiências que só locais conhecem.",
    highlight: "Exclusivo",
  },
  {
    icon: Wallet,
    title: "Economize Dinheiro",
    description: "Roteiros otimizados por localização = menos transporte, mais experiências.",
    highlight: "Até 40%",
  },
  {
    icon: Heart,
    title: "Viaje Sem Stress",
    description: "Tudo organizado dia a dia, hora a hora. Só aproveitar.",
    highlight: "Relaxe",
  },
  {
    icon: Shield,
    title: "Informações Atualizadas",
    description: "Nossa IA usa dados recentes, não posts de blog desatualizados.",
    highlight: "2024",
  },
];

export function Benefits() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Por que viajantes amam a Sofia?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Mais de 18.000 roteiros criados. Veja o que faz a diferença.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-background rounded-xl p-6 border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {benefit.highlight}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
