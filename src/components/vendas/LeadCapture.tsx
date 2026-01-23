import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Gift, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useUTMParams } from "@/hooks/useUTMParams";

interface LeadCaptureProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeadCapture({ isOpen, onClose }: LeadCaptureProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const utmParams = useUTMParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira seu email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('landing_leads').insert({
        email,
        name: name || null,
        source: 'lead_capture_modal',
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
      });

      if (error) {
        // Se for erro de duplicado, ainda consideramos sucesso
        if (error.code === '23505') {
          setIsSuccess(true);
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
      }
    } catch (error: any) {
      console.error('Erro ao salvar lead:', error);
      toast({
        title: "Erro",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setEmail("");
    setName("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-50"
          >
            <div className="bg-background rounded-2xl p-6 md:p-8 shadow-2xl border border-border relative">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {!isSuccess ? (
                <>
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Gift className="h-8 w-8 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-center mb-2">
                    Guia Gratuito
                  </h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Receba nosso guia exclusivo: <strong>"7 Erros que Viajantes Cometem"</strong> e dicas para economizar nas férias.
                  </p>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Seu nome (opcional)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                      type="email"
                      placeholder="Seu melhor email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-primary/80"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        "Quero Receber o Guia"
                      )}
                    </Button>
                  </form>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Não enviamos spam. Você pode cancelar a qualquer momento.
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                    <Gift className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Pronto!</h3>
                  <p className="text-muted-foreground mb-6">
                    Enviamos o guia para seu email. Enquanto isso, que tal criar seu primeiro roteiro?
                  </p>
                  <Button onClick={handleClose} className="w-full">
                    Continuar Explorando
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
