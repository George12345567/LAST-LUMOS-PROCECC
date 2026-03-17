/**
 * ═══════════════════════════════════════════════════════════════════
 * ClientLogin.tsx - PREMIUM LOGIN PAGE
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Redesigned with:
 * - Dark immersive theme matching navbar (#0a0f1c)
 * - Floating card with neon glow borders
 * - Animated constellation background
 * - 2-step flow: Credentials → Security Challenge
 * - ✨ Magic Link tab — passwordless email login with cool UX
 * - Account lockout UI with countdown
 * - Link to signup page
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Lock, User, ShieldCheck, ArrowLeft, ArrowRight,
    AlertTriangle, Eye, EyeOff, KeyRound,
    Mail, Sparkles, CheckCircle2, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

const ClientLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { login, verifySecurity, requestMagicLink, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
    const { language, isArabic, t } = useLanguage();

    // ─── ALL hooks MUST be declared before any conditional return ───
    const [loginMode, setLoginMode] = useState<'password' | 'magic'>('password');
    const [step, setStep] = useState<'credentials' | 'security'>('credentials');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isLocked, setIsLocked] = useState(false);
    const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
    const [clientData, setClientData] = useState<Record<string, unknown> | null>(null);

    // Magic link state
    const [magicEmail, setMagicEmail] = useState('');
    const [magicSent, setMagicSent] = useState(false);
    const [magicLoading, setMagicLoading] = useState(false);
    const [magicError, setMagicError] = useState('');

    const redirectTo = searchParams.get('redirect')
        ? decodeURIComponent(searchParams.get('redirect')!)
        : (location.state as Record<string, unknown>)?.from
            ? ((location.state as Record<string, { pathname?: string }>).from?.pathname)
            : undefined;

    // Generate star field once
    const stars = useMemo(() =>
        Array.from({ length: 60 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2.5 + 0.5,
            delay: Math.random() * 4,
            duration: 2 + Math.random() * 3,
            opacity: 0.2 + Math.random() * 0.6,
        })), []);

    // Redirect if already logged in
    useEffect(() => {
        if (authLoading) return; // Wait for auth to initialize
        if (isAuthenticated) {
            const redirectParam = searchParams.get('redirect');
            if (redirectParam) {
                navigate(decodeURIComponent(redirectParam), { replace: true });
            } else if (isAdmin) {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/clients/profile', { replace: true });
            }
        }
    }, [authLoading, isAuthenticated, isAdmin, navigate, searchParams]);

    // ─── Early returns AFTER all hooks ─────────────────────────────
    // While checking auth, show spinner (prevents flash of login form)
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#060a14]" dir={isArabic ? 'rtl' : 'ltr'}>
                <div className="w-10 h-10 border-3 border-[#64ffda]/30 border-t-[#64ffda] rounded-full animate-spin" />
            </div>
        );
    }

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLocked(false);
        setRemainingAttempts(null);
        setLoading(true);

        try {
            const result = await login(username, password);

            if (result.locked) {
                setIsLocked(true);
                setError(result.error || t('تم قفل الحساب مؤقتًا. حاول مرة أخرى لاحقًا.', 'Account temporarily locked. Please try again later.'));
                setLoading(false);
                return;
            }

            if (result.remainingAttempts !== undefined) {
                setRemainingAttempts(result.remainingAttempts);
            }

            if (result.requiresSecurity && result.client) {
                setClientData(result.client as unknown as Record<string, unknown>);
                setStep('security');
                toast.info(t('مطلوب التحقق الأمني', '🛡️ Security verification required'));
                setLoading(false);
                return;
            }

            if (result.success && result.client) {
                handleSuccessfulLogin(result.client);
                return;
            }

            setError(result.error || t('بيانات الدخول غير صحيحة', 'Invalid credentials'));
        } catch {
            setError(t('حدث خطأ غير متوقع. حاول مرة أخرى.', 'An unexpected error occurred. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const handleSecuritySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const clientId = clientData?.id as string;
            if (!clientId) {
                setError(t('انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.', 'Session expired. Please login again.'));
                setStep('credentials');
                setLoading(false);
                return;
            }

            const result = await verifySecurity(clientId, securityAnswer);

            if (result.success && result.client) {
                toast.success(t('تم التحقق بنجاح', '✅ Verified successfully!'));
                handleSuccessfulLogin(result.client);
            } else {
                setError(result.error || t('إجابة الأمان غير صحيحة', 'Incorrect security answer'));
                setLoading(false);
            }
        } catch {
            setError(t('فشل التحقق', 'Verification failed'));
            setLoading(false);
        }
    };

    const handleSuccessfulLogin = (client: Record<string, unknown>) => {
        const clientUsername = client.username as string;
        const role = String(client.role || 'client');
        if (role === 'admin') {
            toast.success('🎉 Welcome back, Admin!');
        } else {
            toast.success(`🎉 Welcome back, ${clientUsername}!`);
        }
        // Smart redirect: use redirect param > role-based dashboard > home
        const destination = redirectTo || (role === 'admin' ? '/dashboard' : '/clients/profile');
        setTimeout(() => navigate(destination, { replace: true }), 500);
    };

    const handleBack = () => {
        setStep('credentials');
        setSecurityAnswer('');
        setError('');
        setClientData(null);
        setIsLocked(false);
        setRemainingAttempts(null);
    };

    // Magic link submit
    const handleMagicLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMagicError('');
        setMagicLoading(true);

        try {
            const result = await requestMagicLink(magicEmail);
            if (result.success) {
                setMagicSent(true);
                toast.success(t('تم إرسال رابط الدخول إلى بريدك الإلكتروني', '✨ Magic link sent! Check your email'));
            } else {
                setMagicError(result.error || t('حدث خطأ ما', 'Something went wrong'));
            }
        } catch {
            setMagicError(t('فشل إرسال رابط الدخول. حاول مرة أخرى.', 'Failed to send magic link. Please try again.'));
        } finally {
            setMagicLoading(false);
        }
    };

    // Switch login mode
    const switchMode = (mode: 'password' | 'magic') => {
        setLoginMode(mode);
        setError('');
        setMagicError('');
        setMagicSent(false);
        setStep('credentials');
        setClientData(null);
        setIsLocked(false);
        setRemainingAttempts(null);
    };

    return (
        <div lang={language} dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-[#060a14] relative overflow-hidden">
            <EnhancedNavbar />

            <div className="flex items-center justify-center min-h-screen p-4 pt-24">

                {/* ── Constellation background ── */}
                <div className="absolute inset-0 pointer-events-none">
                    {stars.map((star) => (
                        <div
                            key={star.id}
                            className="absolute rounded-full bg-white"
                            style={{
                                left: `${star.x}%`,
                                top: `${star.y}%`,
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                opacity: star.opacity,
                                boxShadow: star.size > 1.5
                                    ? `0 0 ${star.size * 3}px rgba(100,255,218,0.3)`
                                    : 'none',
                                animation: `loginTwinkle ${star.duration}s ease-in-out infinite`,
                                animationDelay: `${star.delay}s`,
                            }}
                        />
                    ))}
                    {/* Gradient orbs */}
                    <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/[0.04] rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#64ffda]/[0.015] rounded-full blur-3xl pointer-events-none" />
                </div>

                {/* ── Login Card ── */}
                <div className="w-full max-w-[440px] relative z-10">

                    {/* ── Brand header ── */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {loginMode === 'magic'
                                ? (magicSent ? t('تحقق من بريدك', 'Check your email') : t('رابط الدخول السريع', 'Magic Link'))
                                : (step === 'credentials' ? t('مرحبًا بعودتك', 'Welcome back') : t('فحص الأمان', 'Security Check'))}
                        </h1>
                        <p className="text-white/40 text-sm">
                            {loginMode === 'magic'
                                ? (magicSent ? t('أرسلنا رابط دخول آمن إلى بريدك الوارد', 'We sent a secure login link to your inbox') : t('سجّل الدخول فورًا عبر رابط يصل إلى بريدك', 'Sign in instantly with a link sent to your email'))
                                : (step === 'credentials'
                                    ? t('سجّل الدخول للوصول إلى بوابة العميل', 'Sign in to access your client portal')
                                    : t('أجب عن سؤال الأمان للمتابعة', 'Answer the security question to continue'))}
                        </p>
                    </div>

                    {/* ── Mode toggle pills ── */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="flex bg-white/[0.04] border border-white/[0.06] rounded-full p-1 gap-0.5">
                            <button
                                type="button"
                                onClick={() => switchMode('password')}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${loginMode === 'password'
                                    ? 'bg-[#64ffda]/10 text-[#64ffda] shadow-[0_0_12px_rgba(100,255,218,0.1)]'
                                    : 'text-white/35 hover:text-white/55'
                                    }`}
                            >
                                <KeyRound className="w-3 h-3" />
                                {t('كلمة المرور', 'Password')}
                            </button>
                            <button
                                type="button"
                                onClick={() => switchMode('magic')}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${loginMode === 'magic'
                                    ? 'bg-[#64ffda]/10 text-[#64ffda] shadow-[0_0_12px_rgba(100,255,218,0.1)]'
                                    : 'text-white/35 hover:text-white/55'
                                    }`}
                            >
                                <Sparkles className="w-3 h-3" />
                                {t('رابط الدخول', 'Magic Link')}
                            </button>
                        </div>
                    </div>

                    {/* ── Step indicators (password mode only) ── */}
                    {loginMode === 'password' && (
                        <div className="flex items-center justify-center gap-2 mb-8">
                            <div className={`h-1 rounded-full transition-all duration-500 ${step === 'credentials' ? 'w-10 bg-[#64ffda]' : 'w-3 bg-[#64ffda]/60'}`} />
                            <div className={`h-1 rounded-full transition-all duration-500 ${step === 'security' ? 'w-10 bg-[#64ffda]' : 'w-3 bg-white/10'}`} />
                        </div>
                    )}

                    {/* ── Card ── */}
                    <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] rounded-2xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">

                        {/* ═══════════════════════════════════════════════════════ */}
                        {/* ──  MAGIC LINK MODE  ──────────────────────────────── */}
                        {/* ═══════════════════════════════════════════════════════ */}
                        {loginMode === 'magic' && !magicSent && (
                            <form onSubmit={handleMagicLinkSubmit} className="space-y-5 animate-login-fade-in">
                                {/* Decorative magic icon */}
                                <div className="flex justify-center mb-2">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#64ffda]/10 to-cyan-500/5 border border-[#64ffda]/10 flex items-center justify-center">
                                            <Mail className="w-7 h-7 text-[#64ffda]/70" />
                                        </div>
                                        {/* Orbiting sparkle */}
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#64ffda]/20 rounded-full flex items-center justify-center animate-magic-pulse">
                                            <Sparkles className="w-3 h-3 text-[#64ffda]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="magic-email" className="text-white/60 text-sm font-medium">
                                        {t('البريد الإلكتروني', 'Email Address')}
                                    </Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors" />
                                        <Input
                                            id="magic-email"
                                            type="email"
                                            value={magicEmail}
                                            onChange={(e) => { setMagicEmail(e.target.value); setMagicError(''); }}
                                            className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all"
                                            placeholder="you@company.com"
                                            required
                                            autoFocus
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                {magicError && (
                                    <div className="p-3.5 bg-red-500/[0.08] border border-red-500/20 rounded-xl text-red-300 text-sm animate-login-fade-in">
                                        {magicError}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={magicLoading}
                                    className="w-full h-12 bg-gradient-to-r from-[#64ffda] to-cyan-400 hover:from-[#4de8c8] hover:to-cyan-500 text-[#0a0f1c] font-semibold rounded-xl shadow-[0_4px_20px_rgba(100,255,218,0.2)] hover:shadow-[0_4px_24px_rgba(100,255,218,0.35)] transition-all duration-300 disabled:opacity-40"
                                >
                                    {magicLoading ? (
                                        <span className="flex items-center gap-2.5">
                                            <div className="w-4 h-4 border-2 border-[#0a0f1c]/30 border-t-[#0a0f1c] rounded-full animate-spin" />
                                            {t('جارٍ الإرسال...', 'Sending...')}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Send className="w-4 h-4" />
                                            {t('إرسال رابط الدخول', 'Send Magic Link')}
                                        </span>
                                    )}
                                </Button>

                                <p className="text-center text-white/25 text-xs leading-relaxed">
                                    {t('سنرسل رابط دخول لمرة واحدة إلى بريدك الإلكتروني.', 'We\'ll send a one-time login link to your email.')}
                                    <br />{t('لا تحتاج إلى كلمة مرور، وينتهي خلال 15 دقيقة.', 'No password needed — it expires in 15 minutes.')}
                                </p>
                            </form>
                        )}

                        {/* ── Magic Link: Success State ── */}
                        {loginMode === 'magic' && magicSent && (
                            <div className="text-center space-y-6 animate-login-fade-in py-4">
                                {/* Animated envelope with check */}
                                <div className="relative flex justify-center">
                                    {/* Radiating rings */}
                                    <div className="absolute w-28 h-28 rounded-full border border-[#64ffda]/5 animate-magic-ring-1" />
                                    <div className="absolute w-36 h-36 rounded-full border border-[#64ffda]/[0.03] animate-magic-ring-2" />

                                    {/* Center icon */}
                                    <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#64ffda]/15 to-cyan-500/5 border border-[#64ffda]/15 flex items-center justify-center animate-magic-float">
                                        <Mail className="w-9 h-9 text-[#64ffda]/80" />
                                        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-[#0d1520] rounded-full border-2 border-[#64ffda]/30 flex items-center justify-center">
                                            <CheckCircle2 className="w-4 h-4 text-[#64ffda]" />
                                        </div>
                                    </div>

                                    {/* Floating sparkles */}
                                    <div className="absolute top-0 right-1/4 animate-magic-sparkle-1">
                                        <Sparkles className="w-3 h-3 text-[#64ffda]/40" />
                                    </div>
                                    <div className="absolute bottom-2 left-1/4 animate-magic-sparkle-2">
                                        <Sparkles className="w-2.5 h-2.5 text-cyan-400/30" />
                                    </div>
                                    <div className="absolute top-1/3 right-1/5 animate-magic-sparkle-3">
                                        <Sparkles className="w-2 h-2 text-[#64ffda]/20" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-white/80 text-sm">
                                        {t('أرسلنا رابط الدخول إلى', 'We sent a login link to')}
                                    </p>
                                    <p className="text-[#64ffda] font-medium text-base tracking-wide">
                                        {magicEmail}
                                    </p>
                                </div>

                                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
                                    <p className="text-white/40 text-xs">
                                        {t('اضغط على الرابط في بريدك لتسجيل الدخول فورًا.', 'Click the link in your email to sign in instantly.')}
                                        <br />{t('تنتهي صلاحية الرابط خلال', 'The link expires in')} <span className="text-[#64ffda]/70 font-medium">15 {t('دقيقة', 'minutes')}</span>.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => { setMagicSent(false); setMagicEmail(''); }}
                                        variant="outline"
                                        className="w-full h-11 border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white/80 hover:bg-white/[0.06] rounded-xl transition-all text-sm"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                                        {t('جرّب بريدًا مختلفًا', 'Try a different email')}
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            setMagicLoading(true);
                                            await requestMagicLink(magicEmail);
                                            setMagicLoading(false);
                                            toast.success(t('تم إعادة إرسال رابط الدخول', '✨ Magic link resent!'));
                                        }}
                                        className="text-white/25 hover:text-[#64ffda]/60 text-xs transition-colors py-1"
                                        disabled={magicLoading}
                                    >
                                        {magicLoading ? t('جارٍ إعادة الإرسال...', 'Resending...') : t('لم يصلك؟ أعد الإرسال', 'Didn\'t receive it? Resend')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ═══════════════════════════════════════════════════════ */}
                        {/* ──  PASSWORD MODE  ────────────────────────────────── */}
                        {/* ═══════════════════════════════════════════════════════ */}

                        {/* ── Step 1: Credentials ── */}
                        {loginMode === 'password' && step === 'credentials' && (
                            <form onSubmit={handleCredentialsSubmit} className="space-y-5 animate-login-fade-in">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-white/60 text-sm font-medium">
                                        {t('اسم المستخدم', 'Username')}
                                    </Label>
                                    <div className="relative group">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors" />
                                        <Input
                                            id="username"
                                            type="text"
                                            value={username}
                                            onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                            className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all"
                                            placeholder={t('أدخل اسم المستخدم', 'Enter your username')}
                                            required
                                            autoFocus
                                            autoComplete="username"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-white/60 text-sm font-medium">
                                        {t('كلمة المرور', 'Password')}
                                    </Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                            className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all"
                                            placeholder={t('أدخل كلمة المرور', 'Enter your password')}
                                            required
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Error / Lockout */}
                                {error && (
                                    <div className={`p-3.5 rounded-xl text-sm animate-login-fade-in flex items-start gap-2.5 ${isLocked
                                        ? 'bg-amber-500/[0.08] border border-amber-500/20 text-amber-300'
                                        : 'bg-red-500/[0.08] border border-red-500/20 text-red-300'
                                        }`}>
                                        {isLocked && <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                                        <span>{error}</span>
                                    </div>
                                )}

                                {remainingAttempts !== null && remainingAttempts <= 3 && !isLocked && (
                                    <div className="p-3 bg-amber-500/[0.06] border border-amber-500/15 rounded-xl text-amber-300/80 text-xs flex items-center gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{isArabic ? `متبقي ${remainingAttempts} محاولة قبل قفل الحساب` : `${remainingAttempts} attempts remaining before account lock`}</span>
                                    </div>
                                )}

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    disabled={loading || isLocked}
                                    className="w-full h-12 bg-gradient-to-r from-[#64ffda] to-cyan-400 hover:from-[#4de8c8] hover:to-cyan-500 text-[#0a0f1c] font-semibold rounded-xl shadow-[0_4px_20px_rgba(100,255,218,0.2)] hover:shadow-[0_4px_24px_rgba(100,255,218,0.35)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2.5">
                                            <div className="w-4 h-4 border-2 border-[#0a0f1c]/30 border-t-[#0a0f1c] rounded-full animate-spin" />
                                            {t('جارٍ التحقق...', 'Verifying...')}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            {t('تسجيل الدخول', 'Sign In')}
                                            <ArrowRight className="w-4 h-4" />
                                        </span>
                                    )}
                                </Button>

                                {/* Forgot password link */}
                                <div className="text-center pt-1">
                                    <Link
                                        to="/forgot-password"
                                        className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-[#64ffda]/70 transition-colors"
                                    >
                                        <KeyRound className="w-3 h-3" />
                                        {t('هل نسيت كلمة المرور؟', 'Forgot your password?')}
                                    </Link>
                                </div>
                            </form>
                        )}

                        {/* ── Step 2: Security Challenge ── */}
                        {loginMode === 'password' && step === 'security' && clientData && (
                            <form onSubmit={handleSecuritySubmit} className="space-y-5 animate-login-fade-in">
                                <div className="p-4 bg-[#64ffda]/[0.05] border border-[#64ffda]/10 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldCheck className="w-4 h-4 text-[#64ffda]/70" />
                                        <p className="text-xs font-medium text-[#64ffda]/70 uppercase tracking-wider">
                                            {t('سؤال الأمان', 'Security Question')}
                                        </p>
                                    </div>
                                    <p className="text-white font-medium text-sm leading-relaxed">
                                        {clientData.security_question as string}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="security-answer" className="text-white/60 text-sm font-medium">
                                        {t('إجابتك', 'Your Answer')}
                                    </Label>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors" />
                                        <Input
                                            id="security-answer"
                                            type="text"
                                            value={securityAnswer}
                                            onChange={(e) => { setSecurityAnswer(e.target.value); setError(''); }}
                                            className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all"
                                            placeholder={t('اكتب إجابتك...', 'Type your answer...')}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3.5 bg-red-500/[0.08] border border-red-500/20 rounded-xl text-red-300 text-sm animate-login-fade-in">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        onClick={handleBack}
                                        variant="outline"
                                        className="flex-1 h-12 border-white/[0.08] bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.12] rounded-xl transition-all"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        {t('رجوع', 'Back')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 h-12 bg-gradient-to-r from-[#64ffda] to-cyan-400 hover:from-[#4de8c8] hover:to-cyan-500 text-[#0a0f1c] font-semibold rounded-xl shadow-[0_4px_20px_rgba(100,255,218,0.2)] hover:shadow-[0_4px_24px_rgba(100,255,218,0.35)] transition-all duration-300"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-[#0a0f1c]/30 border-t-[#0a0f1c] rounded-full animate-spin" />
                                                {t('جارٍ التحقق...', 'Verifying...')}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                {t('تحقق', 'Verify')}
                                                <ShieldCheck className="w-4 h-4" />
                                            </span>
                                        )}
                                    </Button>
                                </div>

                                {/* Can't remember? link */}
                                <div className="text-center pt-1">
                                    <Link
                                        to="/forgot-password"
                                        className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-amber-400/70 transition-colors"
                                    >
                                        <AlertTriangle className="w-3 h-3" />
                                        {t('لا تتذكر الإجابة؟', 'Can\'t remember the answer?')}
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* ── Footer links ── */}
                    <div className="mt-6 flex flex-col items-center gap-3">
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="text-white/30">{t('ليس لديك حساب؟', 'Don\'t have an account?')}</span>
                            <Link
                                to="/client-signup"
                                className="text-[#64ffda]/70 hover:text-[#64ffda] font-medium transition-colors"
                            >
                                {t('إنشاء حساب', 'Sign up')}
                            </Link>
                        </div>
                    </div>
                </div>

            </div>

            {/* ── Keyframes ── */}
            <style>{`
                @keyframes loginTwinkle {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.3); }
                }
                @keyframes loginFadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-login-fade-in {
                    animation: loginFadeIn 0.4s ease-out;
                }
                @keyframes magicPulse {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.15); }
                }
                .animate-magic-pulse {
                    animation: magicPulse 2s ease-in-out infinite;
                }
                @keyframes magicFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                .animate-magic-float {
                    animation: magicFloat 3s ease-in-out infinite;
                }
                @keyframes magicRing1 {
                    0% { opacity: 0.3; transform: scale(0.8); }
                    100% { opacity: 0; transform: scale(1.4); }
                }
                .animate-magic-ring-1 {
                    animation: magicRing1 2.5s ease-out infinite;
                }
                @keyframes magicRing2 {
                    0% { opacity: 0.2; transform: scale(0.7); }
                    100% { opacity: 0; transform: scale(1.5); }
                }
                .animate-magic-ring-2 {
                    animation: magicRing2 3s ease-out infinite 0.5s;
                }
                @keyframes magicSparkle1 {
                    0%, 100% { opacity: 0; transform: translateY(0) scale(0.5); }
                    50% { opacity: 1; transform: translateY(-8px) scale(1); }
                }
                .animate-magic-sparkle-1 {
                    animation: magicSparkle1 2s ease-in-out infinite 0.2s;
                }
                @keyframes magicSparkle2 {
                    0%, 100% { opacity: 0; transform: translateY(0) scale(0.5); }
                    50% { opacity: 1; transform: translateY(-6px) scale(1.1); }
                }
                .animate-magic-sparkle-2 {
                    animation: magicSparkle2 2.4s ease-in-out infinite 0.8s;
                }
                @keyframes magicSparkle3 {
                    0%, 100% { opacity: 0; transform: translateX(0) scale(0.4); }
                    50% { opacity: 1; transform: translateX(6px) scale(1); }
                }
                .animate-magic-sparkle-3 {
                    animation: magicSparkle3 2.8s ease-in-out infinite 0.4s;
                }
            `}</style>
        </div>
    );
};

export default ClientLogin;

