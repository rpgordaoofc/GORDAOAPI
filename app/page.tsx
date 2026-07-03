import { HeroSection } from "@/components/landing/hero-section";
import { LiveSection } from "@/components/landing/live-section";
import { StatsSection } from "@/components/landing/stats-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { CustomCursor } from "@/components/landing/cursor";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#060606]" style={{ cursor: "none" }}>
      <CustomCursor />
      <HeroSection />
      <LiveSection />
      <StatsSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
