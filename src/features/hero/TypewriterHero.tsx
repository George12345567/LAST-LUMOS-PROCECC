import { useState, useEffect, useRef, useMemo } from "react";
import { Sparkles, Lock, User, ShieldCheck, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

const TypewriterHero = () => {
    const navigate = useNavigate();
    const words = ["Websites", "Experiences", "Brands"];
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [loginStep, setLoginStep] = useState<'credentials' | 'security'>('credentials');
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [loginError, setLoginError] = useState("");
    const [clientData, setClientData] = useState<any>(null);
    const [loginLoading, setLoginLoading] = useState(false);

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

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");

        if (loginStep === 'credentials') {
            setLoginLoading(true);
            try {
                // Query Supabase clients table
                const { data: client, error } = await supabaseAdmin
                    .from('clients')
                    .select('*')
                    .eq('username', username)
                    .eq('password', password)
                    .single();

                if (error || !client) {
                    setLoginError("اسم المستخدم أو كلمة السر غير صحيحة");
                    setLoginLoading(false);
                    return;
                }

                // User found! Check if security question is set
                if (client.security_question) {
                    // Has security question - need step 2
                    setClientData(client);
                    setLoginStep('security');
                } else {
                    // No security question - login directly
                    handleSuccessfulLogin(client);
                }
            } catch (error: any) {
                console.error('Login error:', error);
                setLoginError("حدث خطأ. حاول مرة أخرى.");
            } finally {
                setLoginLoading(false);
            }
        } else if (loginStep === 'security') {
            // Verify security answer
            if (securityAnswer.toLowerCase().trim() === clientData.security_answer.toLowerCase().trim()) {
                handleSuccessfulLogin(clientData);
            } else {
                setLoginError("إجابة سؤال الأمان غير صحيحة");
            }
        }
    };

    const handleSuccessfulLogin = (client: any) => {
        // Save session
        sessionStorage.setItem('client', JSON.stringify(client));
        sessionStorage.setItem('isAuthenticated', 'true');

        // Redirect based on username
        if (client.username === 'GEORGE') {
            // Admin redirect
            toast.success('🎉 مرحباً Admin!');
            setTimeout(() => {
                navigate('/dashboard');
            }, 500);
        } else {
            // Regular client redirect
            toast.success(`🎉 مرحباً ${client.company_name || client.username}!`);
            setTimeout(() => {
                navigate('/clients/dashboard');
            }, 500);
        }
    };

    const handleBackToCredentials = () => {
        setLoginStep('credentials');
        setSecurityAnswer('');
        setLoginError('');
    };

    const handleCloseModal = () => {
        setShowPasswordModal(false);
        setLoginStep('credentials');
        setUsername('');
        setPassword('');
        setSecurityAnswer('');
        setLoginError('');
        setClientData(null);
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
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-background rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in-up border border-primary/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        {/* Progress Steps */}
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <div className={`w-2 h-2 rounded-full transition-all ${loginStep === 'credentials' ? 'bg-primary w-8' : 'bg-primary'
                                }`} />
                            <div className={`w-2 h-2 rounded-full transition-all ${loginStep === 'security' ? 'bg-primary w-8' : 'bg-muted'
                                }`} />
                        </div>

                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                                {loginStep === 'credentials' ? (
                                    <User className="w-8 h-8 text-primary" />
                                ) : (
                                    <ShieldCheck className="w-8 h-8 text-primary" />
                                )}
                            </div>
                            <h3 className="text-2xl font-bold mb-2">
                                {loginStep === 'credentials' ? 'تسجيل الدخول' : 'التحقق الأمني'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {loginStep === 'credentials'
                                    ? 'أدخل بيانات حسابك'
                                    : 'أجب على سؤال الأمان'}
                            </p>
                        </div>

                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            {loginStep === 'credentials' ? (
                                <>
                                    {/* Username */}
                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="text-sm font-semibold">
                                            اسم المستخدم
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input
                                                id="username"
                                                type="text"
                                                value={username}
                                                onChange={(e) => {
                                                    setUsername(e.target.value);
                                                    setLoginError('');
                                                }}
                                                className="pl-10 bg-secondary/50 border-border"
                                                placeholder="أدخل اسم المستخدم"
                                                required
                                                autoFocus
                                                disabled={loginLoading}
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-semibold">
                                            كلمة السر
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value);
                                                    setLoginError('');
                                                }}
                                                className="pl-10 bg-secondary/50 border-border"
                                                placeholder="أدخل كلمة السر"
                                                required
                                                disabled={loginLoading}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Security Question Display */}
                                    <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg mb-4">
                                        <p className="text-sm font-semibold text-primary mb-1">
                                            سؤال الأمان:
                                        </p>
                                        <p className="text-foreground font-medium">
                                            {clientData?.security_question}
                                        </p>
                                    </div>

                                    {/* Security Answer */}
                                    <div className="space-y-2">
                                        <Label htmlFor="security-answer" className="text-sm font-semibold">
                                            الإجابة
                                        </Label>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <Input
                                                id="security-answer"
                                                type="text"
                                                value={securityAnswer}
                                                onChange={(e) => {
                                                    setSecurityAnswer(e.target.value);
                                                    setLoginError('');
                                                }}
                                                className="pl-10 bg-secondary/50 border-border"
                                                placeholder="أدخل الإجابة"
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Error Message */}
                            {loginError && (
                                <div className="p-3 bg-destructive/10 border border-destructive/50 rounded text-destructive text-sm animate-fade-in">
                                    {loginError}
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                {loginStep === 'security' && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleBackToCredentials}
                                        className="flex-1"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        رجوع
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                                    disabled={loginLoading}
                                >
                                    {loginLoading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            جاري التحقق...
                                        </span>
                                    ) : loginStep === 'credentials' ? (
                                        <span className="flex items-center gap-2">
                                            التالي
                                            <ArrowLeft className="w-4 h-4 rotate-180" />
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            🚀 تسجيل الدخول
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default TypewriterHero;
