import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface UrgencyProps {
  onCTAClick: () => void;
}

export function Urgency({ onCTAClick }: UrgencyProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  const [spotsLeft] = useState(() => {
    // Persistir no localStorage para consistência
    const stored = localStorage.getItem('vendas_spots');
    if (stored) {
      return parseInt(stored);
    }
    const spots = Math.floor(Math.random() * 20) + 30; // 30-50
    localStorage.setItem('vendas_spots', spots.toString());
    return spots;
  });

  useEffect(() => {
    // Verificar se há um timer salvo
    const savedExpiry = localStorage.getItem('vendas_timer_expiry');
    let expiryTime: number;

    if (savedExpiry) {
      expiryTime = parseInt(savedExpiry);
    } else {
      // Criar novo timer de 24 horas
      expiryTime = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('vendas_timer_expiry', expiryTime.toString());
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = expiryTime - now;

      if (diff <= 0) {
        // Resetar timer quando expirar
        const newExpiry = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('vendas_timer_expiry', newExpiry.toString());
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-destructive/10 via-background to-destructive/10" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Warning Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-6">
            <AlertTriangle className="h-4 w-4" />
            <span>Oferta por tempo limitado</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Esta oferta expira em breve
          </h2>

          {/* Countdown */}
          <div className="flex justify-center gap-4 mb-8">
            {[
              { value: timeLeft.hours, label: "Horas" },
              { value: timeLeft.minutes, label: "Minutos" },
              { value: timeLeft.seconds, label: "Segundos" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-background rounded-xl border border-border shadow-lg flex items-center justify-center mb-2">
                  <span className="text-3xl md:text-4xl font-bold text-primary">
                    {item.value.toString().padStart(2, '0')}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Spots Left */}
          <div className="flex items-center justify-center gap-2 text-lg mb-8">
            <Users className="h-5 w-5 text-destructive" />
            <span>
              Apenas <strong className="text-destructive">{spotsLeft} vagas</strong> restantes com este preço
            </span>
          </div>

          {/* CTA */}
          <Button
            onClick={onCTAClick}
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground text-lg px-10 py-6 font-bold shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
          >
            <Clock className="mr-2 h-5 w-5" />
            Garantir Minha Vaga Agora
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
