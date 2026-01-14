import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Map, Download } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageCircle,
    title: "Conte seus sonhos",
    description:
      "Responda algumas perguntas sobre seu estilo de viagem, interesses e orçamento. Nossa IA aprende suas preferências.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "IA cria seu roteiro",
    description:
      "Nossa inteligência artificial analisa milhares de opções e cria um roteiro personalizado perfeito para você.",
  },
  {
    number: "03",
    icon: Map,
    title: "Explore e ajuste",
    description:
      "Visualize seu roteiro em um mapa interativo. Converse com a IA para fazer ajustes até ficar perfeito.",
  },
  {
    number: "04",
    icon: Download,
    title: "Reserve e viaje",
    description:
      "Compare preços de voos e hotéis, faça suas reservas e exporte seu roteiro completo para usar offline.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-20 lg:py-32 relative">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Como Funciona
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Sua viagem perfeita em{" "}
            <span className="text-primary">4 passos simples</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            De um sonho a um roteiro completo. Nossa IA faz o trabalho pesado enquanto
            você foca no que importa: se animar com sua próxima aventura.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}

              <div className="glass-card rounded-2xl p-6 lg:p-8 h-full hover:border-primary/30 transition-colors">
                {/* Number badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl font-bold text-primary/20">
                    {step.number}
                  </span>
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center group-hover:glow-sm transition-all">
                    <step.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
