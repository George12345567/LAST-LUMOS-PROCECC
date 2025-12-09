import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const TypewriterHero = () => {
    const navigate = useNavigate();
    const { role } = useAuth();
    const words = ["Websites", "Experiences", "Brands"];
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // Generate stars data once for better performance
    const starsData = useMemo(() => {
        const smallStars = Array.from({ length: 50 }, (_, i) => ({
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

    // Mouse parallax effect
    useEffect(() => {
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
    }, [currentText, isDeleting, currentWordIndex]);

    const scrollToContact = () => {
        const element = document.getElementById("contact");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Always show error for any password
        setPasswordError("كلمة السر غير صحيحة. الرجاء المحاولة مرة أخرى.");
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
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
            </div>

            <div className="container mx-auto text-center relative z-10 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 px-4">
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight">
                    We Craft Digital{" "}
                    <span className="text-primary inline-block min-w-[140px] sm:min-w-[180px] md:min-w-[260px] lg:min-w-[320px] text-left">
                        {currentText}
                        <span className="animate-pulse">|</span>
                    </span>
                </h1>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-muted-foreground max-w-2xl md:max-w-3xl mx-auto px-2">
                    Lumos Agency is your partner for Web Development, Media Production,
                    and Social Growth. We help businesses of all sizes shine.
                </p>

                {/* Buttons Container */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <button
                        onClick={scrollToContact}
                        className="btn-glow glow-ring px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 rounded-full text-sm sm:text-base lg:text-lg font-bold relative group"
                    >
                        <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                            <span className="hidden sm:inline">Get a Free Consultation</span>
                            <span className="sm:hidden">Free Consultation</span>
                            <span className="inline-flex w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-ping" />
                        </span>
                        <span className="absolute inset-[2px] rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </button>

                    {/* Admin Dashboard Button - Only visible for admins */}
                    {role === 'admin' && (
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 rounded-full text-sm sm:text-base lg:text-lg font-bold relative group border-2 border-amber-500 text-amber-400 hover:bg-amber-500/20 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <span>⚡</span>
                                <span>Admin Dashboard</span>
                            </span>
                        </button>
                    )}

                    {/* Existing Clients Button */}
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 rounded-full text-sm sm:text-base lg:text-lg font-bold relative group border-2 border-primary text-primary hover:bg-primary/10 transition-all"
                    >
                        <span className="relative z-10">عملائنا الحاليين</span>
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground px-2">
                    <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary/80">
                        Swipe Friendly
                    </span>
                    <span className="h-px w-8 sm:w-12 bg-primary/30 hidden sm:block" />
                    <span className="text-center">Optimized for every screen size</span>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setShowPasswordModal(false)}
                >
                    <div
                        className="bg-background rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in-up border border-primary/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-bold text-foreground mb-2">عملائنا الحاليين</h2>
                        <p className="text-muted-foreground mb-6 text-sm">
                            الرجاء إدخال كلمة السر للوصول إلى لوحة التحكم
                        </p>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    كلمة السر
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setPasswordError(""); // Clear error on typing
                                    }}
                                    className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                                    placeholder="أدخل كلمة السر"
                                    dir="rtl"
                                />
                                {passwordError && (
                                    <p className="text-red-500 text-sm mt-2 animate-fade-in">
                                        {passwordError}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                            >
                                دخول
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default TypewriterHero;
