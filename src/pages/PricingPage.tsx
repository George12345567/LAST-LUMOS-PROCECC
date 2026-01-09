import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PACKAGES } from '@/data/pricing';
import { PricingCard, PlanBuilder } from '@/components/pricing';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import { Sparkles } from 'lucide-react';

/**
 * Pricing Page Example
 * Shows how to use PricingCard and PlanBuilder components
 */
const PricingPage = () => {
    const [showCustomBuilder, setShowCustomBuilder] = useState(false);

    return (
        <>
            <EnhancedNavbar />
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden pt-24 pb-12">
                {/* Enhanced Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-orb" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-orb-delayed" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto max-w-7xl relative z-10 px-4">
                    {/* Header */}
                    <div className="text-center mb-12" dir="rtl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 shadow-lg backdrop-blur-sm"
                        >
                            <Sparkles className="w-4 h-4 text-cyan-600" />
                            <span className="text-sm font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">عروض حصرية لفترة محدودة ✨</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-6 tracking-tight"
                        >
                            اختر الباقة <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">المناسبة</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                        >
                            باقات متكاملة مصممة خصيصاً لتنمية نشاطك التجاري، أو صمم باقتك بنفسك حسب احتياجاتك
                        </motion.p>
                    </div>

                    {/* Enhanced Toggle */}
                    <div className="flex justify-center mb-16">
                        <div className="bg-gradient-to-r from-secondary/80 to-secondary/60 p-1.5 rounded-2xl inline-flex relative backdrop-blur-md border border-border shadow-xl">
                            {/* Enhanced Sliding Background */}
                            <motion.div
                                className="absolute inset-y-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg"
                                initial={false}
                                animate={{
                                    x: showCustomBuilder ? 0 : '100%',
                                    width: '50%'
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />

                            <button
                                onClick={() => setShowCustomBuilder(true)}
                                className={`relative z-10 px-8 py-3 rounded-xl font-bold text-sm sm:text-base transition-colors duration-200 flex items-center gap-2 ${showCustomBuilder ? 'text-white' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <span>🎨</span>
                                <span>مخصصة</span>
                            </button>
                            <button
                                onClick={() => setShowCustomBuilder(false)}
                                className={`relative z-10 px-8 py-3 rounded-xl font-bold text-sm sm:text-base transition-colors duration-200 flex items-center gap-2 ${!showCustomBuilder ? 'text-white' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <span>📦</span>
                                <span>جاهزة</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Area with AnimatePresence */}
                    <AnimatePresence mode="wait">
                        {!showCustomBuilder ? (
                            <motion.div
                                key="packages"
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
                            >
                                <PricingCard packageData={PACKAGES.START} />
                                <PricingCard packageData={PACKAGES.PRO} isPopular />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="builder"
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10"
                            >
                                <div className="mb-8 text-center" dir="rtl">
                                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                                        <span className="text-2xl">🎨</span>
                                        <span className="text-sm font-bold text-cyan-600">صمم باقتك</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-foreground mb-3 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                        صمم باقتك الخاصة
                                    </h2>
                                    <p className="text-muted-foreground text-lg">
                                        اختر الخدمات التي تحتاجها فقط + رسوم <span className="font-bold text-cyan-600">Tech Ops 10%</span>
                                    </p>
                                </div>
                                <PlanBuilder />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Enhanced Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="mt-20 text-center border-t border-border/50 pt-8"
                        dir="rtl"
                    >
                        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">✨</span>
                                <span className="font-medium">ضمان الجودة</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🔒</span>
                                <span className="font-medium">دفع آمن</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🚀</span>
                                <span className="font-medium">دعم فني 24/7</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default PricingPage;
