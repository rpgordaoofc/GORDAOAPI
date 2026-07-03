import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { BentoSection } from "@/components/landing/bento-section";
import { StatsSection } from "@/components/landing/stats-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { CustomCursor } from "@/components/landing/cursor";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#060606]" style={{ cursor: "none" }}>
      <CustomCursor />
      <HeroSection />
      <FeaturesSection />
      <BentoSection />
      <StatsSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
