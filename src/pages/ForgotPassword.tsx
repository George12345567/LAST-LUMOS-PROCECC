/**
 * ═══════════════════════════════════════════════════════════════════
 * ForgotPassword.tsx - ACCOUNT RECOVERY PAGE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Multi-step password recovery:
 * Step 1 → Identify: enter username + email to verify ownership
 * Step 2 → Security: answer the security question
 * Step 3 → Reset: set a new password
 * Step 4 → Success confirmation
 *
 * Fallback: if user can't answer security question → contact admin
 *
 * Visual identity matches Login/Signup: dark constellation theme,
 * glassmorphism card, neon #64ffda accents.
 *
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    User, Mail, ShieldCheck, Lock, KeyRound,
    ArrowLeft, ArrowRight, Eye, EyeOff,
    CheckCircle2, AlertTriangle, LifeBuoy, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

type Step = 'identify' | 'security' | 'reset' | 'success' | 'contact-admin';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { language, isArabic, t } = useLanguage();

    const [step, setStep] = useState<Step>('identify');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [clientId, setClientId] = useState('');
    const [failedAttempts, setFailedAttempts] = useState(0);

    // ── Star field ──
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

    // ── Step 1: Identify user by username + email ──
    const handleIdentify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username.trim()) { setError(t('من فضلك أدخل اسم المستخدم', 'Please enter your username')); return; }
        if (!email.trim()) { setError(t('من فضلك أدخل بريدك الإلكتروني', 'Please enter your email')); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError(t('من فضلك أدخل بريدًا إلكترونيًا صحيحًا', 'Please enter a valid email address')); return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/client-reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                    action: 'identify',
                    username: username.trim(),
                    email: email.trim().toLowerCase(),
                }),
            });

            const payload = await response.json().catch(() => ({ success: false, error: 'Failed to identify account' }));
            if (!response.ok || !payload.success || !payload.data) {
                setError(t('لا يوجد حساب بهذا الاسم. راجع البيانات مرة أخرى.', 'No account found with that username. Please double-check.'));
                setLoading(false);
                return;
            }

            // Check if user has a security question
            if (!payload.data.securityQuestion) {
                // No security question set — go directly to contact admin
                setClientId(payload.data.clientId);
                setStep('contact-admin');
                setLoading(false);
                return;
            }

            setClientId(payload.data.clientId);
            setSecurityQuestion(payload.data.securityQuestion);
            setStep('security');
            toast.info(t('تم التحقق من الهوية، أجب الآن عن سؤال الأمان', '🛡️ Identity verified — answer your security question'));
        } catch {
            setError(t('حدث خطأ غير متوقع. حاول مرة أخرى.', 'An unexpected error occurred. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: Verify security answer ──
    const handleSecurityVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!securityAnswer.trim()) { setError(t('من فضلك أدخل إجابتك', 'Please enter your answer')); return; }

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/client-reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                    action: 'verifySecurity',
                    clientId,
                    securityAnswer,
                }),
            });

            const payload = await response.json().catch(() => ({ success: false, error: 'Verification failed' }));
            if (!response.ok || !payload.success) {
                const reason = String(payload.error || 'Incorrect security answer').toLowerCase();
                if (reason.includes('session expired')) {
                    setError(t('انتهت الجلسة. ابدأ من جديد.', 'Session expired. Please start over.'));
                    setStep('identify');
                    setLoading(false);
                    return;
                }

                const newAttempts = failedAttempts + 1;
                setFailedAttempts(newAttempts);

                if (newAttempts >= 3) {
                    setError(t('عدد المحاولات الخاطئة كبير جدًا.', 'Too many incorrect attempts.'));
                    toast.error(t('تم الوصول إلى الحد الأقصى للمحاولات', 'Maximum attempts reached'));
                    setTimeout(() => setStep('contact-admin'), 1500);
                    setLoading(false);
                    return;
                }

                setError(isArabic ? `إجابة غير صحيحة. متبقي ${3 - newAttempts} محاولة.` : `Incorrect answer. ${3 - newAttempts} attempt${3 - newAttempts !== 1 ? 's' : ''} remaining.`);
                setLoading(false);
                return;
            }

            if (!payload.success) {
                setError(t('انتهت الجلسة. ابدأ من جديد.', 'Session expired. Please start over.'));
                setStep('identify');
                setLoading(false);
                return;
            }

            // Security verified!
            toast.success(t('تم التحقق الأمني بنجاح', '✅ Security verified!'));
            setStep('reset');
        } catch {
            setError(t('فشل التحقق. حاول مرة أخرى.', 'Verification failed. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    // ── Step 3: Reset password ──
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!newPassword) { setError(t('من فضلك أدخل كلمة مرور جديدة', 'Please enter a new password')); return; }
        if (newPassword.length < 6) { setError(t('يجب ألا تقل كلمة المرور عن 6 أحرف', 'Password must be at least 6 characters')); return; }
        if (newPassword !== confirmPassword) { setError(t('كلمتا المرور غير متطابقتين', 'Passwords do not match')); return; }

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/client-reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                    username: username.trim(),
                    email: email.trim().toLowerCase(),
                    securityAnswer,
                    newPassword,
                }),
            });

            const payload = await response.json().catch(() => ({ success: false, error: 'Failed to reset password' }));

            if (!response.ok || !payload.success) {
                console.error('Password reset error:', payload.error);
                setError(t('فشل تحديث كلمة المرور. حاول مرة أخرى.', 'Failed to update password. Please try again.'));
                setLoading(false);
                return;
            }

            toast.success(t('تم تحديث كلمة المرور بنجاح', '🎉 Password updated successfully!'));
            setStep('success');
        } catch {
            setError(t('حدث خطأ غير متوقع.', 'An unexpected error occurred.'));
        } finally {
            setLoading(false);
        }
    };

    // ── Step data ──
    const stepMeta: Record<Step, { title: string; desc: string; num: number }> = {
        'identify': { title: t('ابحث عن حسابك', 'Find Your Account'), desc: t('أدخل اسم المستخدم والبريد للتحقق من الملكية', 'Enter your username and email to verify ownership'), num: 1 },
        'security': { title: t('فحص الأمان', 'Security Check'), desc: t('أجب عن السؤال الذي اخترته أثناء التسجيل', 'Answer the question you set during signup'), num: 2 },
        'reset': { title: t('كلمة مرور جديدة', 'New Password'), desc: t('اختر كلمة مرور قوية جديدة', 'Choose a strong new password'), num: 3 },
        'success': { title: t('تم كل شيء', 'All Done!'), desc: t('تمت إعادة تعيين كلمة المرور', 'Your password has been reset'), num: 4 },
        'contact-admin': { title: t('تحتاج مساعدة؟', 'Need Help?'), desc: t('سنساعدك على استعادة الوصول إلى حسابك', 'We\'ll get you back into your account'), num: 0 },
    };

    const currentMeta = stepMeta[step];

    return (
        <div lang={language} dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-[#060a14] relative overflow-hidden">
            <EnhancedNavbar />

            <div className="flex items-center justify-center min-h-screen p-4 pt-24">

                {/* ── Constellation background ── */}
                <div className="absolute inset-0 pointer-events-none">
                    {stars.map(star => (
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
                                    ? `0 0 ${star.size * 3}px rgba(100,255,218,0.3)` : 'none',
                                animation: `forgotTwinkle ${star.duration}s ease-in-out infinite`,
                                animationDelay: `${star.delay}s`,
                            }}
                        />
                    ))}
                    <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/[0.04] rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#64ffda]/[0.015] rounded-full blur-3xl pointer-events-none" />
                </div>

                {/* ── Card ── */}
                <div className="w-full max-w-[460px] relative z-10">

                    {/* ── Header ── */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#64ffda]/[0.06] border border-[#64ffda]/10 mb-5">
                            {step === 'contact-admin'
                                ? <LifeBuoy className="w-7 h-7 text-[#64ffda]/70" />
                                : <KeyRound className="w-7 h-7 text-[#64ffda]/70" />
                            }
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {currentMeta.title}
                        </h1>
                        <p className="text-white/40 text-sm">
                            {currentMeta.desc}
                        </p>
                    </div>

                    {/* ── Step indicators (1-2-3) ── */}
                    {step !== 'contact-admin' && step !== 'success' && (
                        <div className="flex items-center justify-center gap-2 mb-8">
                            {[1, 2, 3].map(s => (
                                <div
                                    key={s}
                                    className={`h-1 rounded-full transition-all duration-500 ${s === currentMeta.num
                                        ? 'w-10 bg-[#64ffda]'
                                        : s < currentMeta.num
                                            ? 'w-6 bg-[#64ffda]/60'
                                            : 'w-3 bg-white/10'
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* ── Glass card ── */}
                    <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] rounded-2xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">

                        {/* ═══ STEP 1: Identify ═══ */}
                        {step === 'identify' && (
                            <form onSubmit={handleIdentify} className="space-y-5 animate-forgot-fade-in">
                                <div className="space-y-2">
                                    <Label htmlFor="forgot-username" className="text-white/60 text-sm font-medium">
                                        {t('اسم المستخدم', 'Username')}
                                    </Label>
                                    <div className="relative group">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors" />
                                        <Input
                                            id="forgot-username"
                                            value={username}
                                            onChange={e => { setUsername(e.target.value); setError(''); }}
                                            className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all"
                                            placeholder={t('أدخل اسم المستخدم', 'Enter your username')}
                                            autoFocus
                                            autoComplete="username"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="forgot-email" className="text-white/60 text-sm font-medium">
                                        {t('البريد الإلكتروني', 'Email Address')}
                                    </Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors" />
                                        <Input
                                            id="forgot-email"
                                            type="email"
                                            value={email}
                                            onChange={e => { setEmail(e.target.value); setError(''); }}
                                            className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all"
                                            placeholder={t('البريد الذي استخدمته عند التسجيل', 'The email used during signup')}
                                            autoComplete="email"
                                        />
                                    </div>
                                    <p className="text-white/20 text-xs pl-1">{t('يجب أن يطابق البريد المسجل لهذا الحساب', 'Must match the email on file for this account')}</p>
                                </div>

                                {error && (
                                    <div className="p-3.5 bg-red-500/[0.08] border border-red-500/20 rounded-xl text-red-300 text-sm animate-forgot-fade-in flex items-start gap-2.5">
                                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-gradient-to-r from-[#64ffda] to-cyan-400 hover:from-[#4de8c8] hover:to-cyan-500 text-[#0a0f1c] font-semibold rounded-xl shadow-[0_4px_20px_rgba(100,255,218,0.2)] hover:shadow-[0_4px_24px_rgba(100,255,218,0.35)] transition-all duration-300 disabled:opacity-40"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-[#0a0f1c]/30 border-t-[#0a0f1c] rounded-full animate-spin" />
                                            {t('جارٍ البحث...', 'Searching...')}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            {t('ابحث عن الحساب', 'Find Account')}
                                            <ArrowRight className="w-4 h-4" />
                                        </span>
                                    )}
                                </Button>

                                {/* Contact admin fallback */}
                                <div className="text-center pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setStep('contact-admin')}
                                        className="inline-flex items-center gap-1.5 text-xs text-white/25 hover:text-amber-400/60 transition-colors"
                                    >
                                        <LifeBuoy className="w-3 h-3" />
                                        {t('لا أتذكر اسم المستخدم أو البريد الإلكتروني', 'I don\'t remember my username or email')}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ═══ STEP 2: Security ═══ */}
                        {step === 'security' && (
                            <form onSubmit={handleSecurityVerify} className="space-y-5 animate-forgot-fade-in">
                                <div className="p-4 bg-[#64ffda]/[0.05] border border-[#64ffda]/10 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldCheck className="w-4 h-4 text-[#64ffda]/70" />
                                        <p className="text-xs font-medium text-[#64ffda]/70 uppercase tracking-wider">
                                            {t('سؤال الأمان', 'Security Question')}
                                        </p>
                                    </div>
                                    <p className="text-white font-medium text-sm leading-relaxed">
                                        {securityQuestion}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="forgot-security-answer" className="text-white/60 text-sm font-medium">
                                        {t('إجابتك', 'Your Answer')}
                                    </Label>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors" />
                                        <Input
                                            id="forgot-security-answer"
                                            value={securityAnswer}
                                            onChange={e => { setSecurityAnswer(e.target.value); setError(''); }}
                                            className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all"
                                            placeholder={t('اكتب إجابتك...', 'Type your answer...')}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3.5 bg-red-500/[0.08] border border-red-500/20 rounded-xl text-red-300 text-sm animate-forgot-fade-in flex items-start gap-2.5">
                                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Attempts warning */}
                                {failedAttempts > 0 && failedAttempts < 3 && (
                                    <div className="p-3 bg-amber-500/[0.06] border border-amber-500/15 rounded-xl text-amber-300/80 text-xs flex items-center gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{isArabic ? `متبقي ${3 - failedAttempts} محاولة` : `${3 - failedAttempts} attempt${3 - failedAttempts !== 1 ? 's' : ''} remaining`}</span>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        onClick={() => { setStep('identify'); setError(''); setFailedAttempts(0); setSecurityAnswer(''); }}
                                        variant="outline"
                                        className="flex-1 h-12 border-white/[0.08] bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.12] rounded-xl transition-all"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" /> {t('رجوع', 'Back')}
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
                                                {t('تحقق', 'Verify')} <ShieldCheck className="w-4 h-4" />
                                            </span>
                                        )}
                                    </Button>
                                </div>

                                {/* Can't answer? */}
                                <div className="text-center pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setStep('contact-admin')}
                                        className="inline-flex items-center gap-1.5 text-xs text-white/25 hover:text-amber-400/60 transition-colors"
                                    >
                                        <AlertTriangle className="w-3 h-3" />
                                        {t('لا أتذكر الإجابة', 'I can\'t remember the answer')}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ═══ STEP 3: Reset Password ═══ */}
                        {step === 'reset' && (
                            <form onSubmit={handleResetPassword} className="space-y-5 animate-forgot-fade-in">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password" className="text-white/60 text-sm font-medium">
                                        {t('كلمة المرور الجديدة', 'New Password')}
                                    </Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors" />
                                        <Input
                                            id="new-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={e => { setNewPassword(e.target.value); setError(''); }}
                                            className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all"
                                            placeholder={t('6 أحرف على الأقل', 'Min 6 characters')}
                                            autoFocus
                                            autoComplete="new-password"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors" tabIndex={-1}>
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Strength indicator */}
                                    {newPassword && (
                                        <div className="flex gap-1 mt-1.5">
                                            {[1, 2, 3, 4].map(i => {
                                                const strength = getPasswordStrength(newPassword);
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength
                                                            ? strength <= 1 ? 'bg-red-400' : strength <= 2 ? 'bg-amber-400' : strength <= 3 ? 'bg-[#64ffda]/60' : 'bg-[#64ffda]'
                                                            : 'bg-white/[0.06]'
                                                            }`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-new-password" className="text-white/60 text-sm font-medium">
                                        {t('تأكيد كلمة المرور الجديدة', 'Confirm New Password')}
                                    </Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors" />
                                        <Input
                                            id="confirm-new-password"
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                                            className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all"
                                            placeholder={t('أعد كتابة كلمة المرور الجديدة', 'Re-type new password')}
                                            autoComplete="new-password"
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors" tabIndex={-1}>
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {confirmPassword && newPassword !== confirmPassword && (
                                        <p className="text-red-400/70 text-xs pl-1 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> {t('كلمتا المرور غير متطابقتين', 'Passwords do not match')}
                                        </p>
                                    )}
                                </div>

                                {error && (
                                    <div className="p-3.5 bg-red-500/[0.08] border border-red-500/20 rounded-xl text-red-300 text-sm animate-forgot-fade-in flex items-start gap-2.5">
                                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-gradient-to-r from-[#64ffda] to-cyan-400 hover:from-[#4de8c8] hover:to-cyan-500 text-[#0a0f1c] font-semibold rounded-xl shadow-[0_4px_20px_rgba(100,255,218,0.2)] hover:shadow-[0_4px_24px_rgba(100,255,218,0.35)] transition-all duration-300 disabled:opacity-40"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-[#0a0f1c]/30 border-t-[#0a0f1c] rounded-full animate-spin" />
                                            {t('جارٍ التحديث...', 'Updating...')}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            {t('إعادة تعيين كلمة المرور', 'Reset Password')}
                                            <KeyRound className="w-4 h-4" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        )}

                        {/* ═══ STEP 4: Success ═══ */}
                        {step === 'success' && (
                            <div className="text-center py-6 space-y-6 animate-forgot-fade-in">
                                <div className="flex justify-center">
                                    <div className="w-20 h-20 rounded-full bg-[#64ffda]/[0.08] border border-[#64ffda]/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-10 h-10 text-[#64ffda]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold text-white">{t('تمت إعادة التعيين', 'Password Reset!')}</h2>
                                    <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
                                        {t('تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.', 'Your password has been successfully updated. You can now sign in with your new password.')}
                                    </p>
                                </div>
                                <Button
                                    onClick={() => navigate('/client-login')}
                                    className="h-12 px-8 bg-gradient-to-r from-[#64ffda] to-cyan-400 hover:from-[#4de8c8] hover:to-cyan-500 text-[#0a0f1c] font-semibold rounded-xl shadow-[0_4px_20px_rgba(100,255,218,0.2)] hover:shadow-[0_4px_24px_rgba(100,255,218,0.35)] transition-all duration-300"
                                >
                                    {t('اذهب إلى تسجيل الدخول', 'Go to Login')} <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        )}

                        {/* ═══ CONTACT ADMIN FALLBACK ═══ */}
                        {step === 'contact-admin' && (
                            <div className="space-y-6 animate-forgot-fade-in">
                                <div className="p-5 bg-amber-500/[0.04] border border-amber-500/10 rounded-xl space-y-3">
                                    <div className="flex items-center gap-2">
                                        <LifeBuoy className="w-4 h-4 text-amber-400/70" />
                                        <p className="text-sm font-medium text-amber-300/80">{t('مساعدة استعادة الحساب', 'Account Recovery Assistance')}</p>
                                    </div>
                                    <p className="text-white/40 text-sm leading-relaxed">
                                        {t('إذا لم تستطع الإجابة عن سؤال الأمان أو لا تتذكر بيانات حسابك، تواصل مع فريق الإدارة وسنساعدك في استعادة الوصول بعد التحقق من هويتك.', 'If you can\'t answer your security question or don\'t remember your account details, please contact our admin team. We\'ll verify your identity and help you regain access.')}
                                    </p>
                                </div>

                                {/* Contact methods */}
                                <div className="space-y-3">
                                    <a
                                        href="mailto:support@lumos.digital?subject=Account Recovery Request"
                                        className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.05] hover:border-white/[0.1] transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-[#64ffda]/[0.06] flex items-center justify-center group-hover:bg-[#64ffda]/[0.1] transition-colors">
                                            <Mail className="w-5 h-5 text-[#64ffda]/70" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white/80">{t('دعم البريد الإلكتروني', 'Email Support')}</p>
                                            <p className="text-xs text-white/30">support@lumos.digital</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-white/20 ml-auto group-hover:text-[#64ffda]/60 transition-colors" />
                                    </a>

                                    <a
                                        href="https://wa.me/1234567890?text=Hi%2C%20I%20need%20help%20recovering%20my%20account"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.05] hover:border-white/[0.1] transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-[#64ffda]/[0.06] flex items-center justify-center group-hover:bg-[#64ffda]/[0.1] transition-colors">
                                            <MessageSquare className="w-5 h-5 text-[#64ffda]/70" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white/80">WhatsApp</p>
                                            <p className="text-xs text-white/30">{t('رد سريع عبر المحادثة', 'Quick response via chat')}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-white/20 ml-auto group-hover:text-[#64ffda]/60 transition-colors" />
                                    </a>
                                </div>

                                {/* Include account info if we have it */}
                                {(username || email) && (
                                    <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                                        <p className="text-xs text-white/25 mb-1.5">{t('أرفق هذه البيانات في رسالتك:', 'Include this in your message:')}</p>
                                        <p className="text-xs text-white/50 font-mono">
                                            {username && <>{t('اسم المستخدم', 'Username')}: {username}</>}
                                            {username && email && <> · </>}
                                            {email && <>{t('البريد', 'Email')}: {email}</>}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        onClick={() => { setStep('identify'); setError(''); setFailedAttempts(0); }}
                                        variant="outline"
                                        className="flex-1 h-12 border-white/[0.08] bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.12] rounded-xl transition-all"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" /> {t('حاول مرة أخرى', 'Try Again')}
                                    </Button>
                                    <Button
                                        onClick={() => navigate('/client-login')}
                                        className="flex-1 h-12 bg-gradient-to-r from-[#64ffda] to-cyan-400 hover:from-[#4de8c8] hover:to-cyan-500 text-[#0a0f1c] font-semibold rounded-xl shadow-[0_4px_20px_rgba(100,255,218,0.2)] hover:shadow-[0_4px_24px_rgba(100,255,218,0.35)] transition-all duration-300"
                                    >
                                        {t('العودة إلى تسجيل الدخول', 'Back to Login')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Footer links ── */}
                    {step !== 'success' && step !== 'contact-admin' && (
                        <div className="mt-6 flex flex-col items-center gap-3">
                            <div className="flex items-center gap-1.5 text-sm">
                                <span className="text-white/30">{t('تتذكر كلمة المرور؟', 'Remember your password?')}</span>
                                <Link
                                    to="/client-login"
                                    className="text-[#64ffda]/70 hover:text-[#64ffda] font-medium transition-colors"
                                >
                                    {t('تسجيل الدخول', 'Sign in')}
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* ── Keyframes ── */}
            <style>{`
                @keyframes forgotTwinkle {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.3); }
                }
                @keyframes forgotFadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-forgot-fade-in {
                    animation: forgotFadeIn 0.4s ease-out;
                }
            `}</style>
        </div>
    );
};

// ── Password strength helper ──
function getPasswordStrength(pwd: string): number {
    let s = 0;
    if (pwd.length >= 6) s++;
    if (pwd.length >= 10) s++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++;
    if (/\d/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
}

export default ForgotPassword;
