import { useLanguage } from "@/context/LanguageContext";
import { 
  Code2, Palette, TrendingUp, Layers, Lock, ShoppingCart 
} from "lucide-react";

// Add custom CSS for the marquee animation
const style = `
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
  @keyframes marquee-rtl {
    0% { transform: translateX(0%); }
    100% { transform: translateX(50%); }
  }
  .animate-marquee {
    animation: marquee 35s linear infinite;
  }
  .animate-marquee-rtl {
    animation: marquee-rtl 35s linear infinite;
  }
  .animate-marquee:hover, .animate-marquee-rtl:hover {
    animation-play-state: paused;
  }
`;

const TechStack = () => {
  const { t, isArabic } = useLanguage();

  // Exactly matching the pricing.ts categories with distinct color schemes
  const categories = [
    { icon: <Code2 className="w-6 h-6 sm:w-8 sm:h-8" />, name: t('تطوير المواقع', 'Web Development'), tag: "Core", bgGradient: "from-blue-500/15 to-cyan-500/10", iconColor: "text-blue-400", borderColor: "border-blue-400/30" },
    { icon: <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8" />, name: t('تحسينات التجارة الإلكترونية', 'E-Commerce'), tag: "Boost", bgGradient: "from-emerald-500/15 to-teal-500/10", iconColor: "text-emerald-400", borderColor: "border-emerald-400/30" },
    { icon: <Layers className="w-6 h-6 sm:w-8 sm:h-8" />, name: t('البراند والتجربة', 'Brand Experience'), tag: "Creative", bgGradient: "from-purple-500/15 to-pink-500/10", iconColor: "text-purple-400", borderColor: "border-purple-400/30" },
    { icon: <Palette className="w-6 h-6 sm:w-8 sm:h-8" />, name: t('الهوية البصرية', 'Brand Identity'), tag: "Visual", bgGradient: "from-rose-500/15 to-orange-500/10", iconColor: "text-rose-400", borderColor: "border-rose-400/30" },
    { icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />, name: t('الإعلانات والنمو', 'Growth & Ads'), tag: "Marketing", bgGradient: "from-amber-500/15 to-yellow-500/10", iconColor: "text-amber-400", borderColor: "border-amber-400/30" },
    { icon: <Lock className="w-6 h-6 sm:w-8 sm:h-8" />, name: t('الأمان والأداء', 'Security & Performance'), tag: "Tech", bgGradient: "from-indigo-500/15 to-blue-500/10", iconColor: "text-indigo-400", borderColor: "border-indigo-400/30" },
  ];

  // For a seamless infinite scroll, we duplicate the array so it can loop
  const duplicatedCategories = [...categories, ...categories, ...categories];

  return (
    <section className="py-8 sm:py-12 bg-gradient-to-b from-background to-black/20 relative overflow-hidden flex flex-col justify-center border-y border-white/8">
      <style>{style}</style>
      
      {/* Decorative gradient backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#64ffda]/8 via-transparent to-[#64ffda]/5 blur-[120px] pointer-events-none opacity-40" />

      <div className="container mx-auto mb-6 sm:mb-8 relative z-10 px-4">
        <h3 className="text-center text-slate-300 font-bold tracking-widest uppercase text-[11px] sm:text-xs">
          {t("مجالات نتميز بها", "Core Expertise We Master")}
        </h3>
      </div>

      <div className="relative flex flex-col overflow-hidden">
        {/* Single Row - Moves Left/Right based on Lang */}
        <div className="flex w-[300%] sm:w-[200%] md:w-[150%] xl:w-[100%]">
          <div className={`flex w-full gap-3 sm:gap-4 ${isArabic ? 'animate-marquee-rtl' : 'animate-marquee'}`}>
            {duplicatedCategories.map((cat, index) => (
              <div
                key={`cat-${index}`}
                className="flex-shrink-0 w-44 sm:w-56"
              >
                <div className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl bg-gradient-to-br ${cat.bgGradient} border ${cat.borderColor} backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:scale-105 group cursor-pointer`}>
                  <div className={`${cat.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    {cat.icon}
                  </div>
                  <div className="text-start flex-1">
                    <h3 className="text-sm sm:text-[15px] font-bold text-white leading-tight group-hover:text-[#64ffda] transition-colors duration-300">{cat.name}</h3>
                    <p className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5 group-hover:text-slate-200 transition-colors duration-300">{cat.tag}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gradient Overlays to smoothly fade the edges */}
        <div className="absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
};

export default TechStack;

