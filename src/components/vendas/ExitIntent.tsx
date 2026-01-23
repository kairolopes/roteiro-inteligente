import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useUTMParams } from "@/hooks/useUTMParams";
import { useExitIntent } from "@/hooks/useExitIntent";

export function ExitIntent() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const utmParams = useUTMParams();
  const { showExitIntent, closeExitIntent } = useExitIntent();

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
        source: 'exit_intent',
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
      });

      if (error && error.code !== '23505') {
        throw error;
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        closeExitIntent();
      }, 2000);
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

  return (
    <AnimatePresence>
      {showExitIntent && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={closeExitIntent}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -50 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-50"
          >
            <div className="bg-background rounded-2xl p-6 md:p-8 shadow-2xl border border-destructive/30 relative overflow-hidden">
              {/* Background Effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl" />

              {/* Close Button */}
              <button
                onClick={closeExitIntent}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {!isSuccess ? (
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-center mb-2">
                    Espere! Não vá ainda...
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Você está prestes a perder uma oferta exclusiva!
                  </p>
                  
                  <div className="bg-primary/10 rounded-xl p-4 mb-6 text-center">
                    <p className="font-medium text-primary">
                      Ganhe 20% de desconto no seu primeiro roteiro
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Deixe seu email e receba o cupom exclusivo
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Seu melhor email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        "Quero Meu Desconto de 20%"
                      )}
                    </Button>
                  </form>

                  <button
                    onClick={closeExitIntent}
                    className="w-full text-sm text-muted-foreground hover:text-foreground mt-4 py-2"
                  >
                    Não, prefiro pagar o preço cheio
                  </button>
                </div>
              ) : (
                <div className="text-center py-4 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Cupom enviado!</h3>
                  <p className="text-muted-foreground">
                    Verifique seu email para usar o desconto de 20%
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
