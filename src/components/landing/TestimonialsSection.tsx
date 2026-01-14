import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Marina Costa",
    role: "Viajou para Itália",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Incrível! A IA entendeu exatamente o que eu queria. Meu roteiro de 2 semanas pela Itália foi perfeito, com lugares que eu nunca teria descoberto sozinha.",
  },
  {
    id: 2,
    name: "Pedro Henrique",
    role: "Viajou para Espanha e Portugal",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Planejei minha lua de mel em menos de 1 hora. O comparador de hotéis me economizou muito dinheiro e as dicas de restaurantes foram certeiras.",
  },
  {
    id: 3,
    name: "Julia Fernandes",
    role: "Viajou para Grécia",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Conversei com a IA como se fosse uma amiga que conhece tudo sobre viagens. Me ajudou a decidir entre as ilhas gregas de forma super personalizada.",
  },
  {
    id: 4,
    name: "Ricardo Almeida",
    role: "Viajou com a família",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Viajar com crianças exige planejamento extra. A plataforma sugeriu hotéis family-friendly e atividades para os pequenos. Viagem sem estresse!",
  },
  {
    id: 5,
    name: "Ana Beatriz",
    role: "Mochileira na França",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Para quem viaja com orçamento limitado, essa ferramenta é essencial. Encontrei voos baratos e hostels bem avaliados que cabiam no meu bolso.",
  },
  {
    id: 6,
    name: "Felipe Santos",
    role: "Viagem gastronômica",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Falei que amo vinhos e gastronomia. A IA montou um roteiro focado em experiências culinárias pela Toscana e Provença. Simplesmente perfeito!",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
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
            Depoimentos
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            O que nossos <span className="text-primary">viajantes</span> dizem
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Milhares de viajantes já realizaram seus sonhos com nossa plataforma. 
            Veja o que eles têm a dizer.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="glass-card rounded-2xl p-6 h-full hover:border-primary/30 transition-colors">
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-primary/20 mb-4" />

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-gold fill-gold"
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
