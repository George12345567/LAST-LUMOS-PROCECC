import { useState, useEffect, useMemo } from "react";
import { Sparkles, ArrowRight, LogIn } from "lucide-react";
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

const TypewriterHero = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const { isArabic, t } = useLanguage();
    const words = useMemo(() => (isArabic ? ["براندات", "مواقع", "متاجر", "منصات"] : ["Brands", "Websites", "Stores", "Platforms"]), [isArabic]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Generate stars data once for better performance
    // Reduced counts for mobile performance
    const starsData = useMemo(() => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const smallStars = Array.from({ length: isMobile ? 20 : 50 }, (_, i) => ({
            id: `small-${i}`,
            size: Math.random() * 2 + 1,
            delay: Math.random() * 3,
            duration: 2 + Math.random() * 3,
            left: Math.random() * 100,
            top: Math.random() * 100,
            opacity: 0.3 + Math.random() * 0.7,
        }));

        const mediumStars = Array.from({ length: 20 }, (_, i) => ({
            id: `medium-${i}`,
            size: Math.random() * 3 + 2,
            delay: Math.random() * 4,
            duration: 3 + Math.random() * 2,
            left: Math.random() * 100,
            top: Math.random() * 100,
            opacity: 0.5 + Math.random() * 0.5,
        }));

        const largeStars = Array.from({ length: 8 }, (_, i) => ({
            id: `large-${i}`,
            size: Math.random() * 4 + 3,
            delay: Math.random() * 5,
            duration: 4 + Math.random() * 2,
            left: Math.random() * 100,
            top: Math.random() * 100,
            opacity: 0.4 + Math.random() * 0.6,
        }));

        return { smallStars, mediumStars, largeStars };
    }, []);

    // Mouse parallax effect (skip on mobile/touch devices and reduced-motion)
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isTouch = window.matchMedia('(pointer: coarse)').matches;
        if (prefersReducedMotion || isTouch) return;

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        const currentWord = words[currentWordIndex];
        const typingSpeed = isDeleting ? 50 : 150;

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                setCurrentText(currentWord.substring(0, currentText.length + 1));
                if (currentText === currentWord) {
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            } else {
                setCurrentText(currentWord.substring(0, currentText.length - 1));
                if (currentText === "") {
                    setIsDeleting(false);
                    setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
                }
            }
        }, typingSpeed);

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentWordIndex, words]);

    const scrollToContact = () => {
        const element = document.getElementById("contact");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section
            id="hero"
            className="min-h-[85vh] sm:min-h-screen flex items-center justify-center px-4 sm:px-6 pt-16 sm:pt-20 md:pt-24 lg:pt-32 pb-8 sm:pb-12 md:pb-16 lg:pb-20 relative overflow-hidden"
        >
            {/* Magical Stars Background with Parallax */}
            <div
                className="absolute inset-0 pointer-events-none overflow-hidden transition-transform duration-300 ease-out"
                style={{
                    transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
                }}
            >
                {/* Animated Stars Layer 1 - Small Twinkling Stars */}
                {starsData.smallStars.map((star) => (
                    <div
                        key={star.id}
                        className="absolute rounded-full bg-white transition-all duration-1000 ease-out"
                        style={{
                            left: `${star.left}%`,
                            top: `${star.top}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            boxShadow: `0 0 ${star.size * 2}px rgba(0, 188, 212, 0.9), 0 0 ${star.size * 4}px rgba(0, 188, 212, 0.5), 0 0 ${star.size * 6}px rgba(0, 188, 212, 0.2)`,
                            animation: `starTwinkle ${star.duration}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                            animationDelay: `${star.delay}s`,
                            opacity: star.opacity,
                            willChange: 'opacity, transform',
                        }}
                    />
                ))}

                {/* Animated Stars Layer 2 - Medium Glowing Stars */}
                {starsData.mediumStars.map((star) => (
                    <div
                        key={star.id}
                        className="absolute rounded-full bg-cyan-400 transition-all duration-1000 ease-out"
                        style={{
                            left: `${star.left}%`,
                            top: `${star.top}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            boxShadow: `0 0 ${star.size * 3}px rgba(0, 188, 212, 1), 0 0 ${star.size * 6}px rgba(0, 188, 212, 0.7), 0 0 ${star.size * 9}px rgba(0, 188, 212, 0.4), 0 0 ${star.size * 12}px rgba(0, 188, 212, 0.1)`,
                            animation: `starPulse ${star.duration}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                            animationDelay: `${star.delay}s`,
                            filter: 'blur(0.5px)',
                            opacity: star.opacity,
                            willChange: 'opacity, transform, filter',
                        }}
                    />
                ))}

                {/* Animated Stars Layer 3 - Large Bright Stars */}
                {starsData.largeStars.map((star) => (
                    <div
                        key={star.id}
                        className="absolute rounded-full transition-all duration-1000 ease-out"
                        style={{
                            left: `${star.left}%`,
                            top: `${star.top}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            background: `radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(0, 188, 212, 0.9) 40%, rgba(0, 188, 212, 0.6) 70%, transparent 100%)`,
                            boxShadow: `0 0 ${star.size * 4}px rgba(0, 188, 212, 1), 0 0 ${star.size * 8}px rgba(0, 188, 212, 0.9), 0 0 ${star.size * 12}px rgba(0, 188, 212, 0.6), 0 0 ${star.size * 16}px rgba(0, 188, 212, 0.3)`,
                            animation: `starGlow ${star.duration}s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                            animationDelay: `${star.delay}s`,
                            filter: 'blur(1px)',
                            opacity: star.opacity,
                            willChange: 'opacity, transform, filter',
                        }}
                    />
                ))}

                {/* Shooting Stars - Enhanced */}
                {[...Array(4)].map((_, i) => {
                    const delay = i * 3;
                    const duration = 6 + i * 1.5;
                    const startX = 15 + i * 25;
                    const startY = 5 + i * 20;

                    return (
                        <div
                            key={`shooting-${i}`}
                            className="absolute"
                            style={{
                                left: `${startX}%`,
                                top: `${startY}%`,
                                width: '3px',
                                height: '120px',
                                background: `linear-gradient(to bottom, 
                  transparent 0%,
                  rgba(0, 188, 212, 0.3) 20%,
                  rgba(0, 188, 212, 0.9) 50%,
                  rgba(255, 255, 255, 0.8) 55%,
                  rgba(0, 188, 212, 0.3) 80%,
                  transparent 100%
                )`,
                                transform: `rotate(${-45 + i * 12}deg)`,
                                animation: `shootingStar ${duration}s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
                                animationDelay: `${delay}s`,
                                filter: 'blur(1.5px)',
                                willChange: 'transform, opacity',
                            }}
                        />
                    );
                })}

                {/* Floating Light Particles */}
                {[...Array(15)].map((_, i) => {
                    const size = Math.random() * 3 + 1;
                    const duration = 8 + Math.random() * 4;
                    const delay = Math.random() * 5;
                    const startX = Math.random() * 100;
                    const startY = 100 + Math.random() * 20;

                    return (
                        <div
                            key={`particle-${i}`}
                            className="absolute rounded-full bg-cyan-400"
                            style={{
                                left: `${startX}%`,
                                top: `${startY}%`,
                                width: `${size}px`,
                                height: `${size}px`,
                                boxShadow: `0 0 ${size * 4}px rgba(0, 188, 212, 0.8), 0 0 ${size * 8}px rgba(0, 188, 212, 0.4)`,
                                animation: `floatUp ${duration}s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
                                animationDelay: `${delay}s`,
                                opacity: 0.6,
                                willChange: 'transform, opacity',
                            }}
                        />
                    );
                })}
            </div>

            {/* Background Pattern - Gradient Orbs */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
                <div className="absolute top-10 left-20 w-64 h-64 bg-primary/15 rounded-full blur-3xl animate-orb"></div>
                <div className="absolute bottom-10 right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-orb-delayed"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
            </div>
            {/* Smooth transition gradient to next section */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none"></div>

            <div className="container mx-auto text-center relative z-10 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 px-4" dir={isArabic ? 'rtl' : 'ltr'}>

            <div className="flex items-center justify-center">
                    <div className="relative group">
                        {/* LUMOS Logo - Modern minimalist design */}
                        <svg 
                            viewBox="0 0 200 80" 
                            className="w-32 sm:w-40 md:w-48 h-auto"
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Animated background glow */}
                            <defs>
                                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{stopColor: '#64ffda', stopOpacity: 1}} />
                                    <stop offset="100%" style={{stopColor: '#00d9ff', stopOpacity: 1}} />
                                </linearGradient>
                                <filter id="logoShadow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                                </filter>
                            </defs>
                            
                            {/* L - Left vertical bar */}
                            <rect x="10" y="15" width="6" height="50" fill="url(#logoGradient)" rx="3" />
                            {/* L - Horizontal base */}
                            <rect x="10" y="60" width="24" height="6" fill="url(#logoGradient)" rx="3" />
                            
                            {/* U - Left vertical */}
                            <rect x="46" y="15" width="6" height="44" fill="url(#logoGradient)" rx="3" />
                            {/* U - Bottom curve */}
                            <path d="M 46 59 Q 46 66 53 66 Q 60 66 60 59 L 60 15" stroke="url(#logoGradient)" strokeWidth="6" strokeLinecap="round" fill="none" />
                            
                            {/* M - Left vertical */}
                            <rect x="76" y="15" width="6" height="50" fill="url(#logoGradient)" rx="3" />
                            {/* M - Peak */}
                            <path d="M 82 15 L 88 30 L 94 15" stroke="url(#logoGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            {/* M - Right vertical */}
                            <rect x="94" y="15" width="6" height="50" fill="url(#logoGradient)" rx="3" />
                            
                            {/* O - Outer circle */}
                            <circle cx="130" cy="40" r="27" stroke="url(#logoGradient)" strokeWidth="6" />
                            
                            {/* S - Curved design */}
                            <path d="M 172 22 Q 178 22 178 28 Q 178 34 172 34 Q 166 34 166 40 Q 166 46 172 46 Q 178 46 178 52" 
                                  stroke="url(#logoGradient)" strokeWidth="6" strokeLinecap="round" fill="none" />
                        </svg>
                        
                        {/* Subtle glow on hover */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#64ffda]/20 to-cyan-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" />
                    </div>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight">
                    {t('نبني', 'We Build')}{" "}
                    <span className={`text-primary inline-block min-w-[120px] sm:min-w-[160px] md:min-w-[240px] lg:min-w-[300px] ${isArabic ? 'text-right' : 'text-left'}`}>
                        {currentText}
                        <span className="animate-pulse">|</span>
                    </span>
                    <br />
                    <span className="text-foreground/80">{t('تستحق الانتباه', 'That Demand Attention')}</span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl md:max-w-2xl mx-auto px-2">
                    {t(
                        'نحوّل الأفكار إلى براندات واضحة، مواقع عالية التحويل، ومحتوى يدعم النمو التجاري من التخطيط حتى الإطلاق.',
                        'We turn ideas into clear brands, high-converting websites, and growth-ready content from strategy to launch.'
                    )}
                </p>

                {/* Buttons Container */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <Link
                        to="/#live-preview"
                        className="px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 rounded-full text-sm sm:text-base lg:text-lg font-bold relative group border-2 border-cyan-400/60 text-cyan-300 hover:border-cyan-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.2)] transition-all duration-300 inline-flex items-center gap-2"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <span className="hidden sm:inline">{t('جرّب المعاينة ثم اطلب التسعير', 'Try Preview then Get Pricing')}</span>
                            <span className="sm:hidden">{t('جرّب المعاينة', 'Try Preview')}</span>
                            <ArrowRight className={`w-4 h-4 transition-transform ${isArabic ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'}`} />
                        </span>
                    </Link>

                    <button
                        onClick={scrollToContact}
                        className="btn-glow glow-ring px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 rounded-full text-sm sm:text-base lg:text-lg font-bold relative group"
                    >
                        <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                            <span className="hidden sm:inline">{t('احصل على استشارة مجانية', 'Get a Free Consultation')}</span>
                            <span className="sm:hidden">{t('استشارة مجانية', 'Free Consultation')}</span>
                            <span className="inline-flex w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-ping" />
                        </span>
                        <span className="absolute inset-[2px] rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></span>
                    </button>

                    {/* Client Portal Button */}
                    <Link
                        to={isAuthenticated ? (isAdmin ? '/dashboard' : '/clients/profile') : '/client-login'}
                        className="px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 rounded-full text-sm sm:text-base lg:text-lg font-bold relative group border-2 border-primary/60 text-primary hover:border-primary hover:shadow-[0_0_24px_rgba(0,188,212,0.15)] transition-all duration-300 inline-flex items-center gap-2"
                    >
                        {isAuthenticated ? (
                            <>
                                <span className="relative z-10 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                                    <span className="hidden sm:inline">{t('اذهب إلى لوحة التحكم', 'Go to Dashboard')}</span>
                                    <span className="sm:hidden">{t('لوحة التحكم', 'Dashboard')}</span>
                                    <ArrowRight className={`w-4 h-4 transition-transform ${isArabic ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'}`} />
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="relative z-10 flex items-center gap-2">
                                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">{t('بوابة العميل', 'Client Portal')}</span>
                                    <span className="sm:hidden">{t('البوابة', 'Portal')}</span>
                                </span>
                                {/* Subtle glow on hover */}
                                <span className="absolute inset-0 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            </>
                        )}
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground px-2">
                    <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary/80">
                        {t('جودة لا مساومة', 'Uncompromising Quality')}
                    </span>
                    <span className="h-px w-8 sm:w-12 bg-primary/30 hidden sm:block" />
                    <span className="text-center">{t('تسليم احترافي · دعم مستمر · نتائج حقيقية', 'Professional Delivery · Ongoing Support · Real Results')}</span>
                </div>

                {/* Easter Egg — Lumos Maxima (Harry Potter spell) — subtle, dimmed */}
                <p
                    className="text-[10px] tracking-[0.5em] uppercase text-primary/15 select-none"
                    title="🪄 Lumos Maxima"
                >
                    ✦ Lumos Maxima ✦
                </p>
            </div>


        </section>
    );
};

export default TypewriterHero;

