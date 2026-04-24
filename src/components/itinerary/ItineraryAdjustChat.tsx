import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Itinerary as ItineraryType } from "@/types/itinerary";
import { AGENTS, AgentName } from "@/lib/agents";

interface AdjustmentMessage {
  role: "user" | "agent";
  agent?: AgentName;
  content: string;
}

interface ItineraryAdjustChatProps {
  itinerary: ItineraryType;
  onItineraryUpdated: (updated: ItineraryType) => void;
}

function summarizeItinerary(it: ItineraryType) {
  return {
    title: it.title,
    destinations: it.destinations,
    duration: it.duration,
    days: it.days?.map(d => ({
      day: d.day,
      city: d.city,
      country: d.country,
      activities: d.activities?.length || 0,
    })),
  };
}

export default function ItineraryAdjustChat({ itinerary, onItineraryUpdated }: ItineraryAdjustChatProps) {
  const [messages, setMessages] = useState<AdjustmentMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentName>("sofia");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const itineraryId = (itinerary as any).id;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const pushAgent = (agent: AgentName, content: string) => {
    setMessages(prev => [...prev, { role: "agent", agent, content }]);
  };

  const callAgent = async (
    agent: Exclude<AgentName, "sofia">,
    args: any,
  ): Promise<void> => {
    setActiveAgent(agent);
    pushAgent(agent, `${AGENTS[agent].emoji} ${AGENTS[agent].displayName} entrou na conversa...`);

    try {
      if (agent === "pietra") {
        const { data, error } = await supabase.functions.invoke("agent-pietra", { body: { ...args, itineraryId, userId: user?.id } });
        if (error) throw error;
        const list = (data?.suggestions || []) as any[];
        if (!list.length) {
          pushAgent("pietra", "Nada de muito especial rolando nessa data — quer que eu olhe outra cidade?");
        } else {
          const text = list.map(s => `• *${s.title}*${s.why ? ` — ${s.why}` : ""}${s.tip ? `\n   💡 ${s.tip}` : ""}`).join("\n");
          pushAgent("pietra", `Achei isso pra você:\n\n${text}`);
        }
      } else if (agent === "lia") {
        const dayNum: number | undefined = args.day_number;
        const day = itinerary.days.find(d => d.day === dayNum) || itinerary.days[0];
        const { data, error } = await supabase.functions.invoke("agent-lia", {
          body: { activities: day.activities, city: day.city, itineraryId, userId: user?.id },
        });
        if (error) throw error;
        const rewritten = (data?.rewritten || []) as any[];
        if (rewritten.length) {
          const updated: ItineraryType = {
            ...itinerary,
            days: itinerary.days.map(d =>
              d.day !== day.day ? d : {
                ...d,
                activities: d.activities.map(a => {
                  const r = rewritten.find(x => x.id === a.id);
                  return r ? { ...a, description: r.description } : a;
                }),
              },
            ),
          };
          onItineraryUpdated(updated);
          sessionStorage.setItem("generatedItinerary", JSON.stringify(updated));
          pushAgent("lia", `Reescrevi ${rewritten.length} descrições do Dia ${day.day} no tom de quem mora aqui. ✨`);
        } else {
          pushAgent("lia", "Não consegui melhorar dessa vez — me dá mais contexto?");
        }
      } else if (agent === "bruno") {
        const dayNum: number | undefined = args.day_number;
        const day = itinerary.days.find(d => d.day === dayNum) || itinerary.days[0];
        const { data, error } = await supabase.functions.invoke("agent-bruno", {
          body: { activities: day.activities, itineraryId, userId: user?.id, dayNumber: day.day },
        });
        if (error) throw error;
        const order: string[] = data?.optimized_order || [];
        const explanation = data?.explanation || "Reorganizei o dia.";
        const saved = data?.saved_minutes || 0;

        if (order.length === day.activities.length) {
          const reordered = order
            .map(id => day.activities.find(a => a.id === id))
            .filter(Boolean) as any[];
          const updated: ItineraryType = {
            ...itinerary,
            days: itinerary.days.map(d => d.day !== day.day ? d : { ...d, activities: reordered }),
          };
          onItineraryUpdated(updated);
          sessionStorage.setItem("generatedItinerary", JSON.stringify(updated));
        }
        pushAgent("bruno", `${explanation}${saved ? `\n\n⏱ Economia estimada: ~${saved}min` : ""}`);
      }
    } catch (err) {
      console.error(`${agent} error:`, err);
      pushAgent(agent, `Tive um problema técnico, tenta de novo daqui a pouco.`);
    } finally {
      setActiveAgent("sofia");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      // 1) Sofia decide o que fazer
      const history = messages.slice(-8).map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke("agent-sofia", {
        body: {
          userMessage: userMsg,
          itinerarySummary: summarizeItinerary(itinerary),
          history,
          itineraryId,
          userId: user?.id,
        },
      });

      if (error) throw error;

      if (data?.text) {
        pushAgent("sofia", data.text);
      }

      const action = data?.action;
      if (action?.name === "call_pietra") {
        await callAgent("pietra", {
          city: action.args.city,
          country: action.args.country,
          date: action.args.date,
        });
      } else if (action?.name === "call_lia") {
        await callAgent("lia", { day_number: itinerary.days[0]?.day ?? 1 });
      } else if (action?.name === "call_bruno") {
        await callAgent("bruno", { day_number: action.args.day_number });
      } else if (action?.name === "edit_itinerary") {
        // Edição direta — usa a edge function legacy adjust-itinerary
        const { data: adj, error: adjErr } = await supabase.functions.invoke("adjust-itinerary", {
          body: { itinerary, userRequest: action.args.instruction || userMsg },
        });
        if (adjErr) throw adjErr;
        if (adj?.itinerary) {
          onItineraryUpdated(adj.itinerary);
          sessionStorage.setItem("generatedItinerary", JSON.stringify(adj.itinerary));
          pushAgent("sofia", "Pronto, ajustei o roteiro acima. 👆");
          toast({ title: "Roteiro atualizado ✏️" });
        }
      } else if (!data?.text) {
        pushAgent("sofia", "Posso te ajudar a ajustar esse roteiro, sugerir eventos, otimizar deslocamento ou dar dicas de quem mora aí. O que você quer?");
      }
    } catch (err) {
      console.error("Sofia error:", err);
      pushAgent("sofia", "Desculpa, deu um problema agora. Tenta de novo?");
      toast({ variant: "destructive", title: "Erro ao falar com os agentes" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      {/* Header com time */}
      <div className="px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-sm">Time Sofia</div>
            <div className="text-[11px] text-muted-foreground">4 agentes prontos pra ajustar seu roteiro</div>
          </div>
          <div className="flex -space-x-1.5">
            {(Object.keys(AGENTS) as AgentName[]).map(name => {
              const a = AGENTS[name];
              return (
                <div
                  key={name}
                  title={`${a.displayName} · ${a.role}`}
                  className={`w-7 h-7 rounded-full ${a.avatarBg} ring-2 ring-card flex items-center justify-center text-xs ${
                    activeAgent === name ? "ring-primary" : ""
                  }`}
                >
                  {a.emoji}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="max-h-[360px] overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-4 space-y-1">
            <div className="text-2xl">{AGENTS.sofia.emoji}</div>
            <p className="font-medium">Oi! Sou a Sofia.</p>
            <p className="text-xs">Posso chamar a Pietra (eventos), a Lia (dicas locais) ou o Bruno (logística). Me conta o que quer ajustar.</p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, i) => {
            const profile = msg.agent ? AGENTS[msg.agent] : null;
            const isUser = msg.role === "user";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && profile && (
                  <div className={`w-8 h-8 rounded-full ${profile.avatarBg} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-base">{profile.emoji}</span>
                  </div>
                )}
                <div className="max-w-[80%]">
                  {!isUser && profile && (
                    <div className={`text-[11px] font-semibold mb-0.5 ${profile.accent}`}>
                      {profile.displayName} <span className="text-muted-foreground font-normal">· {profile.role}</span>
                    </div>
                  )}
                  <div className={`rounded-lg px-3 py-2 text-sm whitespace-pre-line ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : profile?.bubbleBg || "bg-muted"
                  }`}>
                    {msg.content}
                  </div>
                </div>
                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-2 items-center text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{AGENTS[activeAgent].displayName} está pensando...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder='Ex: "Tem algum festival em Lisboa nessas datas?" ou "Reorganiza o dia 2"'
          className="min-h-[40px] max-h-[80px] resize-none text-sm"
          disabled={isLoading}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
