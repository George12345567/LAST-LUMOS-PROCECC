import { Facebook, MessageCircle, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/40 border-t border-border py-8 sm:py-10 md:py-12 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-glow-pulse" />
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Logo & Description */}
          <div className="sm:col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <span className="text-primary text-xl sm:text-2xl">★</span>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Lumos</h3>
            </div>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base leading-relaxed">
              Your partner for digital transformation. We help businesses of all
              sizes shine in the digital world.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors hover-lift text-sm"
                title="Facebook"
              >
                <Facebook size={18} />
                <span className="font-medium">Facebook</span>
              </a>
              <a
                href="https://wa.me/201279897482"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-[#25D366] transition-colors hover-lift text-sm"
                title="WhatsApp: +20 127 989 7482"
              >
                <MessageCircle size={18} className="text-[#25D366]" />
                <span className="font-medium">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-base sm:text-lg">Quick Links</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <a
                  href="#hero"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-muted-foreground hover:text-primary transition-colors link-underline text-sm sm:text-base"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#process"
                  className="text-muted-foreground hover:text-primary transition-colors link-underline text-sm sm:text-base"
                >
                  Process
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-muted-foreground hover:text-primary transition-colors link-underline text-sm sm:text-base"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-muted-foreground hover:text-primary transition-colors link-underline text-sm sm:text-base"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-base sm:text-lg">Contact</h4>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3">
              <a
                href="tel:+201279897482"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors hover-lift p-2.5 sm:p-3 rounded-lg sm:rounded-full bg-secondary/50 hover:bg-primary/10 text-sm sm:text-base"
                title="+20 127 989 7482"
              >
                <Phone size={18} className="sm:w-5 sm:h-5" />
                <span className="sm:hidden md:inline">+20 127 989 7482</span>
              </a>
              <a
                href="mailto:lomus.agency.contact@gmail.com"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors hover-lift p-2.5 sm:p-3 rounded-lg sm:rounded-full bg-secondary/50 hover:bg-primary/10 text-sm sm:text-base"
                title="lomus.agency.contact@gmail.com"
              >
                <Mail size={18} className="sm:w-5 sm:h-5" />
                <span className="sm:hidden md:inline truncate">lomus.agency.contact@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 sm:pt-8 text-center text-muted-foreground">
          <p className="text-xs sm:text-sm">© 2025 Lumos Agency. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
