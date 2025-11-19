import { useState, useEffect, useRef } from "react";

const AboutStats = () => {
  const [counts, setCounts] = useState({ satisfaction: 0, support: 0, projects: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCounters();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCounters = () => {
    const duration = 2000;
    const steps = 60;
    const increment = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setCounts({
        satisfaction: Math.floor(100 * progress),
        support: Math.floor(24 * progress),
        projects: Math.floor(5 * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounts({ satisfaction: 100, support: 24, projects: 5 });
      }
    }, increment);
  };

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative overflow-hidden bg-secondary/40"
    >
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-orb" />
      <div className="absolute -bottom-16 -left-8 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-orb-delayed" />
      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
          {/* Left: About Text */}
          <div className="reveal">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 md:mb-6 text-foreground">
              Who is <span className="text-primary">Lumos?</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-3 sm:mb-4">
              We are a digital agency based in Assiut, dedicated to transforming
              businesses through innovative web solutions, compelling media
              production, and strategic social media management.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground">
              Our mission is to empower businesses of all sizes—from local
              restaurants to large factories—with the digital tools they need to
              thrive in today's competitive landscape.
            </p>
          </div>

          {/* Right: Animated Stats */}
          <div className="grid grid-cols-1 gap-8">
            <div className="glass-card p-8 rounded-2xl text-center reveal hover-lift glow-ring">
              <div className="text-5xl font-bold text-primary mb-2">
                {counts.satisfaction}%
              </div>
              <div className="text-muted-foreground font-medium">
                Client Satisfaction
              </div>
              <div className="mt-6 h-px bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 shimmer-line" />
            </div>

            <div className="glass-card p-8 rounded-2xl text-center reveal hover-lift glow-ring">
              <div className="text-5xl font-bold text-primary mb-2">
                {counts.support}/7
              </div>
              <div className="text-muted-foreground font-medium">
                Support Available
              </div>
              <div className="mt-6 h-px bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 shimmer-line" />
            </div>

            <div className="glass-card p-8 rounded-2xl text-center reveal hover-lift glow-ring">
              <div className="text-5xl font-bold text-primary mb-2">
                {counts.projects}+
              </div>
              <div className="text-muted-foreground font-medium">
                Projects Completed
              </div>
              <div className="mt-6 h-px bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 shimmer-line" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutStats;
