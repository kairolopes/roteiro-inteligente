import { motion } from "framer-motion";
import { Star, Quote, MapPin, Calendar, Users } from "lucide-react";

const stats = [
  { icon: MapPin, value: "18.000+", label: "Roteiros criados" },
  { icon: Users, value: "12.500+", label: "Viajantes felizes" },
  { icon: Calendar, value: "127+", label: "Destinos" },
  { icon: Star, value: "4.9/5", label: "Avaliação média" },
];

const testimonials = [
  {
    name: "Carla Mendes",
    location: "São Paulo, SP",
    destination: "Portugal",
    avatar: "CM",
    rating: 5,
    text: "Incrível! Economizei pelo menos 10 horas de pesquisa. O roteiro de Lisboa e Porto ficou perfeito, com restaurantes que eu nunca acharia sozinha.",
  },
  {
    name: "Ricardo Oliveira",
    location: "Rio de Janeiro, RJ",
    destination: "Itália",
    avatar: "RO",
    rating: 5,
    text: "Minha esposa e eu ficamos impressionados. A Sofia entendeu exatamente nosso estilo e criou um roteiro romântico incrível para nossa lua de mel.",
  },
  {
    name: "Juliana Santos",
    location: "Belo Horizonte, MG",
    destination: "Nordeste",
    avatar: "JS",
    rating: 5,
    text: "Melhor R$10 que já gastei! O roteiro pelo Nordeste ficou perfeito para viagem com crianças. Cada sugestão foi certeira.",
  },
  {
    name: "Fernando Costa",
    location: "Curitiba, PR",
    destination: "Argentina",
    avatar: "FC",
    rating: 5,
    text: "Como mochileiro experiente, fiquei surpreso com as dicas. A Sofia recomendou lugares que nem eu conhecia depois de 3 viagens a Buenos Aires.",
  },
];

export function SocialProof() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O que nossos viajantes dizem
          </h2>
          <p className="text-xl text-muted-foreground">
            Histórias reais de quem já viajou com a Sofia
          </p>
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-background rounded-xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <Quote className="h-8 w-8 text-primary/30 mb-4" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground mb-6 italic">"{testimonial.text}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.location} • Viajou para {testimonial.destination}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
