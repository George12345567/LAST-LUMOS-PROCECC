/**
 * ═══════════════════════════════════════════════════════════════════
 * SignUp.jsx - Registration Page for Lumos Agency
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Glassmorphism Design with Deep Navy/Cyan Theme
 * 
 * FEATURES:
 * - Full Name, Email, Phone (Optional), Password fields
 * - Client-side validation
 * - Auto-redirect to Home after successful sign up
 * - Link to Login page for existing users
 * - Elegant error handling with toasts
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, UserPlus, Mail, Lock, User, Phone } from 'lucide-react';

const SignUp = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    // UI State
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

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

        // Full Name
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'الاسم الكامل مطلوب';
        } else if (formData.fullName.trim().length < 3) {
            newErrors.fullName = 'الاسم يجب أن يكون 3 أحرف على الأقل';
        }

        // Email
        if (!formData.email.trim()) {
            newErrors.email = 'البريد الإلكتروني مطلوب';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'البريد الإلكتروني غير صالح';
        }

        // Password
        if (!formData.password) {
            newErrors.password = 'كلمة المرور مطلوبة';
        } else if (formData.password.length < 6) {
            newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
        }

        // Confirm Password
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
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
            const result = await signUp(
                formData.email,
                formData.password,
                formData.fullName,
                formData.phone || null
            );

            if (result.success) {
                toast.success('تم إنشاء الحساب بنجاح! جاري التحويل...');
                
                // Redirect to home page after 1.5 seconds
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                toast.error(result.error || 'فشل إنشاء الحساب');
            }
        } catch (error) {
            console.error('Sign up error:', error);
            toast.error('حدث خطأ غير متوقع');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a192f] flex items-center justify-center p-4">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#64ffda] opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#64ffda] opacity-5 rounded-full blur-3xl"></div>
            </div>

            {/* Sign Up Card */}
            <Card className="w-full max-w-md relative z-10 bg-[#112240]/80 backdrop-blur-xl border-[#64ffda]/20 shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-[#64ffda]/10 rounded-full">
                            <UserPlus className="w-8 h-8 text-[#64ffda]" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        إنشاء حساب جديد
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        انضم إلى Lumos Agency واستمتع بخدماتنا المتميزة
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-gray-300">
                                الاسم الكامل <span className="text-red-400">*</span>
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    placeholder="أدخل اسمك الكامل"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="pl-10 bg-[#0a192f]/50 border-[#64ffda]/30 text-white placeholder:text-gray-500 focus:border-[#64ffda] focus:ring-[#64ffda]/20"
                                />
                            </div>
                            {errors.fullName && (
                                <p className="text-xs text-red-400">{errors.fullName}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">
                                البريد الإلكتروني <span className="text-red-400">*</span>
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
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-400">{errors.email}</p>
                            )}
                        </div>

                        {/* Phone (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-gray-300">
                                رقم الهاتف <span className="text-gray-500 text-xs">(اختياري)</span>
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="+20 123 456 7890"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="pl-10 bg-[#0a192f]/50 border-[#64ffda]/30 text-white placeholder:text-gray-500 focus:border-[#64ffda] focus:ring-[#64ffda]/20"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-300">
                                كلمة المرور <span className="text-red-400">*</span>
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
                                />
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-400">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-gray-300">
                                تأكيد كلمة المرور <span className="text-red-400">*</span>
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="pl-10 bg-[#0a192f]/50 border-[#64ffda]/30 text-white placeholder:text-gray-500 focus:border-[#64ffda] focus:ring-[#64ffda]/20"
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-400">{errors.confirmPassword}</p>
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
                                    جاري إنشاء الحساب...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    إنشاء حساب
                                </>
                            )}
                        </Button>

                        {/* Login Link */}
                        <div className="text-center pt-4 border-t border-[#64ffda]/10">
                            <p className="text-gray-400 text-sm">
                                لديك حساب بالفعل؟{' '}
                                <Link
                                    to="/login"
                                    className="text-[#64ffda] hover:text-[#64ffda]/80 font-semibold transition-colors"
                                >
                                    تسجيل الدخول
                                </Link>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SignUp;
