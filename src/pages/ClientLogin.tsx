import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, User, ShieldCheck, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const ClientLogin = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'credentials' | 'security'>('credentials');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Store user data after step 1
    const [clientData, setClientData] = useState<any>(null);

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Query Supabase clients table
            const { data: client, error: queryError } = await supabaseAdmin
                .from('clients')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();

            if (queryError || !client) {
                setError('❌ Invalid Credentials - Username or Password is incorrect');
                setLoading(false);
                return;
            }

            // User exists! Check if security question is set
            if (client.security_question) {
                // Admin user - need security challenge
                setClientData(client);
                setStep('security');
                toast.info('🛡️ Security Challenge Required');
            } else {
                // Regular client - login directly
                handleSuccessfulLogin(client);
            }

        } catch (error: any) {
            console.error('Login error:', error);
            setError('⚠️ An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSecuritySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Verify security answer (case insensitive)
            if (securityAnswer.toLowerCase().trim() === clientData.security_answer.toLowerCase().trim()) {
                toast.success('✅ Security Challenge Passed!');
                handleSuccessfulLogin(clientData);
            } else {
                setError('❌ Security Answer is Incorrect');
                setLoading(false);
            }
        } catch (error) {
            setError('⚠️ Verification failed');
            setLoading(false);
        }
    };

    const handleSuccessfulLogin = (client: any) => {
        // Save session data
        sessionStorage.setItem('client', JSON.stringify(client));
        sessionStorage.setItem('isAuthenticated', 'true');

        // Redirect based on username
        if (client.username === 'GEORGE') {
            toast.success('🎉 Welcome Admin!');
            setTimeout(() => {
                window.location.assign('/dashboard');
            }, 500);
        } else {
            toast.success(`🎉 Welcome ${client.username}!`);
            setTimeout(() => {
                navigate('/clients/dashboard');
            }, 500);
        }
    };

    const handleBack = () => {
        setStep('credentials');
        setSecurityAnswer('');
        setError('');
        setClientData(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-cyan-500/10"
                        style={{
                            width: `${Math.random() * 300 + 50}px`,
                            height: `${Math.random() * 300 + 50}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
                            animationDelay: `${Math.random() * 5}s`,
                        }}
                    />
                ))}
            </div>

            <Card className="w-full max-w-md relative z-10 border-2 border-cyan-500/20 bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-cyan-500/10">
                <CardHeader className="space-y-4">
                    {/* Logo/Brand */}
                    <div className="flex items-center justify-center mb-4">
                        <div className="relative">
                            <Sparkles className="w-12 h-12 text-cyan-500" />
                            <div className="absolute inset-0 animate-ping opacity-20">
                                <Sparkles className="w-12 h-12 text-cyan-500" />
                            </div>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center gap-2">
                        <div className={`h-2 transition-all duration-300 rounded-full ${step === 'credentials' ? 'w-8 bg-cyan-500' : 'w-2 bg-cyan-500'
                            }`} />
                        <div className={`h-2 transition-all duration-300 rounded-full ${step === 'security' ? 'w-8 bg-cyan-500' : 'w-2 bg-slate-600'
                            }`} />
                    </div>

                    <CardTitle className="text-2xl font-bold text-center text-white">
                        {step === 'credentials' ? (
                            <span className="flex items-center justify-center gap-2">
                                <User className="w-6 h-6 text-cyan-500" />
                                Client Login
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-cyan-500" />
                                Security Challenge
                            </span>
                        )}
                    </CardTitle>
                    <CardDescription className="text-center text-slate-300">
                        {step === 'credentials'
                            ? 'Enter your credentials to access your account'
                            : 'Answer the security question to proceed'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {/* Step 1: Credentials */}
                    {step === 'credentials' && (
                        <form onSubmit={handleCredentialsSubmit} className="space-y-4 animate-fade-in">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-slate-200 font-semibold">
                                    Username
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            setError('');
                                        }}
                                        className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                                        placeholder="Enter your username"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-200 font-semibold">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError('');
                                        }}
                                        className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300 text-sm animate-fade-in">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-6 shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Verifying...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Login
                                        <Lock className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    )}

                    {/* Step 2: Security Challenge */}
                    {step === 'security' && clientData && (
                        <form onSubmit={handleSecuritySubmit} className="space-y-4 animate-fade-in">
                            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg mb-4">
                                <p className="text-sm text-cyan-300 font-semibold mb-1">
                                    Security Check:
                                </p>
                                <p className="text-white font-medium">
                                    {clientData.security_question}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="security-answer" className="text-slate-200 font-semibold">
                                    Your Answer
                                </Label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="security-answer"
                                        type="text"
                                        value={securityAnswer}
                                        onChange={(e) => {
                                            setSecurityAnswer(e.target.value);
                                            setError('');
                                        }}
                                        className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                                        placeholder="Type your answer..."
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300 text-sm animate-fade-in">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    onClick={handleBack}
                                    variant="outline"
                                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Verifying...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Verify & Login
                                            <ShieldCheck className="w-4 h-4" />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                            ← Back to Homepage
                        </button>
                    </div>
                </CardContent>
            </Card>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-20px) scale(1.1); }
                }
                
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ClientLogin;
