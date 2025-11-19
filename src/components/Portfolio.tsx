const Portfolio = () => {
  const projects = [
    {
      title: "Restaurant Website",
      category: "Web Development",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    },
    {
      title: "Factory Management System",
      category: "Web Systems",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
    },
    {
      title: "Product Photography",
      category: "Media Production",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800",
    },
    {
      title: "Social Media Campaign",
      category: "Social Media",
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800",
    },
    {
      title: "Real Estate Portal",
      category: "Web Development",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    },
    {
      title: "Brand Videography",
      category: "Media Production",
      image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800",
    },
  ];

  return (
    <section id="portfolio" className="py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-foreground reveal">
          Our <span className="text-primary">Portfolio</span>
        </h2>
        <p className="text-center text-muted-foreground mb-16 text-lg reveal">
          Take a look at some of our recent work
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="reveal group relative overflow-hidden rounded-2xl aspect-video cursor-pointer"
            >
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-foreground/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-center p-6">
                <span className="text-primary text-sm font-semibold mb-2 uppercase tracking-wider">
                  {project.category}
                </span>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {project.title}
                </h3>
                <span className="text-white font-medium">View Project →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
