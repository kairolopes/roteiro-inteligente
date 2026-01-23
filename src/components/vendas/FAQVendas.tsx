import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Quanto tempo leva para criar um roteiro?",
    answer: "O roteiro é gerado em aproximadamente 2 minutos após você responder o quiz. Sofia analisa suas preferências e cria um itinerário completo, otimizado por localização e horário.",
  },
  {
    question: "Funciona para qualquer destino?",
    answer: "Sim! Sofia tem conhecimento sobre mais de 127 destinos nacionais e internacionais. De praias no Nordeste a capitais europeias, ela consegue criar roteiros personalizados para praticamente qualquer lugar.",
  },
  {
    question: "Posso ajustar o roteiro depois?",
    answer: "Absolutamente! O roteiro é apenas uma sugestão personalizada. Você pode visualizar no mapa interativo, ajustar horários, remover ou adicionar atividades conforme preferir.",
  },
  {
    question: "O pagamento é seguro?",
    answer: "Sim! Utilizamos o Mercado Pago, a maior plataforma de pagamentos da América Latina. Seus dados estão 100% protegidos e você pode pagar com cartão, Pix ou boleto.",
  },
  {
    question: "Como funciona a garantia de 7 dias?",
    answer: "Se você não ficar satisfeito com seu roteiro por qualquer motivo, basta enviar um email dentro de 7 dias e devolvemos 100% do seu dinheiro. Sem perguntas.",
  },
  {
    question: "Preciso de internet para acessar o roteiro?",
    answer: "Você pode exportar seu roteiro em PDF e acessá-lo offline durante a viagem. Também pode acessar pelo site quando tiver internet.",
  },
  {
    question: "Posso usar os créditos quando quiser?",
    answer: "Sim! Os créditos não expiram. Você pode usar seu crédito agora para uma viagem e guardar os outros para viagens futuras.",
  },
  {
    question: "Sofia é uma pessoa real ou uma IA?",
    answer: "Sofia é nossa assistente de inteligência artificial, treinada com dados de milhares de viajantes reais. Ela combina IA avançada com conhecimento prático de quem realmente viaja.",
  },
];

export function FAQVendas() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-muted-foreground">
            Ainda tem dúvidas? Encontre respostas aqui
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-background rounded-xl border border-border/50 px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
