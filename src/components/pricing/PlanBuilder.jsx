import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_LABELS_EN, SERVICES } from '@/data/pricing';
import { getPriceBreakdown } from '@/utils/CalculatorEngine';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';

const PlanBuilder = ({ language = 'en', currency = 'EGP', currencySymbol = 'EGP', isEgypt = true, convertPrice = (price) => price }) => {
    const [activeCategory, setActiveCategory] = useState(CATEGORIES.WEB);
    const [selectedServices, setSelectedServices] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientEmail, setClientEmail] = useState('');

    const translations = {
        en: {
            selectedServices: 'Selected Services',
            emptyCart: 'Cart is Empty',
            chooseServices: 'Choose from services',
            subtotal: 'Services Total',
            techOps: 'Tech Ops (10%)',
            total: 'Final Total',
            egp: 'EGP',
            name: 'Name',
            phone: 'Phone Number',
            email: 'Email',
            namePlaceholder: 'Enter your full name',
            phonePlaceholder: '01XXXXXXXXX',
            emailPlaceholder: 'your@email.com',
            submitOrder: 'Submit Order',
            submitting: 'Submitting...',
            errorSelectService: 'Please select at least one service',
            errorNamePhone: 'Please enter name, phone, and email'
        },
        ar: {
            selectedServices: 'الخدمات المختارة',
            emptyCart: 'السلة فارغة',
            chooseServices: 'اختر الخدمات من القائمة',
            subtotal: 'إجمالي الخدمات',
            techOps: 'Tech Ops (10%)',
            total: 'الإجمالي النهائي',
            egp: 'جنيه مصري',
            name: 'الاسم',
            phone: 'رقم الهاتف',
            email: 'البريد الإلكتروني',
            namePlaceholder: 'أدخل اسمك الكامل',
            phonePlaceholder: '01XXXXXXXXX',
            emailPlaceholder: 'your@email.com',
            submitOrder: 'إرسال الطلب',
            submitting: 'جاري الإرسال...',
            errorSelectService: 'الرجاء اختيار خدمة واحدة على الأقل',
            errorNamePhone: 'الرجاء إدخال الاسم ورقم الهاتف والبريد الإلكتروني'
        }
    };

    const t = translations[language];

    const currentServices = SERVICES[activeCategory] || [];

    const priceBreakdown = useMemo(() => {
        return getPriceBreakdown(selectedServices);
    }, [selectedServices]);

    const toggleService = (service) => {
        setSelectedServices((prev) => {
            const isSelected = prev.some((s) => s.id === service.id);
            if (isSelected) {
                return prev.filter((s) => s.id !== service.id);
            } else {
                return [...prev, service];
            }
        });
    };

    const isServiceSelected = (serviceId) => {
        return selectedServices.some((s) => s.id === serviceId);
    };

    const handleSubmitPlan = async () => {
        if (selectedServices.length === 0) {
            toast.error(t.errorSelectService);
            return;
        }

        if (!clientName || !clientPhone || !clientEmail) {
            toast.error(t.errorNamePhone);
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare subscription data
            const subscriptionData = {
                user_id: null,
                customer_name: clientName,
                customer_email: clientEmail,
                customer_phone: clientPhone,
                package_type: 'custom',
                package_name: 'Custom Package',
                selected_services: selectedServices.map(s => ({
                    id: s.id,
                    name: s.nameAr,
                    nameEn: s.nameEn || s.nameAr,
                    price: s.price,
                    category: s.category
                })),
                subtotal: priceBreakdown.subtotal,
                tech_ops_fee: priceBreakdown.techOpsFee,
                total: priceBreakdown.total,
                currency: currency,
                status: 'pending'
            };

            // Save to Supabase
            const { data, error } = await supabase
                .from('subscriptions')
                .insert([subscriptionData])
                .select()
                .single();

            if (error) throw error;

            toast.success('✅ Order submitted successfully!', { duration: 5000 });

            // Clear form
            setSelectedServices([]);
            setClientName('');
            setClientPhone('');
            setClientEmail('');

        } catch (error) {
            console.error('❌ Order submission error:', error);
            toast.error('Failed to submit order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Categories */}
            <div className="mb-4">
                <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(188 100% 42% / 0.3) transparent' }}>
                    {Object.entries(language === 'ar' ? CATEGORY_LABELS : CATEGORY_LABELS_EN).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${activeCategory === key
                                ? 'bg-primary dark:bg-primary text-white dark:text-white shadow-md shadow-primary/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* RIGHT: Services */}
                <div className="order-2 md:order-1">
                    <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-2">
                        {currentServices.map((service) => {
                            const isSelected = isServiceSelected(service.id);

                            return (
                                <button
                                    key={service.id}
                                    onClick={() => toggleService(service)}
                                    className={`w-full p-3 rounded-lg text-right transition-all border ${isSelected
                                        ? 'border-primary dark:border-primary bg-primary/5 dark:bg-primary/10 shadow-md shadow-primary/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary/40 dark:hover:border-primary/40'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-0.5">
                                                {language === 'ar' ? service.nameAr : service.name}
                                            </h4>
                                            <p className="text-base font-black text-slate-900 dark:text-white">
                                                {isEgypt ? service.price.toLocaleString() : convertPrice(service.price).toLocaleString()}
                                                <span className="text-xs font-normal text-slate-500 ml-1">{currencySymbol}</span>
                                            </p>
                                        </div>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mr-3 ${isSelected
                                            ? 'border-primary dark:border-primary bg-primary dark:bg-primary'
                                            : 'border-slate-300 dark:border-slate-600'
                                            }`}>
                                            {isSelected && (
                                                <svg className="w-2.5 h-2.5 text-white dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* LEFT: Invoice/Summary */}
                <div className="order-1 md:order-2">
                    <div className="bg-gradient-to-br from-white to-primary/5 dark:from-slate-800 dark:to-primary/10 rounded-2xl p-6 border-2 border-primary/20 dark:border-primary/30 sticky top-4 shadow-xl shadow-primary/10">
                        {selectedServices.length > 0 ? (
                            <>
                                {/* Header */}
                                <div className="mb-5 pb-4 border-b-2 border-primary/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <ShoppingCart className="w-4 h-4 text-primary" />
                                            </div>
                                            {t.selectedServices}
                                        </h4>
                                        <div className="px-2.5 py-1 bg-primary/10 rounded-full">
                                            <span className="text-xs font-black text-primary">{selectedServices.length}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Selected Services */}
                                <div className="mb-5">
                                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                                        {selectedServices.map((service) => (
                                            <div key={service.id} className="group bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/40 transition-all">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">{language === 'ar' ? service.nameAr : service.name}</p>
                                                        <p className="text-sm font-black text-primary">
                                                            {isEgypt ? service.price.toLocaleString() : convertPrice(service.price).toLocaleString()}
                                                            <span className="text-xs font-normal ml-1">{currencySymbol}</span>
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleService(service)}
                                                        className="w-6 h-6 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Summary */}
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-5 space-y-3 border border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-600 dark:text-slate-400">{t.subtotal}</span>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{priceBreakdown.subtotalFormatted}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                                        <span className="text-xs text-slate-600 dark:text-slate-400">{t.techOps}</span>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{priceBreakdown.techOpsFeeFormatted}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{t.total}</span>
                                        <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                                            <p className="text-xl font-black text-primary">{priceBreakdown.totalFormatted}</p>
                                            <p className="text-xs text-slate-500">{t.egp}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Client Info */}
                                <div className="space-y-3 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.name}</label>
                                        <input
                                            type="text"
                                            placeholder={t.namePlaceholder}
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            className="w-full px-4 py-2.5 text-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.email}</label>
                                        <input
                                            type="email"
                                            placeholder={t.emailPlaceholder}
                                            value={clientEmail}
                                            onChange={(e) => setClientEmail(e.target.value)}
                                            className="w-full px-4 py-2.5 text-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t.phone}</label>
                                        <input
                                            type="tel"
                                            placeholder={t.phonePlaceholder}
                                            value={clientPhone}
                                            onChange={(e) => setClientPhone(e.target.value)}
                                            className="w-full px-4 py-2.5 text-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    onClick={handleSubmitPlan}
                                    disabled={isSubmitting}
                                    className="w-full py-3.5 text-sm bg-primary dark:bg-primary text-white dark:text-white rounded-xl font-black hover:bg-primary/90 dark:hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {isSubmitting ? t.submitting : t.submitOrder}
                                </button>
                            </>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ShoppingCart className="w-8 h-8 text-primary/40" />
                                </div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t.emptyCart}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t.chooseServices} {language === 'ar' ? '←' : '→'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanBuilder;
