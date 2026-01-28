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
import { getChatUrl, getAuthHeaders } from "@/lib/apiRouting";
import ChatMessageContent from "@/components/chat/ChatMessageContent";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Free messages for guests (without login)
const FREE_GUEST_MESSAGES = 3;
// Free days to show in pre-itinerary (same as itinerary page)
const FREE_DAYS_GUEST = 2;
const FREE_DAYS_LOGGED_IN = 3;

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
  const [rateLimitError, setRateLimitError] = useState(false);
  const [guestMessagesUsed, setGuestMessagesUsed] = useState(0);
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
      brazil: "Brasil", argentina: "Argentina", peru: "Peru",
      usa: "Estados Unidos", mexico: "México", canada: "Canadá",
      italy: "Itália", france: "França", spain: "Espanha",
      portugal: "Portugal", greece: "Grécia", netherlands: "Holanda",
      germany: "Alemanha", switzerland: "Suíça",
      japan: "Japão", thailand: "Tailândia", indonesia: "Indonésia",
      australia: "Austrália", uae: "Emirados Árabes", egypt: "Egito",
      morocco: "Marrocos", southafrica: "África do Sul",
      surprise: "destino surpresa"
    };
    
    const styleLabels: Record<string, string> = {
      romantic: "romântica", family: "em família", solo: "solo", backpacker: "mochilão"
    };
    
    const budgetLabels: Record<string, string> = {
      economic: "econômico", moderate: "moderado", comfortable: "confortável", 
      luxury: "luxo", flexible: "flexível"
    };
    
    const formatDate = (date: Date | string | null) => {
      if (!date) return null;
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    };
    
    // Construir mensagem inicial COMPLETA com todos os dados do quiz
    const parts: string[] = [];
    parts.push(`Olá! Acabei de responder o quiz de preferências de viagem.`);
    
    // Destinos (múltiplos)
    if (answers.destinations?.length > 0) {
      const destNames = answers.destinations.map(d => destLabels[d] || d);
      parts.push(`🌍 Destinos: ${destNames.join(", ")}.`);
    } else if (answers.destination) {
      parts.push(`🌍 Destino: ${destLabels[answers.destination] || answers.destination}.`);
    }
    
    // Região específica
    if (answers.destinationDetails) {
      parts.push(`📍 Região específica: ${answers.destinationDetails}.`);
    }
    
    // Datas COMPLETAS
    if (answers.startDate) {
      const start = formatDate(answers.startDate);
      const end = answers.endDate ? formatDate(answers.endDate) : null;
      if (end) {
        parts.push(`📅 Datas: ${start} até ${end}.`);
      } else if (answers.duration) {
        const durationLabels: Record<string, string> = {
          weekend: "3-4 dias", week: "7 dias", twoweeks: "14 dias", month: "30+ dias", flexible: "flexível"
        };
        parts.push(`📅 Início: ${start}, duração: ${durationLabels[answers.duration] || answers.duration}.`);
      }
    } else if (answers.duration) {
      const durationLabels: Record<string, string> = {
        weekend: "3-4 dias", week: "7 dias", twoweeks: "14 dias", month: "30+ dias", flexible: "flexível"
      };
      parts.push(`⏱️ Duração: ${durationLabels[answers.duration] || answers.duration}.`);
    }
    
    // PEDIDOS ESPECIAIS - PRIORIDADE MÁXIMA
    if (answers.customRequests) {
      parts.push(`⭐ PEDIDOS ESPECIAIS: ${answers.customRequests}`);
    }
    
    // Estilo de viagem
    if (answers.travelStyle) {
      parts.push(`✈️ Estilo: viagem ${styleLabels[answers.travelStyle] || answers.travelStyle}.`);
    }
    
    // Orçamento
    if (answers.budget) {
      parts.push(`💰 Orçamento: ${budgetLabels[answers.budget] || answers.budget}.`);
    }
    
    // Com quem viaja
    if (answers.travelWith) {
      const withLabels: Record<string, string> = {
        solo: "sozinho(a)", couple: "em casal", friends: "com amigos",
        "family-kids": "família com crianças", "family-adults": "família adultos", pets: "com pet"
      };
      parts.push(`👥 Viajando: ${withLabels[answers.travelWith] || answers.travelWith}.`);
    }
    
    // Interesses
    if (answers.interests?.length > 0) {
      parts.push(`❤️ Interesses: ${answers.interests.join(", ")}.`);
    }
    
    // Hospedagem
    if (answers.accommodation) {
      const accLabels: Record<string, string> = {
        luxury: "luxo", boutique: "boutique", midrange: "confortável", budget: "econômico", airbnb: "apartamentos"
      };
      parts.push(`🏨 Hospedagem: ${accLabels[answers.accommodation] || answers.accommodation}.`);
    }
    
    parts.push(`\nPode criar um pré-roteiro dia a dia baseado nessas informações?`);
    
    const initialMessage = parts.join(" ");
    await sendMessage(initialMessage, answers, true);
  };

  const streamChat = async (
    messagesToSend: Message[],
    answers: QuizAnswers | null,
    onDelta: (text: string) => void,
    onDone: () => void
  ) => {
    const chatUrl = getChatUrl();
    console.log('[Chat Debug] URL:', chatUrl);
    console.log('[Chat Debug] URL:', chatUrl);
    console.log('[Chat Debug] Messages:', messagesToSend.length);
    
    const resp = await fetch(chatUrl, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ messages: messagesToSend, quizAnswers: answers }),
    });
    
    console.log('[Chat Debug] Response status:', resp.status);

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      if (resp.status === 429) {
        throw new Error("Sofia está ocupada. Tente novamente em 30 segundos.");
      }
      if (resp.status === 402) {
        throw new Error("Créditos insuficientes para continuar.");
      }
      if (resp.status >= 500) {
        throw new Error("Falha temporária no servidor. Tente novamente.");
      }
      throw new Error(errorData.error || "Verifique sua conexão e tente novamente.");
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

    // FREEMIUM: Allow guests to send up to FREE_GUEST_MESSAGES before requiring login
    if (!isInitial && !user) {
      if (guestMessagesUsed >= FREE_GUEST_MESSAGES) {
        setShowAuthModal(true);
        return;
      }
    }

    // Check chat message limit for logged-in users (skip for initial auto-message and guests)
    if (!isInitial && user && !canSendChatMessage) {
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
      setRateLimitError(false);
      await streamChat(
        newMessages,
        answers !== undefined ? answers : quizAnswers,
        updateAssistant,
        async () => {
          setIsLoading(false);
          // Track guest message usage
          if (!isInitial && !user) {
            setGuestMessagesUsed(prev => prev + 1);
          }
          // Consume chat message credit after successful response (skip for initial and guests)
          if (!isInitial && user) {
            await consumeChatMessage();
          }
        }
      );
    } catch (error) {
      console.error("Chat error:", error);
      setIsLoading(false);
      
      const errorMessage = error instanceof Error ? error.message : "Erro ao enviar mensagem";
      const isRateLimit = errorMessage.includes("ocupada") || errorMessage.includes("429") || errorMessage.includes("rate");
      const isServerError = errorMessage.includes("servidor") || errorMessage.includes("500");
      
      if (isRateLimit) {
        setRateLimitError(true);
      }
      
      toast({
        variant: "destructive",
        title: isRateLimit ? "Sofia ocupada" : isServerError ? "Erro temporário" : "Erro de conexão",
        description: errorMessage,
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
                    // Salvar conversa completa estruturada para a geração do roteiro
                    const chatHistory = messages.map(m => 
                      `${m.role === 'user' ? 'USUÁRIO' : 'SOFIA'}: ${m.content}`
                    ).join('\n\n---\n\n');
                    
                    // Extrair preferências explícitas do usuário
                    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
                    const userPreferences = userMessages.join(' | ');
                    
                    const structuredSummary = `
=== PREFERÊNCIAS EXPRESSAS PELO USUÁRIO ===
${userPreferences}

=== HISTÓRICO COMPLETO DA CONVERSA ===
${chatHistory}

=== INSTRUÇÕES PARA GERAÇÃO ===
1. TODAS as preferências expressas pelo usuário acima DEVEM ser respeitadas
2. Se o usuário mencionou cidades, bairros ou atrações específicas, INCLUA-OS no roteiro
3. Se o usuário pediu alterações ao pré-roteiro sugerido, APLIQUE essas alterações
4. A data de início foi definida no quiz - os dias da semana devem ser REAIS
5. Priorize SEMPRE o que o usuário pediu sobre sugestões genéricas
`;
                    
                    sessionStorage.setItem("chatSummary", structuredSummary);
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
          {messages.length === 0 && !rateLimitError ? (
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
              {quizAnswers && isLoading && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Conectando com a Sofia...</span>
                </div>
              )}
            </motion.div>
          ) : rateLimitError && messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[50vh] text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold mb-3">
                Servidor ocupado 😅
              </h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Estamos com muitas requisições no momento. 
                Aguarde alguns segundos e tente novamente.
              </p>
              <Button 
                onClick={() => {
                  setRateLimitError(false);
                  if (quizAnswers) {
                    sendInitialMessage(quizAnswers);
                  }
                }} 
                className="gradient-primary text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Tentando...
                  </>
                ) : (
                  "Tentar Novamente"
                )}
              </Button>
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
                      {message.role === "user" ? (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                      ) : (
                        <ChatMessageContent
                          content={message.content}
                          freeDays={user ? FREE_DAYS_LOGGED_IN : FREE_DAYS_GUEST}
                          isLoggedIn={!!user}
                          hasSubscription={hasActiveSubscription}
                          onLogin={() => setShowAuthModal(true)}
                          onSubscribe={() => setShowPaywall(true)}
                        />
                      )}
                      
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
                              // Salvar conversa completa estruturada para a geração do roteiro
                              const chatHistory = messages.map(m => 
                                `${m.role === 'user' ? 'USUÁRIO' : 'SOFIA'}: ${m.content}`
                              ).join('\n\n---\n\n');
                              
                              // Extrair preferências explícitas do usuário
                              const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
                              const userPreferences = userMessages.join(' | ');
                              
                              const structuredSummary = `
=== PREFERÊNCIAS EXPRESSAS PELO USUÁRIO ===
${userPreferences}

=== HISTÓRICO COMPLETO DA CONVERSA ===
${chatHistory}

=== INSTRUÇÕES PARA GERAÇÃO ===
1. TODAS as preferências expressas pelo usuário acima DEVEM ser respeitadas
2. Se o usuário mencionou cidades, bairros ou atrações específicas, INCLUA-OS no roteiro
3. Se o usuário pediu alterações ao pré-roteiro sugerido, APLIQUE essas alterações
4. A data de início foi definida no quiz - os dias da semana devem ser REAIS
5. Priorize SEMPRE o que o usuário pediu sobre sugestões genéricas
`;
                              
                              sessionStorage.setItem("chatSummary", structuredSummary);
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
            {/* Guest message counter */}
            {!user && (
              <p className="text-xs text-muted-foreground">
                {FREE_GUEST_MESSAGES - guestMessagesUsed} de {FREE_GUEST_MESSAGES} mensagens grátis
              </p>
            )}
            {/* Logged-in user message counter */}
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
