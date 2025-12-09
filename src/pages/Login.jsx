/**
 * ═══════════════════════════════════════════════════════════════════
 * Login.jsx - Login Page for Lumos Agency
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Glassmorphism Design with Deep Navy/Cyan Theme
 * 
 * FEATURES:
 * - Email & Password login
 * - Smart redirect (Admin -> Dashboard, Customer -> Home)
 * - Master key support for admin (george30610@compit.aun.edu.eg)
 * - Link to Sign Up page for new users
 * - Elegant error handling with toasts
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, LogIn, Mail, Lock, Sparkles } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, isAdmin, user, loading: authLoading } = useAuth();

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // UI State
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Redirect if already logged in (but wait for auth to initialize first)
    useEffect(() => {
        // Don't redirect while auth is still initializing
        if (authLoading) return;
        
        if (isAuthenticated && user) {
            console.log('🔄 User already authenticated, redirecting to Home...');
            navigate('/');
        }
    }, [isAuthenticated, isAdmin, user, navigate, authLoading]);

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate Form
    const validateForm = () => {
        const newErrors = {};

        // Email
        if (!formData.email.trim()) {
            newErrors.email = 'البريد الإلكتروني مطلوب';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'البريد الإلكتروني غير صالح';
        }

        // Password
        if (!formData.password) {
            newErrors.password = 'كلمة المرور مطلوبة';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('يرجى تصحيح الأخطاء في النموذج');
            return;
        }

        setLoading(true);

        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                // ═══ BULLETPROOF REDIRECT - FORCE BROWSER NAVIGATION ═══
                if (result.role === 'admin') {
                    toast.success('🔑 مرحباً Admin! جاري التحويل...');
                } else {
                    toast.success('✅ تم تسجيل الدخول بنجاح!');
                }
                
                // All users redirect to Home page
                setTimeout(() => {
                    window.location.assign('/');
                }, 300);
                // Keep spinner active during redirect
                return;
            } else {
                // Login failed - Show error and reset loading
                toast.error(result.error || 'فشل تسجيل الدخول');
                setLoading(false);
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            toast.error('حدث خطأ غير متوقع');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a192f] flex items-center justify-center p-4">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#64ffda] opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#64ffda] opacity-5 rounded-full blur-3xl"></div>
            </div>

            {/* Login Card */}
            <Card className="w-full max-w-md relative z-10 bg-[#112240]/80 backdrop-blur-xl border-[#64ffda]/20 shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-[#64ffda]/10 rounded-full">
                            <Sparkles className="w-8 h-8 text-[#64ffda]" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        تسجيل الدخول
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        مرحباً بعودتك إلى Lumos Agency
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">
                                البريد الإلكتروني
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="pl-10 bg-[#0a192f]/50 border-[#64ffda]/30 text-white placeholder:text-gray-500 focus:border-[#64ffda] focus:ring-[#64ffda]/20"
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-400">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-300">
                                كلمة المرور
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="pl-10 bg-[#0a192f]/50 border-[#64ffda]/30 text-white placeholder:text-gray-500 focus:border-[#64ffda] focus:ring-[#64ffda]/20"
                                    autoComplete="current-password"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-400">{errors.password}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#64ffda] hover:bg-[#64ffda]/90 text-[#0a192f] font-semibold py-6 transition-all duration-300 shadow-lg hover:shadow-[#64ffda]/25"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    جاري تسجيل الدخول...
                                </>
                            ) : (
                                <>
                                    <LogIn className="mr-2 h-4 w-4" />
                                    تسجيل الدخول
                                </>
                            )}
                        </Button>

                        {/* Sign Up Link */}
                        <div className="text-center pt-4 border-t border-[#64ffda]/10">
                            <p className="text-gray-400 text-sm">
                                ليس لديك حساب؟{' '}
                                <Link
                                    to="/signup"
                                    className="text-[#64ffda] hover:text-[#64ffda]/80 font-semibold transition-colors"
                                >
                                    إنشاء حساب جديد
                                </Link>
                            </p>
                        </div>

                        {/* Admin Notice */}
                        <div className="bg-[#64ffda]/5 border border-[#64ffda]/20 rounded-lg p-3 mt-4">
                            <p className="text-xs text-gray-400 text-center">
                                🔑 المسؤول: george30610@compit.aun.edu.eg يحصل على وصول Admin تلقائي
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
