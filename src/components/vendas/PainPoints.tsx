import { motion } from "framer-motion";
import { AlertCircle, Clock, DollarSign, MapPinOff, Search, Frown } from "lucide-react";

const painPoints = [
  {
    icon: Clock,
    title: "Horas perdidas pesquisando",
    description: "Você passa dias no Google, TripAdvisor, blogs de viagem... e no final ainda não sabe por onde começar.",
  },
  {
    icon: DollarSign,
    title: "Agências cobram fortunas",
    description: "Consultores de viagem cobram R$500 a R$2.000 para criar roteiros que você poderia ter de graça.",
  },
  {
    icon: MapPinOff,
    title: "Medo de perder o melhor",
    description: "Você chega no destino e descobre que perdeu aquele restaurante incrível ou mirante secreto.",
  },
  {
    icon: Search,
    title: "Informações desatualizadas",
    description: "Blogs de 2019 com dicas que já não funcionam. Lugares fechados. Preços que mudaram.",
  },
  {
    icon: Frown,
    title: "Roteiros genéricos",
    description: "Aquele 'top 10 coisas para fazer' que todo mundo faz. Sem personalização pro seu estilo.",
  },
  {
    icon: AlertCircle,
    title: "Logística complicada",
    description: "Montar um roteiro dia-a-dia otimizado, sem perder tempo cruzando a cidade, é um pesadelo.",
  },
];

export function PainPoints() {
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
            Você já passou por isso?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Se você se identificou com alguma dessas situações, você não está sozinho.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {painPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-background rounded-xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                <point.icon className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{point.title}</h3>
              <p className="text-muted-foreground">{point.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-2xl font-semibold text-primary">
            E se existisse uma forma mais fácil?
          </p>
        </motion.div>
      </div>
    </section>
  );
}
