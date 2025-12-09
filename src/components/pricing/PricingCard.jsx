import { useState } from 'react';
import { Check, Sparkles, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { saveOrder } from '@/services/db';
import { toast } from 'sonner';
import { collectBrowserData } from '@/lib/collectBrowserData';

const PricingCard = ({ packageData, isPopular = false }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [showContactForm, setShowContactForm] = useState(false);

    // Handle order submission
    const handleChoosePlan = async () => {
        // Show contact form first
        if (!showContactForm) {
            setShowContactForm(true);
            return;
        }

        // Validate inputs
        if (!clientName || !clientPhone) {
            toast.error('الرجاء إدخال الاسم ورقم الهاتف');
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare order data
            const orderData = {
                client_name: clientName,
                phone: clientPhone,
                total_price: packageData.price,
                plan_details: {
                    package_id: packageData.id,
                    package_name: packageData.nameAr,
                    package_name_en: packageData.name,
                    price: packageData.price,
                    features: packageData.features,
                    highlight: packageData.highlightAr,
                },
                source: 'pricing_card'
            };

            // Call the new service
            const result = await saveOrder(orderData);

            if (result.success) {
                toast.success(result.message, { duration: 5000 });

                // Reset form
                setClientName('');
                setClientPhone('');
                setShowContactForm(false);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Order submission error:', error);
            toast.error('حدث خطأ في إرسال الطلب');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Animation variant for features
    const featureVariant = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    // Card styles based on popularity
    const cardStyles = isPopular
        ? 'bg-gradient-to-br from-primary/15 via-primary/5 to-background border-primary/50 shadow-xl shadow-primary/20'
        : 'bg-gradient-to-br from-background via-background/95 to-primary/5 border-primary/20 hover:border-primary/40 shadow-lg';

    const checkStyles = isPopular
        ? 'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md'
        : 'bg-gradient-to-br from-secondary to-primary/10 text-muted-foreground border border-primary/20';

    const buttonStyles = isPopular
        ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-primary/30'
        : 'bg-gradient-to-r from-foreground to-foreground/90 text-background hover:from-foreground/90 hover:to-foreground';

    return (
        <article
            className={`relative rounded-2xl p-4 sm:p-5 lg:p-6 border-2 overflow-hidden group transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${cardStyles}`}
        >
            {/* Popular Badge */}
            {isPopular && (
                <div className="absolute top-0 right-0">
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-1.5 rounded-bl-xl text-xs font-bold shadow-lg">
                        <Sparkles className="w-3 h-3 fill-current animate-pulse" />
                        الأكثر طلباً
                    </div>
                </div>
            )}

            {/* Package Header */}
            <header className="text-center mb-3 sm:mb-4 mt-1 relative z-10">
                <h3 className="text-xl sm:text-2xl font-black text-foreground mb-1.5">
                    {packageData.nameAr}
                </h3>
                <p className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-muted-foreground font-semibold inline-block">
                    {packageData.highlightAr}
                </p>
            </header>

            {/* Price Section - Enhanced Visibility */}
            <div className="text-center mb-5 sm:mb-6 relative z-10 py-4 sm:py-5 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-2xl border border-primary/10">
                <div className="flex flex-col items-center justify-center gap-2 mb-3">
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-5xl sm:text-6xl lg:text-7xl font-black text-primary drop-shadow-lg">
                            {packageData.price.toLocaleString()}
                        </span>
                        <div className="flex flex-col items-start">
                            <span className="text-base sm:text-lg font-bold text-foreground">
                                جنيه
                            </span>
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                شهرياً
                            </span>
                        </div>
                    </div>

                    {/* Value Indicator */}
                    <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                </div>

                {/* Savings Badge */}
                {packageData.savings > 0 && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 via-emerald-400/15 to-cyan-400/10 border-2 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-sm font-extrabold shadow-lg hover:scale-105 transition-all duration-300 animate-in zoom-in-50">
                        <Sparkles className="w-4 h-4 fill-current animate-pulse" />
                        وفّر {packageData.savings.toLocaleString()} جنيه
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute" />
                    </div>
                )}
            </div>

            {/* Features List */}
            <ul className="space-y-2 mb-4 relative z-10" dir="rtl">
                {packageData.features.map((feature, index) => (
                    <motion.li
                        key={index}
                        className="flex items-start gap-2 group/item"
                        variants={featureVariant}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover/item:scale-110 ${checkStyles}`}>
                            <Check className="w-3 h-3 font-bold" />
                        </div>
                        <span className="text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
                            {feature.textAr}
                        </span>
                    </motion.li>
                ))}
            </ul>

            {/* Contact Form (shows when user clicks CTA) */}
            {showContactForm && (
                <div className="mb-4 space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/20 animate-in slide-in-from-top-5" dir="rtl">
                    <input
                        type="text"
                        placeholder="الاسم"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <input
                        type="tel"
                        placeholder="رقم الهاتف"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
            )}

            {/* CTA Button */}
            <button
                onClick={handleChoosePlan}
                disabled={isSubmitting}
                className={`w-full py-2.5 sm:py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles}`}
                aria-label={`اختر الباقة ${packageData.nameAr}`}
            >
                <span className="flex items-center justify-center gap-2">
                    {isSubmitting ? (
                        <>
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            جاري الإرسال...
                        </>
                    ) : showContactForm ? (
                        <>
                            إرسال الطلب
                            <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    ) : (
                        <>
                            اختر الباقة
                            <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </span>
            </button>
        </article>
    );
};

export default PricingCard;
