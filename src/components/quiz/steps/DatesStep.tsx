import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { QuizOption } from "../QuizOption";
import { QuizAnswers } from "@/types/quiz";

const durations = [
  { id: "weekend", emoji: "📅", title: "Fim de semana", description: "3-4 dias" },
  { id: "week", emoji: "🗓️", title: "Uma semana", description: "7 dias" },
  { id: "twoweeks", emoji: "📆", title: "Duas semanas", description: "14 dias" },
  { id: "month", emoji: "🌍", title: "Um mês ou mais", description: "30+ dias" },
  { id: "flexible", emoji: "🤔", title: "Ainda não sei", description: "Me ajude a decidir" },
];

interface DatesStepProps {
  answers: QuizAnswers;
  onUpdate: (key: keyof QuizAnswers, value: any) => void;
}

export function DatesStep({ answers, onUpdate }: DatesStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10"
    >
      {/* Duration */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3">
            Quanto tempo de <span className="text-primary">viagem</span>?
          </h2>
          <p className="text-muted-foreground">
            Selecione a duração aproximada da sua viagem.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {durations.map((duration) => (
            <QuizOption
              key={duration.id}
              emoji={duration.emoji}
              title={duration.title}
              description={duration.description}
              selected={answers.duration === duration.id}
              onClick={() => onUpdate("duration", duration.id)}
              variant="compact"
            />
          ))}
        </div>
      </div>

      {/* Start Date */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-xl lg:text-2xl font-bold mb-2">
            Quando você quer <span className="text-primary">viajar</span>?
          </h2>
          <p className="text-muted-foreground text-sm">
            Selecione a data aproximada de partida
          </p>
        </div>

        <div className="flex justify-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full max-w-sm justify-start text-left font-normal h-14 text-base glass-card border-border",
                  !answers.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-3 h-5 w-5" />
                {answers.startDate ? (
                  format(answers.startDate, "PPP", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={answers.startDate || undefined}
                onSelect={(date) => onUpdate("startDate", date)}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </motion.div>
  );
}
