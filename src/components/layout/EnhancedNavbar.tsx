/**
 * ═══════════════════════════════════════════════════════════════════
 * EnhancedNavbar.tsx - PUBLIC NAVIGATION
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Public-facing navigation without authentication.
 * 
 * Design:
 * - White background with glassmorphism effect
 * - Gray text with Cyan (#64ffda) accents
 * - Responsive mobile/desktop layouts
 * - Smooth scroll to sections
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Briefcase, DollarSign, Menu, LogIn, UserPlus } from "lucide-react";
import { PricingModal } from "@/components/pricing";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const EnhancedNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    // If not on home page, navigate first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation then scroll
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div
              className="text-xl sm:text-2xl font-bold text-gray-900 cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity"
              onClick={() => scrollToSection("hero")}
            >
              <span className="text-cyan-500 text-2xl sm:text-3xl drop-shadow-lg">★</span>
              <span className="bg-gradient-to-r from-gray-900 to-cyan-500 bg-clip-text text-transparent">Lumos</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("hero")}
                className="text-gray-700 hover:text-cyan-500 transition-colors duration-300 font-medium"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("process")}
                className="text-gray-700 hover:text-cyan-500 transition-colors duration-300 font-medium"
              >
                Process
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="text-gray-700 hover:text-cyan-500 transition-colors duration-300 font-medium"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection("live-preview")}
                className="text-gray-700 hover:text-cyan-500 transition-colors duration-300 font-medium"
              >
                Preview
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-gray-700 hover:text-cyan-500 transition-colors duration-300 font-medium"
              >
                FAQ
              </button>
              <button
                onClick={() => setPricingOpen(true)}
                className="text-gray-700 hover:text-cyan-500 transition-colors duration-300 font-medium"
              >
                Pricing
              </button>
            </div>

            {/* Desktop Auth Section - Login & Sign Up Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                onClick={() => navigate('/login')}
                variant="ghost"
                className="text-gray-700 hover:text-cyan-500 hover:bg-cyan-50 font-medium transition-colors"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                className="bg-[#64ffda] hover:bg-[#64ffda]/90 text-[#0a192f] font-semibold px-6 py-2.5 rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-3">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-700 hover:bg-gray-100"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-white border-l border-gray-200 w-80">
                  <div className="flex flex-col gap-6 mt-8">
                    {/* Mobile Logo */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-cyan-500 text-2xl">★</span>
                      <span className="text-xl font-bold text-gray-900">Lumos</span>
                    </div>

                    {/* Mobile Navigation Links */}
                    <SheetClose asChild>
                      <button
                        onClick={() => scrollToSection("hero")}
                        className="text-gray-700 hover:text-cyan-500 transition-colors text-left py-3 border-b border-gray-200"
                      >
                        <Home className="w-5 h-5 inline mr-3" />
                        Home
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        onClick={() => scrollToSection("services")}
                        className="text-gray-700 hover:text-cyan-500 transition-colors text-left py-3 border-b border-gray-200"
                      >
                        <Briefcase className="w-5 h-5 inline mr-3" />
                        Services
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        onClick={() => setPricingOpen(true)}
                        className="text-gray-700 hover:text-cyan-500 transition-colors text-left py-3 border-b border-gray-200"
                      >
                        <DollarSign className="w-5 h-5 inline mr-3" />
                        Pricing
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        onClick={() => scrollToSection("live-preview")}
                        className="text-gray-700 hover:text-cyan-500 transition-colors text-left py-3 border-b border-gray-200"
                      >
                        Portfolio
                      </button>
                    </SheetClose>

                    {/* Mobile Auth Section - Login & Sign Up */}
                    <div className="mt-6 flex flex-col gap-3">
                      <SheetClose asChild>
                        <Button
                          onClick={() => navigate('/login')}
                          variant="outline"
                          className="w-full border-[#64ffda] text-gray-700 hover:bg-[#64ffda]/10 hover:text-[#0a192f]"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Login
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button
                          onClick={() => navigate('/signup')}
                          className="w-full bg-[#64ffda] text-[#0a192f] hover:bg-[#64ffda]/90 font-semibold"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Sign Up
                        </Button>
                      </SheetClose>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Modal */}
      <PricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
    </>
  );
};

export default EnhancedNavbar;

