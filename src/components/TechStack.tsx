import { Code2, Palette, Camera, Smartphone, Layout, Zap } from "lucide-react";

const TechStack = () => {
  const technologies = [
    { icon: <Code2 size={40} />, name: "HTML5" },
    { icon: <Layout size={40} />, name: "CSS3" },
    { icon: <Zap size={40} />, name: "JavaScript" },
    { icon: <Camera size={40} />, name: "Photography" },
    { icon: <Palette size={40} />, name: "Design" },
    { icon: <Smartphone size={40} />, name: "Mobile" },
  ];

  return (
    <section className="py-10 sm:py-12 md:py-16 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto mb-6 sm:mb-8">
        <h3 className="text-center text-muted-foreground font-semibold tracking-wider uppercase text-xs sm:text-sm px-2">
          Technologies & Skills We Master
        </h3>
      </div>

      <div className="relative">
        {/* Mobile: Faster animation, smaller items */}
        <div 
          className="flex md:hidden gap-3 sm:gap-4 will-change-transform" 
          style={{ 
            animation: 'scroll-mobile 15s linear infinite',
            backfaceVisibility: 'hidden',
            perspective: '1000px',
            transform: 'translate3d(0, 0, 0)'
          }}
        >
          {[...technologies, ...technologies, ...technologies].map((tech, index) => (
            <div
              key={`mobile-${index}`}
              className="flex-shrink-0 mx-2 sm:mx-3 text-muted-foreground"
            >
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 glass-card px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm">
                <span className="text-primary text-2xl sm:text-3xl">{tech.icon}</span>
                <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">{tech.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Original animation */}
        <div className="hidden md:flex animate-[scroll_30s_linear_infinite] gap-6 will-change-transform">
          {[...technologies, ...technologies].map((tech, index) => (
            <div
              key={`desktop-${index}`}
              className="flex-shrink-0 mx-6 text-muted-foreground hover:text-primary transition-colors duration-300 hover-lift cursor-pointer"
            >
              <div className="flex flex-col items-center gap-2 glass-card px-6 py-4 rounded-2xl shadow-sm">
                <span className="text-primary animate-float">{tech.icon}</span>
                <span className="text-sm font-medium">{tech.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Gradient overlays - optimized for mobile */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 md:w-32 bg-gradient-to-r from-secondary/40 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 md:w-32 bg-gradient-to-l from-secondary/40 to-transparent" />
      </div>
    </section>
  );
};

export default TechStack;
