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
    <section className="py-12 lg:py-32 relative overflow-hidden">
      {/* Background glow - hidden on mobile */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl hidden md:block" />

      <div className="container relative mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 lg:mb-16"
        >
          <span className="inline-block px-3 py-1 lg:px-4 lg:py-1.5 rounded-full bg-primary/10 text-primary text-xs lg:text-sm font-medium mb-3 lg:mb-4">
            Por que TravelPlan AI?
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 lg:mb-6">
            Tudo que você precisa para{" "}
            <span className="text-primary">viajar melhor</span>
          </h2>
          <p className="text-muted-foreground text-sm lg:text-lg max-w-2xl mx-auto px-4">
            Inteligência artificial avançada com as melhores ferramentas de planejamento.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group"
            >
              <div className="glass-card rounded-xl lg:rounded-2xl p-4 lg:p-6 h-full hover:border-primary/30 transition-all hover:-translate-y-1">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-primary/10 flex items-center justify-center mb-3 lg:mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
                </div>
                <h3 className="text-base lg:text-lg font-semibold mb-1.5 lg:mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-xs lg:text-sm">
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
