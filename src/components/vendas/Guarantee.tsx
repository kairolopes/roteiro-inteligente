import { motion } from "framer-motion";
import { Shield, CheckCircle, RefreshCw } from "lucide-react";

export function Guarantee() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12 border border-primary/20 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--primary)) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }} />
            </div>

            <div className="relative z-10">
              {/* Shield Icon */}
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-primary" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Garantia de 7 Dias
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
                Se você não ficar 100% satisfeito com seu roteiro, devolvemos seu dinheiro. 
                Sem perguntas, sem burocracia.
              </p>

              {/* Guarantee Points */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium">Satisfação Garantida</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium">Reembolso Integral</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium">Compra Segura</p>
                </div>
              </div>

              {/* Trust Text */}
              <p className="mt-8 text-sm text-muted-foreground">
                Estamos tão confiantes que você vai amar que assumimos todo o risco.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
