import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FlightSearchHero } from "@/components/landing/FlightSearchHero";
import { FlightDealsSection } from "@/components/landing/FlightDealsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { DestinationsSection } from "@/components/landing/DestinationsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { PartnersSection } from "@/components/landing/PartnersSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <FlightSearchHero />
        <FlightDealsSection />
        <HowItWorksSection />
        <DestinationsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PartnersSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
