import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MapPin, Calendar, Wallet, Users, Heart, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizAnswers } from "@/types/quiz";

interface QuizSummaryProps {
  answers: QuizAnswers;
  onCreateItinerary: () => void;
}

const labels: Record<string, Record<string, string>> = {
  travelStyle: {
    romantic: "Romântica",
    adventure: "Aventura",
    cultural: "Cultural",
    gastronomy: "Gastronômica",
    family: "Família",
    party: "Festas",
    photography: "Fotogênica",
    relaxing: "Relaxante",
  },
  accommodation: {
    luxury: "Luxo",
    boutique: "Boutique",
    midrange: "Confortável",
    budget: "Econômico",
    airbnb: "Apartamentos",
  },
  budget: {
    economic: "Econômico",
    moderate: "Moderado",
    comfortable: "Confortável",
    luxury: "Luxo",
    flexible: "Flexível",
  },
  duration: {
    weekend: "Fim de semana",
    week: "Uma semana",
    twoweeks: "Duas semanas",
    month: "Um mês+",
    flexible: "Flexível",
  },
  destinations: {
    italy: "Itália 🇮🇹",
    france: "França 🇫🇷",
    spain: "Espanha 🇪🇸",
    portugal: "Portugal 🇵🇹",
    greece: "Grécia 🇬🇷",
    netherlands: "Holanda 🇳🇱",
    germany: "Alemanha 🇩🇪",
    switzerland: "Suíça 🇨🇭",
    surprise: "Surpresa ✨",
  },
  travelWith: {
    solo: "Sozinho(a)",
    couple: "Casal",
    friends: "Amigos",
    "family-kids": "Família com crianças",
    "family-adults": "Família adultos",
    pets: "Com pet",
  },
};

export function QuizSummary({ answers, onCreateItinerary }: QuizSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6"
        >
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <h2 className="text-2xl lg:text-3xl font-bold mb-3">
          Tudo pronto para sua <span className="text-primary">aventura</span>!
        </h2>
        <p className="text-muted-foreground">
          Revise suas preferências antes de criar seu roteiro personalizado.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 lg:p-8 space-y-6">
        {/* Destinations */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Destinos</h4>
            <p className="text-muted-foreground">
              {answers.destinations.map((d) => labels.destinations[d]).join(", ") || "Não selecionado"}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Período</h4>
            <p className="text-muted-foreground">
              {labels.duration[answers.duration] || "Não definido"}
              {answers.startDate && (
                <> • A partir de {format(answers.startDate, "dd 'de' MMMM", { locale: ptBR })}</>
              )}
            </p>
          </div>
        </div>

        {/* Budget */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Orçamento & Hospedagem</h4>
            <p className="text-muted-foreground">
              {labels.budget[answers.budget] || "Não definido"}
              {answers.accommodation && <> • {labels.accommodation[answers.accommodation]}</>}
            </p>
          </div>
        </div>

        {/* Travel with */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Companhia</h4>
            <p className="text-muted-foreground">
              {labels.travelWith[answers.travelWith] || "Não definido"}
            </p>
          </div>
        </div>

        {/* Style & Interests */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">Estilo de Viagem</h4>
            <p className="text-muted-foreground">
              {answers.travelStyle.map((s) => labels.travelStyle[s]).join(", ") || "Não selecionado"}
            </p>
            {answers.interests.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                +{answers.interests.length} interesse{answers.interests.length !== 1 ? "s" : ""} selecionado{answers.interests.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4">
        <Button
          size="lg"
          onClick={onCreateItinerary}
          className="gradient-primary text-primary-foreground glow text-lg px-8 py-6 h-auto hover:opacity-90 transition-opacity group w-full sm:w-auto"
        >
          Criar Meu Roteiro com IA
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Nossa IA vai criar um roteiro personalizado em segundos
        </p>
      </div>
    </motion.div>
  );
}
