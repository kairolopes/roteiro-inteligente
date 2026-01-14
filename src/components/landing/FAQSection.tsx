import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "A plataforma é gratuita?",
    answer:
      "Sim! Você pode usar o planejador de roteiros e conversar com a IA gratuitamente. Cobramos apenas quando você decide fazer reservas através de nossos parceiros, e sempre mostramos os preços de forma transparente.",
  },
  {
    question: "Preciso criar uma conta para usar?",
    answer:
      "Não é obrigatório! Você pode planejar sua viagem sem login. Porém, com uma conta gratuita, você pode salvar seus roteiros, acessar seu histórico e receber sugestões ainda mais personalizadas.",
  },
  {
    question: "Como a IA personaliza meu roteiro?",
    answer:
      "Nossa IA analisa suas respostas no quiz inicial e suas conversas para entender seu estilo de viagem, orçamento, interesses e restrições. Ela então combina isso com dados de milhares de viajantes e informações atualizadas sobre destinos para criar um roteiro único para você.",
  },
  {
    question: "Os preços de voos e hotéis são em tempo real?",
    answer:
      "Sim! Integramos com as principais plataformas de reservas para mostrar preços atualizados. Os valores podem variar dependendo da demanda, então recomendamos reservar quando encontrar uma boa oferta.",
  },
  {
    question: "Posso alterar meu roteiro depois de criado?",
    answer:
      "Absolutamente! O roteiro é totalmente editável. Você pode arrastar e soltar para reorganizar dias, adicionar ou remover atividades, e até pedir para a IA sugerir alternativas para partes específicas.",
  },
  {
    question: "Como funciona o suporte durante a viagem?",
    answer:
      "Você pode baixar seu roteiro em PDF para acesso offline. Além disso, a IA continua disponível para responder dúvidas mesmo durante sua viagem, caso tenha conexão com internet.",
  },
  {
    question: "Quais destinos estão disponíveis?",
    answer:
      "Atualmente focamos em destinos europeus: Itália, França, Espanha, Portugal, Grécia, Holanda, Alemanha, Suíça, Reino Unido e muitos outros. Estamos constantemente expandindo para novos destinos.",
  },
  {
    question: "É seguro fazer reservas pela plataforma?",
    answer:
      "Sim! Trabalhamos apenas com parceiros certificados e todas as transações são processadas com criptografia de ponta. Nunca armazenamos dados de pagamento em nossos servidores.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20 lg:py-32 relative">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Perguntas Frequentes
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ficou com <span className="text-primary">dúvidas</span>?
            </h2>
            <p className="text-muted-foreground text-lg">
              Encontre respostas para as perguntas mais comuns sobre nossa plataforma.
            </p>
          </motion.div>

          {/* FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="glass-card rounded-xl px-6 border-none"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6 text-base font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
