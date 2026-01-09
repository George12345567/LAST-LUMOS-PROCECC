import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Check, Sparkles, Star, ArrowLeft, Languages, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PACKAGES } from '@/data/pricing';
import { PlanBuilder } from '@/components/pricing';
import { useCurrency } from '@/hooks/useCurrency';

interface PricingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    source?: string;
    payload?: any;
}

const PricingModal = ({ open, onOpenChange, source = 'standard_pricing', payload = {} }: PricingModalProps) => {
    const { currency, currencySymbol, isEgypt, country, convertPrice, formatPrice, loading: currencyLoading, language: detectedLanguage } = useCurrency();

    const [activeTab, setActiveTab] = useState<'ready' | 'custom'>('ready');
    const [language, setLanguage] = useState<'en' | 'ar'>(detectedLanguage);

    // Sync language with detected location
    useEffect(() => {
        if (!currencyLoading) {
            setLanguage(detectedLanguage);
        }
    }, [detectedLanguage, currencyLoading]);

    const translations = {
        en: {
            specialOffer: 'Special Offers',
            choosePackage: 'Choose Your Package',
            description: 'Ready packages or build your own',
            readyPackages: 'Ready Packages',
            buildYourOwn: 'Build Your Own',
            mostPopular: 'Most Popular',
            currency: 'EGP',
            save: 'Save',
            selectPackage: 'Select Package',
            customBuilder: 'Build Your Custom Package',
            customDescription: 'Choose the services you need + 10% Tech Ops fee',
            qualityGuarantee: 'Quality Guarantee',
            securePayment: 'Secure Payment',
            support247: '24/7 Support'
        },
        ar: {
            specialOffer: 'عروض خاصة',
            choosePackage: 'اختر الباقة المناسبة',
            description: 'باقات جاهزة أو صمم باقتك الخاصة',
            readyPackages: 'الباقات الجاهزة',
            buildYourOwn: 'صمم باقتك',
            mostPopular: 'الأكثر طلباً',
            currency: 'جنيه',
            save: 'وفر',
            selectPackage: 'اختر هذه الباقة',
            customBuilder: 'صمم باقتك الخاصة',
            customDescription: 'اختر الخدمات التي تحتاجها + رسوم Tech Ops 10%',
            qualityGuarantee: 'ضمان الجودة',
            securePayment: 'دفع آمن',
            support247: 'دعم 24/7'
        }
    };

    const t = translations[language];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[98vw] sm:max-w-5xl max-h-[96vh] p-0 bg-white dark:bg-slate-900 border-0 overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl" hideCloseButton>

                {/* Top Bar with Controls */}
                <div className="absolute top-4 left-0 right-0 z-50 flex items-center justify-between px-4">
                    {/* Close Button - Left */}
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 group"
                    >
                        <X className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:rotate-90 transition-transform duration-200" />
                    </button>

                    {/* Right Controls */}
                    <div className="flex items-center gap-2">
                        {/* Currency Indicator */}
                        {!currencyLoading && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <Globe className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{country}</span>
                                <span className="text-xs text-slate-500">•</span>
                                <span className="text-xs font-black text-primary">{currencySymbol}</span>
                            </div>
                        )}

                        {/* Language Toggle */}
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 transition-all duration-200 group border border-primary/30"
                        >
                            <Languages className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-primary">{language === 'en' ? 'AR' : 'EN'}</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[94vh]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="p-4 sm:p-6 md:p-10">

                        {/* Header */}
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40 mb-4"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-primary dark:text-primary" />
                                <span className="text-xs font-bold text-primary dark:text-primary">{t.specialOffer}</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2"
                            >
                                {t.choosePackage}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-slate-600 dark:text-slate-400 text-sm"
                            >
                                {t.description}
                            </motion.p>
                        </div>

                        {/* Tabs */}
                        <div className="flex justify-center mb-8">
                            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                <button
                                    onClick={() => setActiveTab('ready')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ready'
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {t.readyPackages}
                                </button>
                                <button
                                    onClick={() => setActiveTab('custom')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'custom'
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {t.buildYourOwn}
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'ready' ? (
                                <motion.div
                                    key="ready"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto"
                                >
                                    {/* لوموس برو */}
                                    <div className="relative group">
                                        {/* شارة الأكثر طلباً */}
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                            <div className="px-3 py-1 bg-gradient-to-r from-primary to-primary/80 rounded-full text-white text-xs font-black flex items-center gap-1 shadow-lg">
                                                <Star className="w-3 h-3 fill-white" />
                                                <span>{t.mostPopular}</span>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-850 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-primary dark:border-primary hover:border-primary/80 dark:hover:border-primary/80 transition-all duration-300 h-full flex flex-col shadow-lg shadow-primary/10">
                                            {/* Header */}
                                            <div className="mb-6">
                                                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-1">
                                                    {language === 'ar' ? PACKAGES.PRO.nameAr : PACKAGES.PRO.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {language === 'ar' ? PACKAGES.PRO.highlightAr : PACKAGES.PRO.highlight}
                                                </p>
                                            </div>

                                            {/* السعر */}
                                            <div className="mb-6">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    {isEgypt ? (
                                                        <>
                                                            <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                                                                {PACKAGES.PRO.price.toLocaleString()}
                                                            </span>
                                                            <span className="text-lg text-slate-500">EGP</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                                                                ${convertPrice(PACKAGES.PRO.price).toLocaleString()}
                                                            </span>
                                                            <span className="text-lg text-slate-500">USD</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-slate-400 line-through">
                                                        {isEgypt ? PACKAGES.PRO.originalPrice.toLocaleString() : `$${convertPrice(PACKAGES.PRO.originalPrice).toLocaleString()}`}
                                                    </span>
                                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                                        {t.save} {isEgypt ? `${PACKAGES.PRO.savings.toLocaleString()} EGP` : `$${convertPrice(PACKAGES.PRO.savings).toLocaleString()}`}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* المميزات */}
                                            <ul className="space-y-3 mb-8 flex-1">
                                                {PACKAGES.PRO.features.map((feature: any, i: number) => (
                                                    <li key={i} className="flex items-start gap-2.5">
                                                        <div className="mt-0.5 w-5 h-5 rounded-full bg-primary dark:bg-primary flex items-center justify-center flex-shrink-0">
                                                            <Check className="w-3 h-3 text-white" />
                                                        </div>
                                                        <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                                            {language === 'ar' ? feature.textAr : feature.text}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* زر الاختيار */}
                                            <button className="w-full py-3 sm:py-3.5 bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/90 text-white dark:text-white rounded-lg sm:rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg shadow-primary/30 active:scale-95">
                                                <span>{t.selectPackage}</span>
                                                <ArrowLeft className={`w-4 h-4 transition-transform ${language === 'ar' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1 rotate-180'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* لوموس ستارت */}
                                    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 h-full flex flex-col">
                                        {/* Header */}
                                        <div className="mb-6">
                                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-1">
                                                {language === 'ar' ? PACKAGES.START.nameAr : PACKAGES.START.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {language === 'ar' ? PACKAGES.START.highlightAr : PACKAGES.START.highlight}
                                            </p>
                                        </div>

                                        {/* السعر */}
                                        <div className="mb-6">
                                            <div className="flex items-baseline gap-2 mb-1">
                                                {isEgypt ? (
                                                    <>
                                                        <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                                                            {PACKAGES.START.price.toLocaleString()}
                                                        </span>
                                                        <span className="text-lg text-slate-500">EGP</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                                                            ${convertPrice(PACKAGES.START.price).toLocaleString()}
                                                        </span>
                                                        <span className="text-lg text-slate-500">USD</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-slate-400 line-through">
                                                    {isEgypt ? PACKAGES.START.originalPrice.toLocaleString() : `$${convertPrice(PACKAGES.START.originalPrice).toLocaleString()}`}
                                                </span>
                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                                    {t.save} {isEgypt ? `${PACKAGES.START.savings.toLocaleString()} EGP` : `$${convertPrice(PACKAGES.START.savings).toLocaleString()}`}
                                                </span>
                                            </div>
                                        </div>

                                        {/* المميزات */}
                                        <ul className="space-y-3 mb-8 flex-1">
                                            {PACKAGES.START.features.map((feature: any, i: number) => (
                                                <li key={i} className="flex items-start gap-2.5">
                                                    <div className="mt-0.5 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                                                    </div>
                                                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                                        {language === 'ar' ? feature.textAr : feature.text}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* زر الاختيار */}
                                        <button className="w-full py-3 sm:py-3.5 bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 text-primary dark:text-primary rounded-lg sm:rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 group border border-primary/30 active:scale-95">
                                            <span>{t.selectPackage}</span>
                                            <ArrowLeft className={`w-4 h-4 transition-transform ${language === 'ar' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1 rotate-180'}`} />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="custom"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="max-w-4xl mx-auto"
                                >
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700">
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-black text-primary dark:text-primary mb-2">
                                                {t.customBuilder}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {t.customDescription}
                                            </p>
                                        </div>
                                        <PlanBuilder
                                            language={language}
                                            currency={currency}
                                            currencySymbol={currencySymbol}
                                            isEgypt={isEgypt}
                                            convertPrice={convertPrice}
                                            source={source}
                                            initialPayload={payload}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Footer */}
                        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <span>✨</span> {t.qualityGuarantee}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                <span>🔒</span> {t.securePayment}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                                <span>🚀</span> {t.support247}
                            </span>
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PricingModal;
