import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const messages = [
  { role: "user", text: "Quero conhecer Paris em 5 dias 🇫🇷" },
  { role: "assistant", text: "Perfeito! Vou criar um roteiro romântico para vocês..." },
  { role: "assistant", text: "✨ Incluindo Torre Eiffel, Louvre e Montmartre!" },
];

function TypewriterText({ text, delay }: { text: string; delay: number }) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= text.length) {
          setDisplayedText(text.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);
  
  return <>{displayedText}</>;
}

export function ChatScene() {
  const [showTyping, setShowTyping] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowTyping(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Chat header */}
      <div className="flex items-center gap-3 pb-3 border-b border-border/50 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">Sofia</p>
          <p className="text-xs text-muted-foreground">Sua assistente de viagem</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-hidden">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 1.2, duration: 0.3 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`
                max-w-[85%] px-3 py-2 rounded-2xl text-sm
                ${msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-br-sm" 
                  : "bg-muted text-foreground rounded-bl-sm"
                }
              `}
            >
              {msg.role === "assistant" ? (
                <TypewriterText text={msg.text} delay={i * 1200 + 300} />
              ) : (
                msg.text
              )}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {showTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <div className="flex gap-1 px-3 py-2 bg-muted rounded-2xl rounded-bl-sm">
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                className="w-2 h-2 rounded-full bg-muted-foreground"
              />
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                className="w-2 h-2 rounded-full bg-muted-foreground"
              />
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                className="w-2 h-2 rounded-full bg-muted-foreground"
              />
            </div>
            <span className="text-xs">Sofia está gerando seu roteiro...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
