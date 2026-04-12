import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Itinerary as ItineraryType } from "@/types/itinerary";

interface AdjustmentMessage {
  role: "user" | "assistant";
  content: string;
}

interface ItineraryAdjustChatProps {
  itinerary: ItineraryType;
  onItineraryUpdated: (updated: ItineraryType) => void;
}

export default function ItineraryAdjustChat({ itinerary, onItineraryUpdated }: ItineraryAdjustChatProps) {
  const [messages, setMessages] = useState<AdjustmentMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("adjust-itinerary", {
        body: { itinerary, userRequest: userMsg },
      });

      if (error) throw error;

      if (data?.itinerary) {
        onItineraryUpdated(data.itinerary);
        sessionStorage.setItem("generatedItinerary", JSON.stringify(data.itinerary));
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "✅ Roteiro atualizado! As alterações já estão visíveis acima. Quer ajustar mais alguma coisa?" },
        ]);
        toast({ title: "Roteiro atualizado! ✏️" });
      } else {
        throw new Error("Resposta inválida");
      }
    } catch (err) {
      console.error("Adjust error:", err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Desculpe, não consegui processar essa alteração. Tente descrever de outra forma." },
      ]);
      toast({ variant: "destructive", title: "Erro ao ajustar roteiro" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/50 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm">Ajustar Roteiro com Sofia</span>
      </div>

      {/* Messages */}
      <div className="max-h-[300px] overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-4">
            <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Peça alterações ao seu roteiro aqui.</p>
            <p className="text-xs mt-1">Ex: "Adicione um restaurante japonês no dia 3" ou "Troque o hotel do dia 2"</p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}>
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-2 items-center text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Sofia está ajustando o roteiro...</span>
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
          placeholder="Descreva a alteração desejada..."
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
