import EnhancedNavbar from "@/components/EnhancedNavbar";
import TypewriterHero from "@/components/TypewriterHero";
import LivePreviewTool from "@/components/LivePreviewTool";
import TechStack from "@/components/TechStack";
import AboutStats from "@/components/AboutStats";
import ProcessTimeline from "@/components/ProcessTimeline";
import EnhancedServices from "@/components/EnhancedServices";
import FAQ from "@/components/FAQ";
import EnhancedContact from "@/components/EnhancedContact";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";

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
