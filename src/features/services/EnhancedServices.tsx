import { Laptop, Camera, Smartphone } from "lucide-react";

const EnhancedServices = () => {
  const services = [
    {
      icon: <Laptop className="w-12 h-12 text-primary" />,
      title: "Web & Systems",
      description:
        "Custom websites, landing pages, and smart management systems for any industry.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      features: ["Responsive Design", "Fast Loading", "SEO Optimized"],
    },
    {
      icon: <Camera className="w-12 h-12 text-primary" />,
      title: "Media Production",
      description:
        "High-quality photography and videography to showcase your products or facilities.",
      image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
      features: ["Professional Quality", "4K Video", "Photo Editing"],
    },
    {
      icon: <Smartphone className="w-12 h-12 text-primary" />,
      title: "Social Media",
      description:
        "Strategic management to build your brand and increase leads.",
      image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800&q=80",
      features: ["Content Strategy", "Analytics", "Growth Hacking"],
    },
  ];

  return (
    <section id="services" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="container mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-3 sm:mb-4 text-foreground reveal">
          Our <span className="text-primary">Expertise</span>
        </h2>
        <p className="text-center text-muted-foreground mb-10 sm:mb-12 md:mb-16 text-sm sm:text-base lg:text-lg reveal">
          Comprehensive digital solutions for your business
        </p>

        <div className="flex gap-4 overflow-x-auto pb-4 md:overflow-visible md:grid md:grid-cols-3 md:gap-8 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
          {services.map((service, index) => (
            <div
              key={index}
              className="reveal glass-card rounded-2xl glow-border-hover cursor-pointer group bg-background hover-lift overflow-hidden flex-shrink-0 w-[85%] sm:w-[70%] md:w-auto snap-center"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Image Section */}
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
                <div className="absolute top-4 right-4 transform group-hover:scale-110 transition-transform duration-300 text-primary drop-shadow-lg">
                  {service.icon}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 sm:p-8">
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  {service.title}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  {service.description}
                </p>
                
                {/* Features List */}
                <div className="space-y-2 mb-4">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 shimmer-line" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnhancedServices;

