import { motion } from "framer-motion";
import { CheckCircle, Sparkles, Map, FileText } from "lucide-react";
import { SofiaDemo } from "./SofiaDemo";

const features = [
  {
    title: "Quiz Inteligente",
    description: "Responda perguntas rápidas sobre suas preferências",
    icon: Sparkles,
  },
  {
    title: "Mapa Interativo",
    description: "Visualize todos os pontos do roteiro no mapa",
    icon: Map,
  },
  {
    title: "PDF Completo",
    description: "Baixe seu roteiro para acessar offline",
    icon: FileText,
  },
];

export function Demonstration() {
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
            Veja como funciona na prática
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uma experiência simples e intuitiva do início ao fim
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Interactive Demo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <SofiaDemo />
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}

              {/* Additional Points */}
              <div className="pt-4 space-y-3">
                {[
                  "Roteiros com horários otimizados",
                  "Sugestões de restaurantes e cafés",
                  "Dicas de transporte e economia",
                  "Links diretos para reservas",
                ].map((point, index) => (
                  <div key={index} className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
