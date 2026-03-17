/**
 * ═══════════════════════════════════════════════════════════════════
 * MagicLinkVerify.tsx - MAGIC LINK VERIFICATION PAGE
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Route: /magic-login/:token
 * Automatically verifies the magic link token on mount.
 * Shows loading → success (redirect) or error with retry.
 * Same dark constellation aesthetic as login page.
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import { Button } from '@/components/ui/button';
import {
    Sparkles, CheckCircle2, XCircle, Clock,
    ArrowRight, RefreshCw, KeyRound, Mail
} from 'lucide-react';

type VerifyState = 'verifying' | 'success' | 'expired' | 'error';

/** Helper: determine the right dashboard route based on username */
const getDashboardRoute = (role?: string) =>
    role === 'admin' ? '/dashboard' : '/clients/profile';

const MagicLinkVerify = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { verifyMagicLink } = useAuth();

    const [state, setState] = useState<VerifyState>('verifying');
    const [errorMsg, setErrorMsg] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientRole, setClientRole] = useState('client');
    const [countdown, setCountdown] = useState(3);
    const verifiedRef = useRef(false);

    // Star field
    const stars = useMemo(() =>
        Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2.5 + 0.5,
            delay: Math.random() * 4,
            duration: 2 + Math.random() * 3,
            opacity: 0.2 + Math.random() * 0.6,
        })), []);

    // Verify token on mount
    useEffect(() => {
        if (!token || verifiedRef.current) return;
        verifiedRef.current = true;

        const verify = async () => {
            try {
                const result = await verifyMagicLink(token);

                if (result.success && result.client) {
                    const uname = (result.client.username as string) || 'User';
                    setClientName(uname);
                    setClientRole((result.client.role as string) || 'client');
                    setState('success');
                } else if (result.expired) {
                    setState('expired');
                    setErrorMsg('This magic link has expired.');
                } else {
                    setState('error');
                    setErrorMsg(result.error || 'Invalid or already-used link.');
                }
            } catch {
                setState('error');
                setErrorMsg('Something went wrong. Please try again.');
            }
        };

        // Small delay for UX
        const timeout = setTimeout(verify, 800);
        return () => clearTimeout(timeout);
    }, [token, verifyMagicLink]);

    // Auto-redirect countdown on success
    useEffect(() => {
        if (state !== 'success') return;

        const destination = getDashboardRoute(clientRole);
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    navigate(destination, { replace: true });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [state, clientRole, navigate]);

    return (
        <div className="min-h-screen bg-[#060a14] relative overflow-hidden">
            <EnhancedNavbar />

            <div className="flex items-center justify-center min-h-screen p-4 pt-24">

                {/* Constellation BG */}
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
                                animation: `mlTwinkle ${star.duration}s ease-in-out infinite`,
                                animationDelay: `${star.delay}s`,
                            }}
                        />
                    ))}
                    <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/[0.04] rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none" />
                </div>

                {/* Card */}
                <div className="w-full max-w-[440px] relative z-10">
                    <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] rounded-2xl p-10 shadow-[0_8px_40px_rgba(0,0,0,0.4)] text-center">

                        {/* ── VERIFYING STATE ── */}
                        {state === 'verifying' && (
                            <div className="space-y-6 animate-ml-fade-in">
                                <div className="relative flex justify-center">
                                    {/* Spinning ring */}
                                    <div className="w-20 h-20 rounded-full border-2 border-[#64ffda]/10 border-t-[#64ffda]/60 animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Sparkles className="w-7 h-7 text-[#64ffda]/60 animate-pulse" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-2">Verifying Magic Link</h2>
                                    <p className="text-white/40 text-sm">Please wait while we authenticate you...</p>
                                </div>
                                {/* Animated dots */}
                                <div className="flex justify-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-[#64ffda]/40 animate-ml-bounce-1" />
                                    <div className="w-2 h-2 rounded-full bg-[#64ffda]/40 animate-ml-bounce-2" />
                                    <div className="w-2 h-2 rounded-full bg-[#64ffda]/40 animate-ml-bounce-3" />
                                </div>
                            </div>
                        )}

                        {/* ── SUCCESS STATE ── */}
                        {state === 'success' && (
                            <div className="space-y-6 animate-ml-fade-in">
                                <div className="relative flex justify-center">
                                    {/* Success rings */}
                                    <div className="absolute w-24 h-24 rounded-full border border-[#64ffda]/10 animate-ml-ring" />
                                    <div className="absolute w-32 h-32 rounded-full border border-[#64ffda]/5 animate-ml-ring-slow" />

                                    <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#64ffda]/15 to-emerald-500/10 border border-[#64ffda]/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-10 h-10 text-[#64ffda] animate-ml-scale-in" />
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
                                    <p className="text-[#64ffda] font-medium text-lg">{clientName}</p>
                                </div>

                                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5">
                                    <p className="text-white/40 text-xs">
                                        Redirecting to your dashboard in{' '}
                                        <span className="text-[#64ffda] font-bold text-sm">{countdown}</span>
                                        {' '}seconds...
                                    </p>
                                </div>

                                <Button
                                    onClick={() => {
                                        navigate(getDashboardRoute(clientRole), { replace: true });
                                    }}
                                    className="w-full h-11 bg-gradient-to-r from-[#64ffda] to-cyan-400 hover:from-[#4de8c8] hover:to-cyan-500 text-[#0a0f1c] font-semibold rounded-xl transition-all"
                                >
                                    <span className="flex items-center gap-2">
                                        Go to Dashboard
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                </Button>
                            </div>
                        )}

                        {/* ── EXPIRED STATE ── */}
                        {state === 'expired' && (
                            <div className="space-y-6 animate-ml-fade-in">
                                <div className="flex justify-center">
                                    <div className="w-20 h-20 rounded-2xl bg-amber-500/[0.08] border border-amber-500/15 flex items-center justify-center">
                                        <Clock className="w-10 h-10 text-amber-400/70" />
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-white mb-2">Link Expired</h2>
                                    <p className="text-white/40 text-sm">
                                        This magic link has expired for your security.
                                        <br />Magic links are valid for 15 minutes.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    <Link to="/client-login">
                                        <Button className="w-full h-11 bg-gradient-to-r from-[#64ffda] to-cyan-400 hover:from-[#4de8c8] hover:to-cyan-500 text-[#0a0f1c] font-semibold rounded-xl transition-all">
                                            <span className="flex items-center gap-2">
                                                <RefreshCw className="w-4 h-4" />
                                                Request New Magic Link
                                            </span>
                                        </Button>
                                    </Link>
                                    <Link
                                        to="/client-login"
                                        className="inline-flex items-center justify-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
                                    >
                                        <KeyRound className="w-3 h-3" />
                                        Or sign in with password
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* ── ERROR STATE ── */}
                        {state === 'error' && (
                            <div className="space-y-6 animate-ml-fade-in">
                                <div className="flex justify-center">
                                    <div className="w-20 h-20 rounded-2xl bg-red-500/[0.08] border border-red-500/15 flex items-center justify-center">
                                        <XCircle className="w-10 h-10 text-red-400/70" />
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
                                    <p className="text-white/40 text-sm">{errorMsg}</p>
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    <Link to="/client-login">
                                        <Button className="w-full h-11 bg-gradient-to-r from-[#64ffda] to-cyan-400 hover:from-[#4de8c8] hover:to-cyan-500 text-[#0a0f1c] font-semibold rounded-xl transition-all">
                                            <span className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                Back to Login
                                            </span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Keyframes */}
            <style>{`
                @keyframes mlTwinkle {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.3); }
                }
                @keyframes mlFadeIn {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-ml-fade-in {
                    animation: mlFadeIn 0.5s ease-out;
                }
                @keyframes mlBounce {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
                    40% { transform: translateY(-8px); opacity: 1; }
                }
                .animate-ml-bounce-1 { animation: mlBounce 1.4s ease-in-out infinite; }
                .animate-ml-bounce-2 { animation: mlBounce 1.4s ease-in-out infinite 0.2s; }
                .animate-ml-bounce-3 { animation: mlBounce 1.4s ease-in-out infinite 0.4s; }
                @keyframes mlRing {
                    0% { opacity: 0.3; transform: scale(0.85); }
                    100% { opacity: 0; transform: scale(1.3); }
                }
                .animate-ml-ring { animation: mlRing 2s ease-out infinite; }
                .animate-ml-ring-slow { animation: mlRing 2.8s ease-out infinite 0.5s; }
                @keyframes mlScaleIn {
                    0% { opacity: 0; transform: scale(0.3) rotate(-20deg); }
                    60% { opacity: 1; transform: scale(1.1) rotate(5deg); }
                    100% { opacity: 1; transform: scale(1) rotate(0); }
                }
                .animate-ml-scale-in { animation: mlScaleIn 0.6s ease-out 0.3s both; }
            `}</style>
        </div>
    );
};

export default MagicLinkVerify;

