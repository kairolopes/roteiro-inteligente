import { motion } from "framer-motion";
import {
  Brain,
  Plane,
  Hotel,
  Map,
  CreditCard,
  Shield,
  Smartphone,
  Globe,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "IA Conversacional",
    description:
      "Converse naturalmente com nossa IA. Ela entende seus desejos e cria roteiros sob medida.",
  },
  {
    icon: Plane,
    title: "Comparação de Voos",
    description:
      "Busca em tempo real nas principais companhias aéreas. Encontre as melhores tarifas.",
  },
  {
    icon: Hotel,
    title: "Hotéis Selecionados",
    description:
      "De boutiques charmosos a resorts luxuosos. Opções para todos os estilos e orçamentos.",
  },
  {
    icon: Map,
    title: "Roteiro Interativo",
    description:
      "Visualize sua viagem em um mapa dinâmico. Reorganize, adicione e personalize cada dia.",
  },
  {
    icon: CreditCard,
    title: "Preços Transparentes",
    description:
      "Veja o custo total estimado. Sem surpresas, sem taxas escondidas.",
  },
  {
    icon: Shield,
    title: "Reserva Segura",
    description:
      "Parceiros confiáveis e pagamento protegido. Sua tranquilidade é nossa prioridade.",
  },
  {
    icon: Smartphone,
    title: "Acesso Offline",
    description:
      "Baixe seu roteiro completo em PDF. Acesse mapas e informações sem internet.",
  },
  {
    icon: Globe,
    title: "Dicas Locais",
    description:
      "Segredos de cada destino. Restaurantes, experiências e lugares que turistas não conhecem.",
  },
  {
    icon: Clock,
    title: "Tempo Otimizado",
    description:
      "IA calcula deslocamentos e sugere a melhor ordem. Aproveite cada minuto da viagem.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Por que TravelPlan AI?
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Tudo que você precisa para{" "}
            <span className="text-primary">viajar melhor</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Uma plataforma completa que combina inteligência artificial avançada 
            com as melhores ferramentas de planejamento de viagem.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group"
            >
              <div className="glass-card rounded-2xl p-6 h-full hover:border-primary/30 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
