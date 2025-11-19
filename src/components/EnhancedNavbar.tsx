import { useState, useEffect } from "react";
import { Home, Workflow, Briefcase, HelpCircle, Phone, Eye } from "lucide-react";

const EnhancedNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-background/80 backdrop-blur-lg shadow-md"
          : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3 md:py-4">
        {/* Mobile: Horizontal Menu */}
        <div className="flex md:hidden items-center justify-between gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
          {/* Logo */}
          <div
            className={`text-base sm:text-lg font-bold text-foreground cursor-pointer flex items-center gap-1.5 hover-lift flex-shrink-0 relative z-10 px-2 py-1 rounded-lg transition-all ${isScrolled ? '' : 'bg-background/60 backdrop-blur-sm'
              }`}
            onClick={() => scrollToSection("hero")}
          >
            <span className="text-primary text-lg sm:text-xl drop-shadow-sm">★</span>
            <span className="whitespace-nowrap">Lumos</span>
          </div>

          {/* Mobile Navigation Items - Icons Only */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end min-w-0 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-foreground hover:text-primary transition-colors duration-300 p-1.5 sm:p-2 rounded-lg hover:bg-primary/10 flex-shrink-0"
              title="Home"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => scrollToSection("process")}
              className="text-foreground hover:text-primary transition-colors duration-300 p-1.5 sm:p-2 rounded-lg hover:bg-primary/10 flex-shrink-0"
              title="Process"
            >
              <Workflow className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="text-foreground hover:text-primary transition-colors duration-300 p-1.5 sm:p-2 rounded-lg hover:bg-primary/10 flex-shrink-0"
              title="Services"
            >
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => scrollToSection("live-preview")}
              className="text-foreground hover:text-primary transition-colors duration-300 p-1.5 sm:p-2 rounded-lg hover:bg-primary/10 flex-shrink-0"
              title="Live Preview"
            >
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-foreground hover:text-primary transition-colors duration-300 p-1.5 sm:p-2 rounded-lg hover:bg-primary/10 flex-shrink-0"
              title="FAQ"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="btn-glow text-primary-foreground px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-semibold hover-lift flex-shrink-0 flex items-center gap-1"
              title="Contact"
            >
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-xs">Contact</span>
            </button>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center justify-between">
          {/* Logo */}
          <div
            className="text-xl sm:text-2xl font-bold text-foreground cursor-pointer flex items-center gap-1.5 sm:gap-2 hover-lift"
            onClick={() => scrollToSection("hero")}
          >
            <span className="text-primary">★</span>
            <span>Lumos</span>
          </div>

          <div className="flex items-center gap-6 lg:gap-8">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-foreground hover:text-primary transition-colors duration-300 font-medium link-underline"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("process")}
              className="text-foreground hover:text-primary transition-colors duration-300 font-medium link-underline"
            >
              Process
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="text-foreground hover:text-primary transition-colors duration-300 font-medium link-underline"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("live-preview")}
              className="text-foreground hover:text-primary transition-colors duration-300 font-medium link-underline"
            >
              Preview
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-foreground hover:text-primary transition-colors duration-300 font-medium link-underline"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="btn-glow text-primary-foreground px-4 py-2 rounded-full font-semibold hover-lift"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default EnhancedNavbar;
