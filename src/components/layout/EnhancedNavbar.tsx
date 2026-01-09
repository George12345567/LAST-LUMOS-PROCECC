/**
 * ═══════════════════════════════════════════════════════════════════
 * EnhancedNavbar.tsx - ADVANCED PUBLIC NAVIGATION
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Advanced navigation with modern UI features:
 * - Scroll progress indicator
 * - Active section tracking
 * - Advanced animations & micro-interactions
 * - Enhanced mobile menu
 * - Dynamic glassmorphism effects
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Briefcase, DollarSign, Sparkles, Eye, HelpCircle, Layers, Phone } from "lucide-react";
import { PricingModal } from "@/components/pricing";

const EnhancedNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation items
  const navItems = [
    { id: "hero", label: "Home" },
    { id: "process", label: "Process" },
    { id: "services", label: "Services" },
    { id: "live-preview", label: "Preview" },
    { id: "faq", label: "FAQ" },
  ];

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;

      setScrollProgress(progress);
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Active section tracking with IntersectionObserver
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -80% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    navItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    // If not on home page, navigate first
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg"
          : "bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm"
          }`}
      >
        {/* Scroll Progress Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent">
          <div
            className="h-full bg-gradient-to-r from-[#64ffda] via-cyan-400 to-[#64ffda] transition-all duration-300 shadow-[0_0_10px_rgba(100,255,218,0.5)]"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo with hover animation */}
            <div
              className="text-xl sm:text-2xl font-bold text-gray-900 cursor-pointer flex items-center gap-2 group"
              onClick={() => scrollToSection("hero")}
            >
              <span className="text-cyan-500 text-2xl sm:text-3xl drop-shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:drop-shadow-[0_0_8px_rgba(100,255,218,0.8)]">
                ★
              </span>
              <span className="bg-gradient-to-r from-gray-900 to-cyan-500 bg-clip-text text-transparent transition-all duration-300 group-hover:from-cyan-500 group-hover:to-gray-900">
                Lumos
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-4 py-2 font-medium transition-all duration-300 group ${activeSection === item.id
                    ? "text-cyan-500"
                    : "text-gray-700 hover:text-cyan-500"
                    }`}
                >
                  <span className="relative z-10">{item.label}</span>

                  {/* Hover underline animation */}
                  <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent transition-all duration-300 group-hover:w-full" />

                  {/* Active indicator */}
                  {activeSection === item.id && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse" />
                  )}

                  {/* Hover background */}
                  <span className="absolute inset-0 rounded-lg bg-cyan-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>
              ))}

              {/* Pricing Button */}
              <button
                onClick={() => setPricingOpen(true)}
                className="relative px-4 py-2 font-medium text-gray-700 hover:text-cyan-500 transition-all duration-300 group"
              >
                <span className="relative z-10">Pricing</span>
                <span className="absolute bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent transition-all duration-300 group-hover:w-full" />
                <span className="absolute inset-0 rounded-lg bg-cyan-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </button>

              {/* CTA Button */}
              <button
                onClick={() => scrollToSection("contact")}
                className="ml-4 relative px-6 py-2.5 font-semibold text-[#0a192f] bg-gradient-to-r from-[#64ffda] to-cyan-400 rounded-lg overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Get Started
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-[#64ffda] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </button>
            </div>

            {/* Mobile Navigation Icons - Compact & Cool */}
            <div className="flex lg:hidden items-center gap-0.5">
              <button
                onClick={() => scrollToSection("hero")}
                className={`p-1.5 rounded-md transition-all duration-300 ${activeSection === "hero"
                    ? "text-cyan-500 bg-cyan-50"
                    : "text-gray-500 hover:text-cyan-500 hover:bg-gray-50"
                  }`}
                title="Home"
              >
                <Home className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection("process")}
                className={`p-1.5 rounded-md transition-all duration-300 ${activeSection === "process"
                    ? "text-cyan-500 bg-cyan-50"
                    : "text-gray-500 hover:text-cyan-500 hover:bg-gray-50"
                  }`}
                title="Process"
              >
                <Layers className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection("services")}
                className={`p-1.5 rounded-md transition-all duration-300 ${activeSection === "services"
                    ? "text-cyan-500 bg-cyan-50"
                    : "text-gray-500 hover:text-cyan-500 hover:bg-gray-50"
                  }`}
                title="Services"
              >
                <Briefcase className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection("live-preview")}
                className={`p-1.5 rounded-md transition-all duration-300 ${activeSection === "live-preview"
                    ? "text-cyan-500 bg-cyan-50"
                    : "text-gray-500 hover:text-cyan-500 hover:bg-gray-50"
                  }`}
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection("faq")}
                className={`p-1.5 rounded-md transition-all duration-300 ${activeSection === "faq"
                    ? "text-cyan-500 bg-cyan-50"
                    : "text-gray-500 hover:text-cyan-500 hover:bg-gray-50"
                  }`}
                title="FAQ"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <button
                onClick={() => setPricingOpen(true)}
                className="p-1.5 rounded-md text-gray-500 hover:text-cyan-500 hover:bg-gray-50 transition-all duration-300"
                title="Pricing"
              >
                <DollarSign className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToSection("contact")}
                className="p-1.5 ml-0.5 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-110"
                title="Contact"
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Modal */}
      <PricingModal open={pricingOpen} onOpenChange={setPricingOpen} />

      {/* Animation Keyframes */}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </>
  );
};

export default EnhancedNavbar;
