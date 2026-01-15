import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "150+", label: "Destinos" },
  { value: "50k+", label: "Viajantes" },
  { value: "10k+", label: "Roteiros Criados" },
  { value: "4.9", label: "Avaliação" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-radial" />
      
      {/* Floating elements - hidden on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        <motion.div
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-[10%] w-64 h-64 rounded-full bg-primary/5 blur-3xl"
        />
        <motion.div
          animate={{ y: [20, -20, 20] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-[10%] w-96 h-96 rounded-full bg-accent/5 blur-3xl"
        />
      </div>

      <div className="container relative mx-auto px-4 lg:px-8 py-8 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full glass-card mb-6 lg:mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary" />
            <span className="text-xs lg:text-sm font-medium text-muted-foreground">
              Powered by AI
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4 lg:mb-6"
          >
            Planeje sua viagem dos{" "}
            <span className="text-gradient">sonhos</span> com{" "}
            <span className="text-primary">IA</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 lg:mb-10 px-4"
          >
            Roteiros personalizados, comparação de voos e hotéis, e dicas exclusivas.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-8 lg:mb-12 px-4"
          >
            <Button
              asChild
              size="lg"
              className="gradient-primary text-primary-foreground glow text-base lg:text-lg px-6 lg:px-8 py-5 lg:py-6 h-auto hover:opacity-90 transition-opacity group touch-active w-full sm:w-auto"
            >
              <Link to="/quiz">
                Começar a Planejar
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base lg:text-lg px-6 lg:px-8 py-5 lg:py-6 h-auto border-border hover:bg-secondary touch-active w-full sm:w-auto"
            >
              Ver Destinos
            </Button>
          </motion.div>

          {/* Quick actions - show 4 on mobile, 5 on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2 lg:gap-3 mb-10 lg:mb-16 px-2"
          >
            {[
              { icon: MapPin, text: "Roma" },
              { icon: MapPin, text: "Paris" },
              { icon: MapPin, text: "Barcelona" },
              { icon: MapPin, text: "Lisboa" },
              { icon: MapPin, text: "Santorini" },
            ].slice(0, 4).map((item) => (
              <button
                key={item.text}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full glass-card text-xs lg:text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors touch-active"
              >
                <item.icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                {item.text}
              </button>
            ))}
            <button className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
              <MapPin className="w-4 h-4" />
              Santorini
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-12"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl lg:text-4xl font-bold text-primary mb-0.5 lg:mb-1">
                  {stat.value}
                </div>
                <div className="text-xs lg:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator - hidden on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
        >
          <div className="w-1.5 h-3 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
}
