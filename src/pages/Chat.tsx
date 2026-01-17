import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Plane, ArrowLeft, Sparkles, Loader2, User, Bot, Map, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { QuizAnswers } from "@/types/quiz";
import { useAuth } from "@/hooks/useAuth";
import { useUserCredits } from "@/hooks/useUserCredits";
import { PaywallModal } from "@/components/PaywallModal";
import AuthModal from "@/components/auth/AuthModal";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-travel`;

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { canSendChatMessage, consumeChatMessage, remainingChatMessages, hasActiveSubscription } = useUserCredits();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Load quiz answers from sessionStorage
    const stored = sessionStorage.getItem("quizAnswers");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setQuizAnswers(parsed);
        // Send initial message based on quiz
        sendInitialMessage(parsed);
      } catch (e) {
        console.error("Error parsing quiz answers:", e);
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendInitialMessage = async (answers: QuizAnswers) => {
    const destLabels: Record<string, string> = {
      italy: "Itália", france: "França", spain: "Espanha",
      portugal: "Portugal", greece: "Grécia", netherlands: "Holanda",
      germany: "Alemanha", switzerland: "Suíça", surprise: "destino surpresa"
    };
    
    const destinations = answers.destinations?.map(d => destLabels[d] || d).join(", ") || "Europa";
    const initialMessage = `Olá! Acabei de responder o quiz e estou planejando uma viagem para ${destinations}. Pode me ajudar a criar um roteiro personalizado?`;
    
    await sendMessage(initialMessage, answers, true); // Pass true for isInitial
  };

  const streamChat = async (
    messagesToSend: Message[],
    answers: QuizAnswers | null,
    onDelta: (text: string) => void,
    onDone: () => void
  ) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: messagesToSend, quizAnswers: answers }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      if (resp.status === 429) {
        throw new Error(errorData.error || "Limite de requisições atingido. Aguarde um momento.");
      }
      if (resp.status === 402) {
        throw new Error(errorData.error || "Créditos insuficientes.");
      }
      throw new Error(errorData.error || "Erro ao conectar com a IA");
    }

    if (!resp.body) throw new Error("Resposta vazia");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    onDone();
  };

  const sendMessage = async (messageText: string, answers?: QuizAnswers | null, isInitial = false) => {
    if (!messageText.trim() || isLoading) return;

    // Check if user needs to login (skip for initial auto-message)
    if (!isInitial && !user) {
      setShowAuthModal(true);
      return;
    }

    // Check chat message limit (skip for initial auto-message)
    if (!isInitial && !canSendChatMessage) {
      setShowPaywall(true);
      return;
    }
    const userMessage: Message = { role: "user", content: messageText.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      await streamChat(
        newMessages,
        answers !== undefined ? answers : quizAnswers,
        updateAssistant,
        async () => {
          setIsLoading(false);
          // Consume chat message credit after successful response (skip for initial)
          if (!isInitial) {
            await consumeChatMessage();
          }
        }
      );
    } catch (error) {
      console.error("Chat error:", error);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar mensagem",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="text-muted-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <a href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Plane className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold hidden sm:inline">
                  Travel<span className="text-primary">Plan</span>
                </span>
              </a>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground hidden sm:inline">Chat com IA</span>
              </div>
              {messages.length >= 2 && (
                <Button
                  size="sm"
                  onClick={() => {
                    // Salvar conversa completa para a geração do roteiro
                    const chatHistory = messages.map(m => 
                      `${m.role === 'user' ? 'Usuário' : 'Sofia'}: ${m.content}`
                    ).join('\n\n---\n\n');
                    sessionStorage.setItem("chatSummary", chatHistory);
                    sessionStorage.removeItem("generatedItinerary");
                    navigate("/itinerary");
                  }}
                  className="gradient-primary text-primary-foreground gap-2"
                >
                  <Map className="w-4 h-4" />
                  <span className="hidden sm:inline">Criar Roteiro</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 pt-24 pb-32 overflow-y-auto">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[50vh] text-center"
            >
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6">
                <Bot className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-3">
                Olá! Sou a Sofia 👋
              </h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Sua assistente de viagens com IA. Vou te ajudar a criar o 
                roteiro perfeito para sua aventura pela Europa!
              </p>
              {!quizAnswers && (
                <Button onClick={() => navigate("/quiz")} className="gradient-primary text-primary-foreground">
                  Fazer o Quiz de Preferências
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-6 py-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "glass-card"
                      )}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      
                      {/* Show itinerary button after substantial AI response */}
                      {message.role === "assistant" && 
                       message.content.length > 500 && 
                       index === messages.length - 1 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="mt-4 pt-3 border-t border-border/50"
                        >
                          <Button
                            onClick={() => {
                              // Salvar conversa completa para a geração do roteiro
                              const chatHistory = messages.map(m => 
                                `${m.role === 'user' ? 'Usuário' : 'Sofia'}: ${m.content}`
                              ).join('\n\n---\n\n');
                              sessionStorage.setItem("chatSummary", chatHistory);
                              sessionStorage.removeItem("generatedItinerary");
                              navigate("/itinerary");
                            }}
                            className="w-full gradient-primary text-primary-foreground gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Gerar Roteiro Visual Completo
                          </Button>
                        </motion.div>
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="glass-card rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input */}
      <footer className="fixed bottom-0 left-0 right-0 glass border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 py-4 max-w-3xl">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre destinos, dicas, roteiros..."
              className="min-h-[52px] max-h-32 resize-none bg-secondary border-border"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="gradient-primary text-primary-foreground h-[52px] w-[52px] flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              Sofia pode cometer erros. Verifique informações importantes.
            </p>
            {user && !hasActiveSubscription && (
              <p className="text-xs text-muted-foreground">
                {remainingChatMessages === Infinity
                  ? "∞ mensagens"
                  : `${remainingChatMessages} mensagens restantes`}
              </p>
            )}
          </div>
        </div>
      </footer>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        type="chat"
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Chat;
