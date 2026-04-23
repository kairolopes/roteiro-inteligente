import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AGENTS } from "@/lib/agents";

interface Suggestion {
  title: string;
  why?: string;
  tip?: string;
  category?: string;
}

interface PietraEventsPanelProps {
  city: string;
  country?: string;
  date?: string;
}

export default function PietraEventsPanel({ city, country, date }: PietraEventsPanelProps) {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const profile = AGENTS.pietra;

  const handleAsk = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("agent-pietra", {
        body: { city, country, date },
      });
      if (error) throw error;
      setSuggestions(data?.suggestions || []);
      if (!data?.suggestions?.length) {
        toast({ title: "Pietra não achou nada novo dessa vez 🎭" });
      }
    } catch (err) {
      console.error("Pietra error:", err);
      toast({ variant: "destructive", title: "Pietra ficou offline, tente em instantes." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`rounded-xl border border-border bg-card overflow-hidden`}>
      <div className={`flex items-center justify-between gap-3 px-4 py-3 ${profile.bubbleBg}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-8 h-8 rounded-full ${profile.avatarBg} flex items-center justify-center flex-shrink-0`}>
            <span className="text-base">{profile.emoji}</span>
          </div>
          <div className="min-w-0">
            <div className={`text-sm font-semibold ${profile.accent}`}>Acontecendo em {city}</div>
            <div className="text-[11px] text-muted-foreground">Curadoria de {profile.displayName} · {profile.role}</div>
          </div>
        </div>
        <Button
          size="sm"
          variant={suggestions ? "outline" : "default"}
          onClick={handleAsk}
          disabled={isLoading}
          className="flex-shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Buscando...
            </>
          ) : suggestions ? (
            <>
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Atualizar
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Ver sugestões
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {suggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 space-y-2"
          >
            {suggestions.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-lg border border-border p-3 bg-background/50"
              >
                <div className="font-medium text-sm">{s.title}</div>
                {s.why && <div className="text-xs text-muted-foreground mt-1">{s.why}</div>}
                {s.tip && (
                  <div className="flex items-start gap-1.5 mt-2 p-2 rounded bg-yellow-500/10 text-[11px] text-yellow-700 dark:text-yellow-300">
                    <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span>{s.tip}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
