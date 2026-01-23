import { motion } from "framer-motion";
import { Sparkles, MessageSquare, Map, Download } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Responda um quiz rápido",
    description: "Em 30 segundos, conte para Sofia suas preferências: datas, orçamento, estilo de viagem e interesses.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Sofia cria seu roteiro",
    description: "Nossa IA analisa milhares de opções e cria um roteiro personalizado, otimizado por localização e horário.",
  },
  {
    number: "03",
    icon: Map,
    title: "Explore no mapa interativo",
    description: "Veja todos os pontos no mapa, ajuste o que quiser, e tenha tudo organizado dia a dia.",
  },
  {
    number: "04",
    icon: Download,
    title: "Baixe e viaje",
    description: "Exporte seu roteiro em PDF ou acesse offline. Tudo pronto para sua viagem perfeita.",
  },
];

export function Solution() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Conheça a Sofia</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sua Assistente de Viagem com IA
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sofia combina inteligência artificial com dados reais de milhares de viajantes
            para criar roteiros que você vai amar.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start gap-6 mb-8 last:mb-0"
            >
              {/* Step Number */}
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                {step.number}
              </div>

              {/* Content */}
              <div className="flex-grow pt-2">
                <div className="flex items-center gap-3 mb-2">
                  <step.icon className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                </div>
                <p className="text-muted-foreground text-lg">{step.description}</p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 w-0.5 h-8 bg-gradient-to-b from-primary/50 to-transparent hidden md:block" style={{ top: `${(index + 1) * 120}px` }} />
              )}
            </motion.div>
          ))}
        </div>

        {/* Sofia Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-4 bg-background rounded-2xl p-6 border border-border/50 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-2xl font-bold">
              S
            </div>
            <div className="text-left">
              <p className="font-semibold text-lg">Sofia</p>
              <p className="text-muted-foreground">Sua assistente de viagem IA</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
