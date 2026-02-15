import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import LandingFooter from "@/components/landing/LandingFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main>
        <HeroSection />
        <TestimonialsSection />
        <ProblemSection />
        <SolutionSection />
        <PricingSection />
        <FAQSection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Index;
