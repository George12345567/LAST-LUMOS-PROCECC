/**
 * ═══════════════════════════════════════════════════════════════════
 * ClientSignUp.tsx - PREMIUM SIGN-UP PAGE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Multi-step onboarding for new clients:
 * Step 1 → Company & contact info
 * Step 2 → Credentials (username / password)
 * Step 3 → Security question & answer
 * Step 4 → Success confirmation
 *
 * Visual identity matches ClientLogin: dark constellation theme,
 * glassmorphism card, neon #64ffda accents.
 *
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { hashPassword, hashSecurityAnswer } from '@/lib/secretHash';
import { useAuth } from '@/context/AuthContext';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Building2, User, Lock, Mail, Phone, ShieldCheck,
    ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle2, Check,
    Sparkles, AlertTriangle, Palette, Plus, X, Globe, Image
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { VerifiedPhoneInput } from '@/components/shared/VerifiedPhoneInput';

// ─── Security question options ──────────────────────────────────

const SECURITY_QUESTIONS = [
    { en: 'What is the name of your first pet?', ar: 'ما اسم أول حيوان أليف لديك؟' },
    { en: 'What city were you born in?', ar: 'في أي مدينة وُلدت؟' },
    { en: 'What is your mother\'s maiden name?', ar: 'ما اسم عائلة والدتك قبل الزواج؟' },
    { en: 'What was the name of your first school?', ar: 'ما اسم أول مدرسة التحقت بها؟' },
    { en: 'What is your favourite movie?', ar: 'ما هو فيلمك المفضل؟' },
    { en: 'What was the make of your first car?', ar: 'ما نوع أول سيارة امتلكتها؟' },
    { en: 'What is your favourite food?', ar: 'ما هي أكلك المفضل؟' },
    { en: 'What street did you grow up on?', ar: 'في أي شارع نشأت؟' },
];

const BRAND_COLOR_PRESETS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6', '#1e293b', '#64748b',
];

const RESERVED_USERNAMES = new Set(['GEORGE', 'ADMIN', 'ROOT', 'SUPERADMIN', 'SYSTEM']);

type Step = 1 | 2 | 3 | 4;
type PortalLang = 'ar' | 'en';

interface FormData {
    companyName: string;
    contactName: string;
    brandIdentity: string;
    logoUrl: string;
    coverImageUrl: string;
    brandColors: string[];
    email: string;
    phone: string;
    website: string;
    username: string;
    password: string;
    confirmPassword: string;
    securityQuestion: string;
    securityAnswer: string;
}

const INITIAL_FORM: FormData = {
    companyName: '',
    contactName: '',
    brandIdentity: '',
    logoUrl: '',
    coverImageUrl: '',
    brandColors: [],
    email: '',
    phone: '',
    website: '',
    username: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
};

const normalizePhoneNumber = (value: string) => value.replace(/\D/g, '');

const isValidPhoneNumber = (phone: string) => {
    const digits = normalizePhoneNumber(phone);
    if (digits.length < 8 || digits.length > 15) return false;
    return /^[+\d\s()-]+$/.test(phone);
};

const normalizeWebsite = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return '';

    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
        const parsed = new URL(withProtocol);
        return parsed.toString();
    } catch {
        return null;
    }
};

const ClientSignUp = () => {
    const navigate = useNavigate();
    const { login: authLogin, isAuthenticated, loading: authLoading } = useAuth();
    const { language, setLanguage } = useLanguage();
    const [lang, setLang] = useState<PortalLang>(language);
    const isArabic = lang === 'ar';
    const t = useCallback((ar: string, en: string) => (isArabic ? ar : en), [isArabic]);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (authLoading) return; // Wait for auth to initialize
        if (isAuthenticated) {
            navigate('/clients/profile', { replace: true });
        }
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        setLang(language);
    }, [language]);

    useEffect(() => {
        setLanguage(lang);
        localStorage.setItem('lumos_signup_lang', lang);
    }, [lang, setLanguage]);

    const [step, setStep] = useState<Step>(1);
    const [requestsBranding, setRequestsBranding] = useState(false);
    const [form, setForm] = useState<FormData>(INITIAL_FORM);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [coverUploading, setCoverUploading] = useState(false);
    const [newBrandColor, setNewBrandColor] = useState('#64ffda');
    const [error, setError] = useState('');
    const normalizedPhonePreview = normalizePhoneNumber(form.phone);
    const websitePreview = normalizeWebsite(form.website);
    const companyInitials = (form.companyName || form.contactName || 'LU')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() || '')
        .join('');
    const requiredChecklist = [
        Boolean(form.companyName.trim()),
        Boolean(form.contactName.trim()),
        Boolean(form.email.trim()),
        isValidPhoneNumber(form.phone),
        Boolean(form.brandIdentity.trim()),
    ];
    const completedRequiredCount = requiredChecklist.filter(Boolean).length;
    const currentStepLabel = step === 1 ? t('إعداد الهوية', 'Brand Setup') : step === 2 ? t('بيانات الدخول', 'Credentials') : step === 3 ? t('الاسترداد', 'Recovery') : t('مكتمل', 'Complete');

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

    // ── Helpers ──
    const update = useCallback((key: keyof FormData, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setError('');
    }, []);

    const uploadAsset = useCallback(async (file: File, folder: string) => {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${folder}/${Date.now()}-${safeName}`;
        const { error: upErr } = await supabase.storage
            .from('client-assets')
            .upload(path, file, { upsert: true });

        if (upErr) {
            throw upErr;
        }

        const { data: urlData } = supabase.storage.from('client-assets').getPublicUrl(path);
        return urlData.publicUrl;
    }, []);

    // ── Validation per step ──
    const validateStep = (s: Step): string | null => {
        if (s === 1) {
            if (!form.companyName.trim()) return t('اسم الشركة أو البراند مطلوب', 'Company / Brand name is required');
            if (!form.contactName.trim()) return t('اسم الشخص المسؤول مطلوب', 'Contact person name is required');
            if (form.contactName.trim().length < 2) return t('اسم الشخص المسؤول يجب أن يكون حرفين على الأقل', 'Contact person name must be at least 2 characters');
            if (!form.brandIdentity.trim()) return t('وصف الهوية مطلوب', 'Brand identity is required');
            if (form.brandIdentity.trim().length < 10) return t('وصف الهوية يجب أن يكون 10 أحرف على الأقل', 'Brand identity must be at least 10 characters');
            if (!form.email.trim()) return t('البريد الإلكتروني مطلوب', 'Email address is required');
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
                return t('من فضلك أدخل بريدًا إلكترونيًا صحيحًا', 'Please enter a valid email address');
            if (!form.phone.trim()) return t('رقم الهاتف مطلوب', 'Phone number is required');

            if (!isValidPhoneNumber(form.phone))
                return t('من فضلك أدخل رقم هاتف صحيحًا من 8 إلى 15 رقمًا', 'Please enter a valid phone number (8-15 digits)');

            if (form.website.trim() && !normalizeWebsite(form.website.trim()))
                return t('من فضلك أدخل رابط موقع صحيح', 'Please enter a valid website URL');
        }
        if (s === 2) {
            if (!form.username.trim()) return t('اسم المستخدم مطلوب', 'Username is required');
            if (form.username.trim().length < 3) return t('اسم المستخدم يجب أن يكون 3 أحرف على الأقل', 'Username must be at least 3 characters');
            if (/\s/.test(form.username.trim())) return t('اسم المستخدم لا يمكن أن يحتوي على مسافات', 'Username cannot contain spaces');
            if (RESERVED_USERNAMES.has(form.username.trim().toUpperCase())) {
                return t('اسم المستخدم غير متاح. اختر اسمًا آخر.', 'This username is reserved. Please choose another one.');
            }
            if (!form.password) return t('كلمة المرور مطلوبة', 'Password is required');
            if (form.password.length < 6) return t('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'Password must be at least 6 characters');
            if (form.password !== form.confirmPassword) return t('كلمتا المرور غير متطابقتين', 'Passwords do not match');
        }
        if (s === 3) {
            if (!form.securityQuestion) return t('من فضلك اختر سؤال أمان', 'Please select a security question');
            if (!form.securityAnswer.trim()) return t('إجابة سؤال الأمان مطلوبة', 'Security answer is required');
            if (form.securityAnswer.trim().length < 2) return t('الإجابة يجب أن تكون حرفين على الأقل', 'Answer must be at least 2 characters');
        }
        return null;
    };

    // ── Next / Back ──
    const handleNext = () => {
        const err = validateStep(step);
        if (err) { setError(err); return; }
        setError('');
        setStep((step + 1) as Step);
    };

    const handleBack = () => {
        setError('');
        if (step === 1) { navigate('/client-login'); return; }
        setStep((step - 1) as Step);
    };

    const handleLogoUpload = async (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError(t('اللوجو يجب أن يكون ملف صورة', 'Logo must be an image file'));
            return;
        }

        setLogoUploading(true);
        setError('');
        try {
            const url = await uploadAsset(file, 'brand-logos');
            update('logoUrl', url);
            toast.success(t('تم رفع اللوجو بنجاح', 'Logo uploaded successfully'));
        } catch {
            setError(t('فشل رفع اللوجو. حاول مرة أخرى.', 'Failed to upload logo. Please try again.'));
        } finally {
            setLogoUploading(false);
        }
    };

    const handleCoverUpload = async (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError(t('صورة الغلاف يجب أن تكون ملف صورة', 'Cover image must be an image file'));
            return;
        }

        setCoverUploading(true);
        setError('');
        try {
            const url = await uploadAsset(file, 'cover-images');
            update('coverImageUrl', url);
            toast.success(t('تم رفع صورة الغلاف بنجاح', 'Cover image uploaded successfully'));
        } catch {
            setError(t('فشل رفع صورة الغلاف. حاول مرة أخرى.', 'Failed to upload cover image. Please try again.'));
        } finally {
            setCoverUploading(false);
        }
    };

    const addBrandColor = (hex: string) => {
        const color = hex.trim().toLowerCase();
        if (!/^#([a-f0-9]{3}|[a-f0-9]{6})$/i.test(color)) {
            setError(t('من فضلك اختر لونًا صحيحًا', 'Please choose a valid color.'));
            return;
        }
        setForm(prev => {
            if (prev.brandColors.includes(color)) return prev;
            return { ...prev, brandColors: [...prev.brandColors, color] };
        });
    };

    const removeBrandColor = (hex: string) => {
        setForm(prev => ({ ...prev, brandColors: prev.brandColors.filter(c => c !== hex) }));
    };

    // ── Submit (final step) ──
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const err = validateStep(3);
        if (err) { setError(err); return; }

        setLoading(true);
        setError('');

        try {
            const normalizedPhone = normalizePhoneNumber(form.phone);
            const normalizedWebsite = normalizeWebsite(form.website);
            const passwordHash = await hashPassword(form.password);
            const securityAnswerHash = await hashSecurityAnswer(form.securityAnswer);
            const normalizedUsername = form.username.trim();

            if (RESERVED_USERNAMES.has(normalizedUsername.toUpperCase())) {
                setError(t('اسم المستخدم غير متاح. اختر اسمًا آخر.', 'This username is reserved. Please choose another one.'));
                setLoading(false);
                return;
            }

            // 1. Check if username already exists
            const { data: existing } = await supabase
                .from('clients')
                .select('id')
                .eq('username', normalizedUsername)
                .maybeSingle();

            if (existing) {
                setError(t('اسم المستخدم مستخدم بالفعل. اختر اسمًا آخر.', 'This username is already taken. Please choose another.'));
                setLoading(false);
                return;
            }

            // 2. Check if email already exists
            const { data: emailExists } = await supabase
                .from('clients')
                .select('id')
                .eq('email', form.email.trim().toLowerCase())
                .maybeSingle();

            if (emailExists) {
                setError(t('يوجد حساب بهذا البريد الإلكتروني بالفعل.', 'An account with this email already exists.'));
                setLoading(false);
                return;
            }

            // 3. Check if phone already exists
            const { data: phoneExists } = await supabase
                .from('clients')
                .select('id')
                .eq('phone_number', normalizedPhone)
                .maybeSingle();

            if (phoneExists) {
                setError(t('يوجد حساب بهذا الرقم بالفعل.', 'An account with this phone number already exists.'));
                setLoading(false);
                return;
            }

            // 4. Insert new client
            const { error: insertError } = await supabase
                .from('clients')
                .insert({
                    company_name: form.companyName.trim(),
                    display_name: form.contactName.trim(),
                    bio: (requestsBranding ? `[CLIENT REQUESTED FULL BRAND IDENTITY A-Z]\n\n` : '') + form.brandIdentity.trim(),
                    logo_url: form.logoUrl.trim() || null,
                    cover_image_url: form.coverImageUrl.trim() || null,
                    brand_colors: form.brandColors,
                    website: normalizedWebsite || null,
                    email: form.email.trim().toLowerCase(),
                    phone_number: normalizedPhone,
                    role: 'client',
                    username: normalizedUsername,
                    password: passwordHash,
                    password_hash: passwordHash,
                    security_question: form.securityQuestion,
                    security_answer: securityAnswerHash,
                    status: 'pending',
                    progress: 0,
                    login_attempts: 0,
                    email_verified: false,
                    profile_last_media_update: form.logoUrl.trim() || form.coverImageUrl.trim() ? new Date().toISOString() : null,
                    created_at: new Date().toISOString(),
                });

            if (insertError) {
                console.error('Signup insert error:', insertError);
                setError(t('حدث خطأ ما. حاول مرة أخرى.', 'Something went wrong. Please try again.'));
                setLoading(false);
                return;
            }

            // 5. Auto-login the new user via AuthContext
            const loginResult = await authLogin(form.username.trim(), form.password);
            if (loginResult.success) {
                toast.success(t('تم إنشاء الحساب وتسجيل الدخول بنجاح', 'Account created and logged in successfully'));
            } else {
                // Login failed but signup succeeded — still show success
                toast.success(t('تم إنشاء الحساب بنجاح', 'Account created successfully'));
            }
            setStep(4);
        } catch {
            setError(t('حدث خطأ غير متوقع. حاول مرة أخرى.', 'An unexpected error occurred. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    // ── Step titles / descriptions ──
    const stepMeta: Record<Step, { title: string; desc: string }> = {
        1: { title: t('بيانات الشركة', 'Your Company'), desc: t('عرّفنا على نشاطك والشخص المسؤول الأساسي', 'Tell us about your business and primary contact') },
        2: { title: t('إنشاء الحساب', 'Create Account'), desc: t('جهّز بيانات الدخول الخاصة بك', 'Set up your login credentials') },
        3: { title: t('تأمين الحساب', 'Secure Account'), desc: t('أضف سؤال أمان لاسترداد الحساب لاحقًا', 'Add a security question for account recovery') },
        4: { title: t('تم كل شيء', 'All Done!'), desc: t('حسابك أصبح جاهزًا', 'Your account is ready') },
    };

    return (
        <div lang={lang} dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-[#060a14] relative overflow-hidden">
            <EnhancedNavbar />

            <div className="flex items-center justify-center min-h-screen p-4 pt-24 pb-10">

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
                                animation: `signupTwinkle ${star.duration}s ease-in-out infinite`,
                                animationDelay: `${star.delay}s`,
                            }}
                        />
                    ))}
                    <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/[0.04] rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#64ffda]/[0.015] rounded-full blur-3xl pointer-events-none" />
                </div>

                {/* ── Card ── */}
                <div className="relative z-10 w-full max-w-6xl">

                    <div className="w-full max-w-[760px] mx-auto">
                        {/* ── Page header ── */}
                        <div className="mb-6 text-center lg:mb-8 lg:text-left">
                            <p className="mb-2 text-[11px] uppercase tracking-[0.24em] text-[#64ffda]/70">{t('إعداد حساب العميل', 'Client account setup')}</p>
                            <h1 className="mb-2 text-3xl font-bold text-white lg:text-4xl">
                                {stepMeta[step].title}
                            </h1>
                            <p className="text-sm text-white/40 lg:max-w-xl">
                                {stepMeta[step].desc}
                            </p>
                        </div>

                        {/* ── Step indicators (1-2-3) ── */}
                        {step < 4 && (
                            <div className="mb-6 rounded-[24px] border border-white/[0.06] bg-white/[0.025] p-4 lg:mb-8">
                                <div className="flex items-center justify-between gap-3">
                                    {[1, 2, 3].map(s => (
                                        <div key={s} className="min-w-0 flex-1">
                                            <div className="mb-2 flex items-center justify-between gap-2">
                                                <span className={`text-xs font-semibold uppercase tracking-[0.16em] ${s <= step ? 'text-[#64ffda]' : 'text-white/25'}`}>{t('الخطوة', 'Step')} {s}</span>
                                                <span className={`text-[10px] uppercase tracking-[0.14em] ${s < step ? 'text-emerald-300' : s === step ? 'text-white/60' : 'text-white/20'}`}>{s < step ? t('تمت', 'Done') : s === step ? t('الحالية', 'Current') : t('التالي', 'Next')}</span>
                                            </div>
                                            <div className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'bg-[#64ffda]' : s < step ? 'bg-[#64ffda]/55' : 'bg-white/10'}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Glass card ── */}
                        <div className="rounded-[28px] border border-white/[0.06] bg-white/[0.03] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-8">
                            {step < 4 && (
                                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/[0.06] bg-[linear-gradient(135deg,rgba(100,255,218,0.07)_0%,rgba(255,255,255,0.02)_100%)] px-4 py-3">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{t('ملخص الإعداد', 'Setup snapshot')}</p>
                                        <p className="mt-1 text-xs text-white/45">{t('الحقول المطلوبة مميزة بنجمة، والحقول الاختيارية تساعد الفريق على تخصيص الحساب أسرع.', 'Required items are marked with an asterisk. Optional items help the team personalize your portal faster.')}</p>
                                    </div>
                                    <div className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/70">
                                        {t('الخطوة', 'Step')} {step} {t('من', 'of')} 3
                                    </div>
                                </div>
                            )}

                            {/* ═══ STEP 1: Company info ═══ */}
                            {step === 1 && (
                                <div className="space-y-5 animate-signup-fade-in">
                                    {/* Company name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName" className="text-white/60 text-sm font-medium">
                                            {t('اسم الشركة / البراند', 'Company / Brand Name')} <span className="text-[#64ffda]">*</span>
                                        </Label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors" />
                                            <Input
                                                id="companyName"
                                                value={form.companyName}
                                                onChange={e => update('companyName', e.target.value)}
                                                className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all"
                                                placeholder={t('مثال: لموس ستوديو', 'e.g. Acme Inc.')}
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    {/* Contact name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="contactName" className="text-white/60 text-sm font-medium">
                                            {t('الشخص المسؤول', 'Contact Person')} <span className="text-[#64ffda]">*</span>
                                        </Label>
                                        <div className="relative group">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors" />
                                            <Input
                                                id="contactName"
                                                value={form.contactName}
                                                onChange={e => update('contactName', e.target.value)}
                                                className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all"
                                                placeholder={t('مثال: أحمد علي', 'e.g. Ahmed Ali')}
                                                autoComplete="name"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-white/60 text-sm font-medium">
                                            {t('البريد الإلكتروني', 'Email Address')} <span className="text-[#64ffda]">*</span>
                                        </Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={form.email}
                                                onChange={e => update('email', e.target.value)}
                                                dir="ltr"
                                                className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all text-left"
                                                placeholder="you@company.com"
                                                autoComplete="email"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <VerifiedPhoneInput
                                            label={t('رقم الهاتف / واتساب', 'Phone Number / WhatsApp')}
                                            value={form.phone}
                                            onChange={(phone) => update('phone', phone)}
                                            onVerify={(phone) => {
                                                update('phone', phone);
                                                setIsPhoneVerified(true);
                                            }}
                                            isArabic={isArabic}
                                            required
                                            inputClassName="[&>input]:bg-white/[0.04] [&>input]:border-white/[0.08] [&>input]:text-white"
                                        />
                                        <p className="text-white/20 text-xs pl-1">{t('من 8 إلى 15 رقمًا. هذا الرقم مطلوب للمتابعة واسترداد الحساب.', '8-15 digits. This number is required for follow-up and account recovery.')}</p>
                                    </div>

                                    {/* Brand identity */}
                                    <div className="space-y-2">
                                        <Label htmlFor="brandIdentity" className="text-white/60 text-sm font-medium">
                                            {t('وصف الهوية', 'Brand Identity')} <span className="text-[#64ffda]">*</span>
                                        </Label>
                                        <textarea
                                            id="brandIdentity"
                                            value={form.brandIdentity}
                                            onChange={e => update('brandIdentity', e.target.value)}
                                            className="w-full min-h-[90px] px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all outline-none text-sm resize-none"
                                            placeholder={t('اكتب وصفًا قصيرًا للهوية، النبرة، وما الذي يميزك...', 'Describe your brand identity, tone, and what makes you unique...')}
                                        />
                                        <div className="flex items-center justify-between gap-3 text-[11px] text-white/25">
                                            <span>{t('استخدم من جملة إلى ثلاث جمل قصيرة حتى يفهم الفريق نبرة البراند بسرعة.', 'Use 1-3 short sentences. This helps the team understand your tone immediately.')}</span>
                                            <span>{form.brandIdentity.trim().length} {t('حرف', 'chars')}</span>
                                        </div>
                                    </div>

                                    {/* Brand Identity CTA */}
                                    <div className={`mt-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${requestsBranding ? 'border-[#64ffda] bg-[#64ffda]/10 shadow-[0_0_15px_rgba(100,255,218,0.15)]' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]'}`} onClick={() => setRequestsBranding(!requestsBranding)}>
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-0.5 p-2 rounded-lg ${requestsBranding ? 'bg-[#64ffda] text-[#0a0f1c]' : 'bg-white/10 text-white/50'}`}>
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-bold mb-1 transition-colors ${requestsBranding ? 'text-[#64ffda]' : 'text-white'}`}>
                                                    {t('ليس لديك هوية بصرية كاملة؟', "Don't have a full brand identity yet?")}
                                                </h4>
                                                <p className="text-xs text-white/50 leading-relaxed mb-3">
                                                    {t('دع فريقنا يصمم هوية علامتك التجارية من الألف إلى الياء (شعار، ألوان، مطبوعات، ملف تعريفي، وغيرها).', 'Let our team design your brand identity from A to Z (Logo, Colors, Stationery, Profile, and more).')}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${requestsBranding ? 'border-[#64ffda] bg-[#64ffda] text-[#0a0f1c]' : 'border-white/20 bg-transparent text-transparent'}`}>
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${requestsBranding ? 'text-[#64ffda]' : 'text-white/40'}`}>
                                                        {requestsBranding ? t('نعم، أضف هذا لطلبي', 'YES, ADD THIS TO MY REQUEST') : t('اختر هذه الخدمة', 'SELECT THIS SERVICE')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Website */}
                                    <div className="space-y-2">
                                        <Label htmlFor="website" className="text-white/60 text-sm font-medium">
                                            {t('الموقع أو الرابط الأساسي', 'Website or Main Link')} <span className="text-white/25 text-xs">{t('(اختياري)', '(optional)')}</span>
                                        </Label>
                                        <div className="relative group">
                                            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors" />
                                            <Input
                                                id="website"
                                                type="url"
                                                value={form.website}
                                                onChange={e => update('website', e.target.value)}
                                                dir="ltr"
                                                className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all text-left"
                                                placeholder={t('example.com أو https://example.com', 'example.com or https://example.com')}
                                                autoComplete="url"
                                            />
                                        </div>
                                    </div>

                                    {/* Logo upload */}
                                    <div className="space-y-2">
                                        <Label htmlFor="brandLogo" className="text-white/60 text-sm font-medium">
                                            {t('لوجو البراند', 'Brand Logo')} <span className="text-white/25 text-xs">{t('(اختياري)', '(optional)')}</span>
                                        </Label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                id="brandLogo"
                                                type="file"
                                                accept="image/*"
                                                onChange={e => void handleLogoUpload(e.target.files?.[0] || null)}
                                                className="block w-full text-xs text-white/70 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#64ffda]/20 file:text-[#64ffda] hover:file:bg-[#64ffda]/30 file:cursor-pointer cursor-pointer"
                                            />
                                            {logoUploading && (
                                                <div className="w-4 h-4 border-2 border-[#64ffda]/30 border-t-[#64ffda] rounded-full animate-spin" />
                                            )}
                                        </div>
                                        {form.logoUrl && (
                                            <div className="mt-2 inline-flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2">
                                                <img src={form.logoUrl} alt="Uploaded logo" className="h-10 w-10 rounded-lg bg-white object-cover" />
                                                <div>
                                                    <p className="text-[11px] font-semibold text-[#64ffda]">{t('تم رفع اللوجو', 'Logo uploaded')}</p>
                                                    <p className="text-[10px] text-white/30">{t('ستُستخدم هذه المعاينة داخل هوية الحساب المبدئية.', 'This preview will be used in your initial portal identity.')}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cover upload */}
                                    <div className="space-y-2">
                                        <Label htmlFor="coverImage" className="text-white/60 text-sm font-medium">
                                            {t('صورة الغلاف', 'Cover Image')} <span className="text-white/25 text-xs">{t('(اختياري)', '(optional)')}</span>
                                        </Label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                id="coverImage"
                                                type="file"
                                                accept="image/*"
                                                onChange={e => void handleCoverUpload(e.target.files?.[0] || null)}
                                                className="block w-full text-xs text-white/70 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#64ffda]/20 file:text-[#64ffda] hover:file:bg-[#64ffda]/30 file:cursor-pointer cursor-pointer"
                                            />
                                            {coverUploading && (
                                                <div className="w-4 h-4 border-2 border-[#64ffda]/30 border-t-[#64ffda] rounded-full animate-spin" />
                                            )}
                                        </div>
                                        {form.coverImageUrl && (
                                            <div className="mt-2 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]">
                                                <img src={form.coverImageUrl} alt={t('معاينة صورة الغلاف', 'Cover image preview')} className="h-28 w-full object-cover" />
                                                <div className="px-3 py-2 text-[10px] text-white/35">{t('ستظهر هذه الصورة في رأس الحساب ومعاينة الهوية.', 'This image will appear in the account header and identity preview.')}</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Brand colors */}
                                    <div className="space-y-2">
                                        <Label className="text-white/60 text-sm font-medium">
                                            {t('ألوان البراند', 'Brand Colors')} <span className="text-white/25 text-xs">{t('(اختياري)', '(optional)')}</span>
                                        </Label>

                                        {form.brandColors.length > 0 ? (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {form.brandColors.map(c => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => removeBrandColor(c)}
                                                        className="group relative flex items-center gap-2 px-2 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:border-red-400/40 transition-colors"
                                                        title="Remove color"
                                                    >
                                                        <span className="w-4 h-4 rounded-md border border-white/30" style={{ backgroundColor: c }} />
                                                        <span className="text-[11px] text-white/70 font-mono">{c}</span>
                                                        <X className="w-3 h-3 text-white/30 group-hover:text-red-300" />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-white/30 mb-2">{t('لا توجد ألوان مختارة بعد.', 'No brand colors selected yet.')}</p>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <input
                                                    type="color"
                                                    value={newBrandColor}
                                                    onChange={e => setNewBrandColor(e.target.value)}
                                                    className="w-11 h-11 rounded-xl border border-white/[0.12] cursor-pointer p-1 bg-white/[0.04]"
                                                />
                                                <Palette className="absolute -top-1 -right-1 w-3 h-3 text-[#64ffda]/70" />
                                            </div>
                                            <Input
                                                value={newBrandColor}
                                                onChange={e => setNewBrandColor(e.target.value)}
                                                dir="ltr"
                                                className="h-11 max-w-[130px] bg-white/[0.04] border-white/[0.08] text-white font-mono text-xs text-left"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => addBrandColor(newBrandColor)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#64ffda]/20 border border-[#64ffda]/40 text-[#64ffda] hover:bg-[#64ffda]/25 transition-colors text-xs font-semibold"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> {t('إضافة', 'Add')}
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {BRAND_COLOR_PRESETS.map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => addBrandColor(c)}
                                                    className="w-7 h-7 rounded-lg border border-white/20 hover:scale-110 transition-transform"
                                                    style={{ backgroundColor: c }}
                                                    title={c}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* ═══ STEP 2: Credentials ═══ */}
                            {step === 2 && (
                                <div className="space-y-5 animate-signup-fade-in">
                                    {/* Username */}
                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="text-white/60 text-sm font-medium">
                                            {t('اسم المستخدم', 'Username')} <span className="text-[#64ffda]">*</span>
                                        </Label>
                                        <div className="relative group">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors" />
                                            <Input
                                                id="username"
                                                value={form.username}
                                                onChange={e => update('username', e.target.value)}
                                                dir="ltr"
                                                className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all text-left"
                                                placeholder={t('اختر اسم مستخدم فريدًا', 'Choose a unique username')}
                                                autoFocus
                                                autoComplete="username"
                                            />
                                        </div>
                                        <p className="text-white/20 text-xs pl-1">{t('بدون مسافات وبحد أدنى 3 أحرف', 'No spaces, min 3 characters')}</p>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-white/60 text-sm font-medium">
                                            {t('كلمة المرور', 'Password')} <span className="text-[#64ffda]">*</span>
                                        </Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors" />
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={form.password}
                                                onChange={e => update('password', e.target.value)}
                                                className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all"
                                                placeholder={t('6 أحرف على الأقل', 'Min 6 characters')}
                                                autoComplete="new-password"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors" tabIndex={-1}>
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        {/* Strength indicator */}
                                        {form.password && (
                                            <div className="flex gap-1 mt-1.5">
                                                {[1, 2, 3, 4].map(i => {
                                                    const strength = getPasswordStrength(form.password);
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

                                    {/* Confirm password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-white/60 text-sm font-medium">
                                            {t('تأكيد كلمة المرور', 'Confirm Password')} <span className="text-[#64ffda]">*</span>
                                        </Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors" />
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirm ? 'text' : 'password'}
                                                value={form.confirmPassword}
                                                onChange={e => update('confirmPassword', e.target.value)}
                                                className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all"
                                                placeholder={t('أعد كتابة كلمة المرور', 'Re-type your password')}
                                                autoComplete="new-password"
                                            />
                                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors" tabIndex={-1}>
                                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {form.confirmPassword && form.password !== form.confirmPassword && (
                                            <p className="text-red-400/70 text-xs pl-1 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> {t('كلمتا المرور غير متطابقتين', 'Passwords do not match')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ═══ STEP 3: Security ═══ */}
                            {step === 3 && (
                                <form onSubmit={handleSubmit} className="space-y-5 animate-signup-fade-in">
                                    {/* Security question select */}
                                    <div className="space-y-2">
                                        <Label htmlFor="securityQuestion" className="text-white/60 text-sm font-medium">
                                            {t('سؤال الأمان', 'Security Question')} <span className="text-[#64ffda]">*</span>
                                        </Label>
                                        <div className="relative group">
                                            <ShieldCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors pointer-events-none" />
                                            <select
                                                id="securityQuestion"
                                                value={form.securityQuestion}
                                                onChange={e => update('securityQuestion', e.target.value)}
                                                className="w-full pl-11 pr-4 h-12 bg-white/[0.04] border border-white/[0.08] text-white rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all appearance-none cursor-pointer text-sm [&>option]:bg-[#0a0f1c] [&>option]:text-white"
                                            >
                                                <option value="" disabled>{t('اختر سؤالًا...', 'Choose a question...')}</option>
                                                {SECURITY_QUESTIONS.map(q => (
                                                    <option key={q.en} value={q.en}>{isArabic ? q.ar : q.en}</option>
                                                ))}
                                            </select>
                                            {/* Custom chevron */}
                                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security answer */}
                                    <div className="space-y-2">
                                        <Label htmlFor="securityAnswer" className="text-white/60 text-sm font-medium">
                                            {t('إجابتك', 'Your Answer')} <span className="text-[#64ffda]">*</span>
                                        </Label>
                                        <div className="relative group">
                                            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#64ffda]/60 transition-colors" />
                                            <Input
                                                id="securityAnswer"
                                                value={form.securityAnswer}
                                                onChange={e => update('securityAnswer', e.target.value)}
                                                className="pl-11 h-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 rounded-xl focus:border-[#64ffda]/40 focus:ring-1 focus:ring-[#64ffda]/20 focus:bg-white/[0.06] transition-all"
                                                placeholder={t('اكتب إجابتك...', 'Type your answer...')}
                                                autoFocus
                                            />
                                        </div>
                                        <p className="text-white/20 text-xs pl-1">{t('لا يفرق بين الحروف الكبيرة والصغيرة. ستحتاج لهذه الإجابة عند استرداد الحساب.', 'Case-insensitive. You\'ll need this to recover your account.')}</p>
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div className="p-3.5 bg-red-500/[0.08] border border-red-500/20 rounded-xl text-red-300 text-sm animate-signup-fade-in flex items-start gap-2.5">
                                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <div className="flex gap-3 pt-1">
                                        <Button
                                            type="button"
                                            onClick={handleBack}
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
                                                    {t('جارٍ الإنشاء...', 'Creating...')}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    {t('إنشاء الحساب', 'Create Account')} <Sparkles className="w-4 h-4" />
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {/* ═══ STEP 4: Success ═══ */}
                            {step === 4 && (
                                <div className="text-center py-6 space-y-6 animate-signup-fade-in">
                                    <div className="flex justify-center">
                                        <div className="w-20 h-20 rounded-full bg-[#64ffda]/[0.08] border border-[#64ffda]/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-10 h-10 text-[#64ffda]" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-xl font-bold text-white">{t('تم إنشاء الحساب', 'Account Created!')}</h2>
                                        <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
                                            {t('مرحبًا بك في Lumos،', 'Welcome to Lumos,')} <span className="text-white/70 font-medium">{form.companyName}</span>!
                                            {isAuthenticated
                                                ? t(' أنت الآن مسجل الدخول. توجه إلى البروفايل للبدء.', ' You\'re now signed in. Head to your dashboard to get started.')
                                                : t(' حسابك بانتظار مراجعة الأدمن. ستصلك رسالة تأكيد قريبًا.', ' Your account is pending admin approval. You\'ll receive a confirmation soon.')}
                                        </p>
                                    </div>
                                    <div className="mx-auto max-w-sm rounded-[22px] border border-white/[0.06] bg-white/[0.03] p-4 text-left">
                                        <p className="text-sm font-semibold text-white">{t('ماذا يحدث بعد ذلك', 'What happens next')}</p>
                                        <div className="mt-3 space-y-2 text-xs leading-6 text-white/50">
                                            <p>{t('1. تم الآن ربط بيانات التواصل والبراند بالحساب الجديد.', '1. Your contact and brand details are now attached to the new client account.')}</p>
                                            <p>{t('2. سيبدأ الحساب بهوية أوضح للفريق ولمتابعة الأدمن.', '2. The portal starts with a cleaner identity layer for your team and admin follow-up.')}</p>
                                            <p>{t('3. يمكنك بعد الدخول استكمال اللوجو والألوان والملفات والطلبات.', '3. You can continue refining logo, colors, files, and requests after login.')}</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => navigate(isAuthenticated ? '/clients/profile' : '/client-login', { replace: true })}
                                        className="h-12 px-8 bg-gradient-to-r from-[#64ffda] to-cyan-400 hover:from-[#4de8c8] hover:to-cyan-500 text-[#0a0f1c] font-semibold rounded-xl shadow-[0_4px_20px_rgba(100,255,218,0.2)] hover:shadow-[0_4px_24px_rgba(100,255,218,0.35)] transition-all duration-300"
                                    >
                                        {isAuthenticated ? t('اذهب إلى البروفايل', 'Go to Dashboard') : t('اذهب إلى تسجيل الدخول', 'Go to Login')} <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            )}

                            {/* ── Steps 1 & 2 error + nav buttons ── */}
                            {(step === 1 || step === 2) && (
                                <div className="mt-5 space-y-4">
                                    {error && (
                                        <div className="p-3.5 bg-red-500/[0.08] border border-red-500/20 rounded-xl text-red-300 text-sm animate-signup-fade-in flex items-start gap-2.5">
                                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>{error}</span>
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
                                            {step === 1 ? t('تسجيل الدخول', 'Sign In') : t('رجوع', 'Back')}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                            className="flex-1 h-12 bg-gradient-to-r from-[#64ffda] to-cyan-400 hover:from-[#4de8c8] hover:to-cyan-500 text-[#0a0f1c] font-semibold rounded-xl shadow-[0_4px_20px_rgba(100,255,218,0.2)] hover:shadow-[0_4px_24px_rgba(100,255,218,0.35)] transition-all duration-300"
                                        >
                                            {t('متابعة', 'Continue')} <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Footer links ── */}
                        {step < 4 && (
                            <div className="mt-6 flex flex-col items-center gap-3">
                                <div className="flex items-center gap-1.5 text-sm">
                                    <span className="text-white/30">{t('هل لديك حساب بالفعل؟', 'Already have an account?')}</span>
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

            </div>

            {/* ── Keyframes ── */}
            <style>{`
                @keyframes signupTwinkle {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.3); }
                }
                @keyframes signupFadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-signup-fade-in {
                    animation: signupFadeIn 0.4s ease-out;
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

export default ClientSignUp;

