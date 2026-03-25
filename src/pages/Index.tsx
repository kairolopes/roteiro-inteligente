import { Navbar } from "@/components/layout/Navbar";
import UserMenu from "@/components/auth/UserMenu";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { DestinationsSection } from "@/components/landing/DestinationsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-24 lg:pb-0">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <DestinationsSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <div className="fixed inset-x-4 bottom-4 z-50 lg:hidden safe-area-bottom safe-area-x">
        <UserMenu mobileFloating />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
