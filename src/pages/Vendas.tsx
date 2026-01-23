import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { VendasNavbar } from "@/components/vendas/VendasNavbar";
import { VendasHero } from "@/components/vendas/VendasHero";
import { PainPoints } from "@/components/vendas/PainPoints";
import { Solution } from "@/components/vendas/Solution";
import { Benefits } from "@/components/vendas/Benefits";
import { SocialProof } from "@/components/vendas/SocialProof";
import { Demonstration } from "@/components/vendas/Demonstration";
import { Offer } from "@/components/vendas/Offer";
import { PricingSection } from "@/components/vendas/PricingSection";
import { Guarantee } from "@/components/vendas/Guarantee";
import { FAQVendas } from "@/components/vendas/FAQVendas";
import { Urgency } from "@/components/vendas/Urgency";
import { FinalCTA } from "@/components/vendas/FinalCTA";
import { LeadCapture } from "@/components/vendas/LeadCapture";
import { ExitIntent } from "@/components/vendas/ExitIntent";
import { VendasFooter } from "@/components/vendas/VendasFooter";
import AuthModal from "@/components/auth/AuthModal";
import { useToast } from "@/components/ui/use-toast";
import { useUserCredits } from "@/hooks/useUserCredits";

export default function Vendas() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { refetch } = useUserCredits();

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      toast({
        title: "Pagamento confirmado! 🎉",
        description: "Seus créditos já estão disponíveis.",
      });
      refetch();
    } else if (status === 'failure') {
      toast({
        title: "Pagamento não concluído",
        description: "Houve um problema. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast, refetch]);

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <VendasNavbar onCTAClick={scrollToPricing} />
      <VendasHero onCTAClick={scrollToPricing} />
      <PainPoints />
      <Solution />
      <Benefits />
      <SocialProof />
      <Demonstration />
      <Offer />
      <PricingSection onAuthRequired={() => setShowAuthModal(true)} />
      <Guarantee />
      <FAQVendas />
      <Urgency onCTAClick={scrollToPricing} />
      <FinalCTA onCTAClick={scrollToPricing} />
      <VendasFooter />
      
      {/* Modals */}
      <LeadCapture isOpen={showLeadCapture} onClose={() => setShowLeadCapture(false)} />
      <ExitIntent />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
