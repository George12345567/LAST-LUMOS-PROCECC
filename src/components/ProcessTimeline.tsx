import { Search, Lightbulb, Rocket, CheckCircle } from "lucide-react";

const ProcessTimeline = () => {
  const steps = [
    {
      icon: <Search className="w-12 h-12" />,
      title: "Discovery",
      description: "We learn about your business, goals, and target audience.",
    },
    {
      icon: <Lightbulb className="w-12 h-12" />,
      title: "Strategy",
      description: "We develop a tailored plan to achieve your objectives.",
    },
    {
      icon: <Rocket className="w-12 h-12" />,
      title: "Execution",
      description: "Our team brings your vision to life with precision.",
    },
    {
      icon: <CheckCircle className="w-12 h-12" />,
      title: "Launch",
      description: "We deploy your project and ensure everything runs smoothly.",
    },
  ];

  return (
    <section id="process" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-secondary/30">
      <div className="container mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-3 sm:mb-4 text-foreground reveal">
          Our <span className="text-primary">Process</span>
        </h2>
        <p className="text-center text-muted-foreground mb-10 sm:mb-12 md:mb-16 text-sm sm:text-base lg:text-lg reveal">
          A proven methodology to turn your ideas into reality
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative reveal">
              <div className="glass-card p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl text-center hover:shadow-xl hover-lift relative z-10 bg-background overflow-hidden">
                <span className="block h-1 w-8 sm:w-12 md:w-16 mx-auto mb-3 sm:mb-4 md:mb-6 rounded-full bg-primary/20 shimmer-line" />
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4 md:mb-6 relative">
                  <div className="scale-75 sm:scale-90 md:scale-100">
                  {step.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full bg-primary text-white text-[10px] sm:text-xs md:text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-base sm:text-lg md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-tight sm:leading-normal">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;
