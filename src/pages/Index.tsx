import { EnhancedNavbar, Footer } from "@/components/layout";
import TypewriterHero from "@/features/hero";
import LivePreviewTool from "@/features/live-preview";
import TechStack from "@/features/tech-stack";
import AboutStats from "@/features/about";
import EnhancedServices from "@/features/services";
import EnhancedContact from "@/features/contact";
import FAQ from "@/features/faq";
import ProcessTimeline from "@/features/process";
import { useScrollReveal } from "@/hooks";

const Index = () => {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <EnhancedNavbar />
      <TypewriterHero />
      <LivePreviewTool />
      <TechStack />
      <AboutStats />
      <EnhancedServices />
      <EnhancedContact />
      <FAQ />
      <ProcessTimeline />
      <Footer />
    </div>
  );
};

export default Index;
