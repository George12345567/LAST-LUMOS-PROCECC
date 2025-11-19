const Hero = () => {
  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in text-foreground">
          Transforming Your Restaurant into a{" "}
          <span className="glow-text">Digital Brand</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Lumos Agency: Your Partner in Assiut for Web Design, Smart Menus & Media Production.
        </p>

        <button
          onClick={scrollToContact}
          className="btn-glow px-8 py-4 rounded-full text-lg font-bold"
        >
          Start Your Journey Now
        </button>

        {/* Decorative Elements - Subtle */}
        <div className="absolute top-1/4 left-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>
    </section>
  );
};

export default Hero;
