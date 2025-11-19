import { Laptop, Camera, Smartphone } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: <Laptop className="w-12 h-12 text-primary" />,
      title: "Web & Smart Menu Development",
      description: "Custom ordering systems, commission-free sales.",
    },
    {
      icon: <Camera className="w-12 h-12 text-primary" />,
      title: "Professional Media Production",
      description: "Stunning photos & videos that captivate.",
    },
    {
      icon: <Smartphone className="w-12 h-12 text-primary" />,
      title: "Social Media Management",
      description: "Engage your audience, boost your sales.",
    },
  ];

  return (
    <section id="services" className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 text-foreground">
          Our <span className="glow-text">Services</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="glass-card p-8 rounded-2xl glow-border-hover cursor-pointer"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="mb-6 animate-glow-pulse">{service.icon}</div>
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
