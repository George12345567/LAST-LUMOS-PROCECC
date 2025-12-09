// Lumos Pricing Database
// All prices in EGP

// Category Definitions
export const CATEGORIES = {
    WEB: 'web',
    UI_ADDONS: 'ui_addons',
    ECOM_BOOSTERS: 'ecom_boosters',
    MEDIA_VISITS: 'media_visits',
    MEDIA_PRODUCTION: 'media_production',
    CONTENT: 'content',
    AUTOMATION: 'automation',
    OPS_AUTOMATION: 'ops_automation',
    GROWTH_ADS: 'growth_ads',
    SECURITY: 'security',
};

// Category Labels (Arabic)
export const CATEGORY_LABELS = {
    [CATEGORIES.WEB]: 'تطوير المواقع',
    [CATEGORIES.UI_ADDONS]: 'إضافات واجهة المستخدم',
    [CATEGORIES.ECOM_BOOSTERS]: 'تحسينات التجارة الإلكترونية',
    [CATEGORIES.MEDIA_VISITS]: 'زيارات التصوير',
    [CATEGORIES.MEDIA_PRODUCTION]: 'الإنتاج المرئي',
    [CATEGORIES.CONTENT]: 'المحتوى والكتابة',
    [CATEGORIES.AUTOMATION]: 'الأتمتة الذكية',
    [CATEGORIES.OPS_AUTOMATION]: 'أتمتة العمليات',
    [CATEGORIES.GROWTH_ADS]: 'التسويق والإعلانات',
    [CATEGORIES.SECURITY]: 'الأمان والحماية',
};

// Category Labels (English)
export const CATEGORY_LABELS_EN = {
    [CATEGORIES.WEB]: 'Web Development',
    [CATEGORIES.UI_ADDONS]: 'UI Add-ons',
    [CATEGORIES.ECOM_BOOSTERS]: 'E-Commerce Boosters',
    [CATEGORIES.MEDIA_VISITS]: 'Media Visits',
    [CATEGORIES.MEDIA_PRODUCTION]: 'Media Production',
    [CATEGORIES.CONTENT]: 'Content & Writing',
    [CATEGORIES.AUTOMATION]: 'Smart Automation',
    [CATEGORIES.OPS_AUTOMATION]: 'Ops Automation',
    [CATEGORIES.GROWTH_ADS]: 'Growth & Ads',
    [CATEGORIES.SECURITY]: 'Security',
};

// Core Services
export const SERVICES = {
    // Web Development
    [CATEGORIES.WEB]: [
        { id: 'web_landing', name: 'Landing Page', nameAr: 'صفحة هبوط', price: 1500, description: 'Single page website' },
        { id: 'web_corporate', name: 'Corporate Site', nameAr: 'موقع شركة', price: 3000, description: 'Multi-page corporate website' },
        { id: 'web_ecommerce', name: 'E-Commerce', nameAr: 'متجر إلكتروني', price: 5000, description: 'Full online store' },
        { id: 'web_realestate', name: 'Real Estate', nameAr: 'موقع عقارات', price: 7000, description: 'Property listing platform' },
        { id: 'web_lms', name: 'LMS Platform', nameAr: 'منصة تعليمية', price: 8000, description: 'Learning management system' },
        { id: 'web_dashboard', name: 'Dashboard', nameAr: 'لوحة تحكم', price: 10000, description: 'Admin control panel' },
    ],

    // UI Add-ons
    [CATEGORIES.UI_ADDONS]: [
        { id: 'ui_darkmode', name: 'Dark Mode', nameAr: 'الوضع الليلي', price: 800, description: 'Dark theme toggle' },
        { id: 'ui_motion', name: 'Motion Design', nameAr: 'تصميم متحرك', price: 1500, description: 'Advanced animations' },
        { id: 'ui_cursor', name: 'Custom Cursor', nameAr: 'مؤشر مخصص', price: 300, description: 'Branded cursor' },
        { id: 'ui_cdn', name: 'CDN Setup', nameAr: 'شبكة توصيل', price: 500, description: 'Fast content delivery' },
    ],

    // E-Commerce Boosters
    [CATEGORIES.ECOM_BOOSTERS]: [
        { id: 'ecom_filtering', name: 'Advanced Filtering', nameAr: 'فلترة متقدمة', price: 1000, description: 'Product filters' },
        { id: 'ecom_wishlist', name: 'Wishlist', nameAr: 'قائمة الأمنيات', price: 500, description: 'Save favorites' },
        { id: 'ecom_comparison', name: 'Product Comparison', nameAr: 'مقارنة المنتجات', price: 700, description: 'Compare items' },
        { id: 'ecom_social', name: 'Social Login', nameAr: 'تسجيل اجتماعي', price: 500, description: 'Login with social media' },
        { id: 'ecom_loyalty', name: 'Loyalty Program', nameAr: 'برنامج ولاء', price: 1500, description: 'Points & rewards' },
    ],

    // Media Visits
    [CATEGORIES.MEDIA_VISITS]: [
        { id: 'media_photo', name: 'Quick Photo Visit', nameAr: 'زيارة تصوير سريعة', price: 1500, description: '2-hour photoshoot' },
        { id: 'media_reels', name: 'Reels Visit', nameAr: 'زيارة ريلز', price: 2000, description: '4 video reels' },
        { id: 'media_product', name: 'Product Session', nameAr: 'جلسة منتجات', price: 3000, description: 'Professional product photography' },
    ],

    // Media Production
    [CATEGORIES.MEDIA_PRODUCTION]: [
        { id: 'prod_corporate', name: 'Corporate Video', nameAr: 'فيديو مؤسسي', price: 15000, description: 'Professional corporate video' },
        { id: 'prod_drone', name: 'Drone Footage', nameAr: 'تصوير جوي', price: 3000, description: 'Aerial photography' },
        { id: 'prod_podcast', name: 'Podcast Production', nameAr: 'إنتاج بودكاست', price: 4000, description: 'Audio podcast setup' },
        { id: 'prod_motion2d', name: '2D Motion Graphics', nameAr: 'موشن جرافيك 2D', price: 3500, description: 'Animated graphics' },
    ],

    // Content
    [CATEGORIES.CONTENT]: [
        { id: 'content_webcopy', name: 'Web Copywriting', nameAr: 'كتابة محتوى الموقع', price: 800, description: 'Website content writing' },
        { id: 'content_pdf', name: 'Profile PDF', nameAr: 'ملف تعريفي PDF', price: 600, description: 'Company profile design' },
        { id: 'content_creative', name: 'Creative Pack', nameAr: 'حزمة إبداعية', price: 500, description: 'Social media designs' },
    ],

    // Automation
    [CATEGORIES.AUTOMATION]: [
        { id: 'auto_menubot', name: 'Smart Menu Bot', nameAr: 'بوت قائمة ذكي', price: 600, description: 'WhatsApp menu bot' },
        { id: 'auto_aiagent', name: 'AI Customer Agent', nameAr: 'وكيل عملاء ذكي', price: 3000, description: 'AI-powered support' },
        { id: 'auto_datacapture', name: 'Data Capture System', nameAr: 'نظام جمع البيانات', price: 500, description: 'Lead collection' },
    ],

    // Ops Automation
    [CATEGORIES.OPS_AUTOMATION]: [
        { id: 'ops_invoice', name: 'Auto-Invoice', nameAr: 'فوترة تلقائية', price: 1000, description: 'Automated invoicing' },
        { id: 'ops_reminders', name: 'Smart Reminders', nameAr: 'تذكيرات ذكية', price: 800, description: 'Automated notifications' },
        { id: 'ops_cart', name: 'Cart Recovery', nameAr: 'استرجاع السلة', price: 1200, description: 'Abandoned cart emails' },
        { id: 'ops_reviews', name: 'Review Collection', nameAr: 'جمع التقييمات', price: 500, description: 'Automated review requests' },
    ],

    // Growth & Ads
    [CATEGORIES.GROWTH_ADS]: [
        { id: 'growth_pixel', name: 'Pixel Setup', nameAr: 'إعداد البيكسل', price: 1000, description: 'Tracking pixel installation' },
        { id: 'growth_fb', name: 'FB/Instagram Ads', nameAr: 'إعلانات فيسبوك/انستغرام', price: 2000, description: 'Social media ads management' },
        { id: 'growth_tiktok', name: 'TikTok Ads', nameAr: 'إعلانات تيك توك', price: 2000, description: 'TikTok ads campaign' },
        { id: 'growth_google', name: 'Google Ads', nameAr: 'إعلانات جوجل', price: 2500, description: 'Google search ads' },
    ],

    // Security
    [CATEGORIES.SECURITY]: [
        { id: 'sec_ssl', name: 'SSL Certificate', nameAr: 'شهادة SSL', price: 300, description: 'HTTPS security' },
        { id: 'sec_ddos', name: 'DDoS Protection', nameAr: 'حماية DDoS', price: 500, description: 'Attack prevention' },
        { id: 'sec_backups', name: 'Auto Backups', nameAr: 'نسخ احتياطي', price: 400, description: 'Daily backups' },
        { id: 'sec_vip', name: 'VIP Support', nameAr: 'دعم VIP', price: 1000, description: 'Priority support' },
    ],
};

// Fixed Packages
export const PACKAGES = {
    START: {
        id: 'lumos_start',
        name: 'Lumos Start',
        nameAr: 'لوموس ستارت',
        price: 3900,
        originalPrice: 4730, // Calculated from included services
        savings: 830,
        highlight: 'Ideal for new businesses',
        highlightAr: 'مثالي للأعمال الجديدة',
        features: [
            { text: '8 Social Media Designs', textAr: '8 تصاميم سوشيال ميديا' },
            { text: 'Landing Page or Smart Menu', textAr: 'صفحة هبوط أو قائمة ذكية' },
            { text: 'Quick Photo Visit (2 hours)', textAr: 'زيارة تصوير سريعة (ساعتين)' },
            { text: 'WhatsApp Chatbot', textAr: 'بوت واتساب' },
        ],
        includedServices: ['web_landing', 'media_photo', 'auto_menubot', 'content_creative'],
    },
    PRO: {
        id: 'lumos_pro',
        name: 'Lumos Pro',
        nameAr: 'لوموس برو',
        price: 7900,
        originalPrice: 9460, // Calculated from included services
        savings: 1560,
        highlight: 'Full Sales System',
        highlightAr: 'نظام مبيعات كامل',
        features: [
            { text: '12 Social Media Designs', textAr: '12 تصميم سوشيال ميديا' },
            { text: 'Reels Visit (4 Videos)', textAr: 'زيارة ريلز (4 فيديوهات)' },
            { text: 'FB/Instagram Ads Management', textAr: 'إدارة إعلانات فيسبوك/انستغرام' },
            { text: 'Corporate Website', textAr: 'موقع مؤسسي' },
            { text: 'Lead Capture System', textAr: 'نظام جمع العملاء المحتملين' },
        ],
        includedServices: ['web_corporate', 'media_reels', 'growth_fb', 'auto_datacapture', 'content_creative'],
    },
};

// Helper: Get all services as flat array
export const getAllServices = () => {
    return Object.values(SERVICES).flat();
};

// Helper: Get service by ID
export const getServiceById = (id) => {
    return getAllServices().find(service => service.id === id);
};

// Helper: Calculate package original price
export const calculatePackageOriginalPrice = (packageData) => {
    return packageData.includedServices.reduce((total, serviceId) => {
        const service = getServiceById(serviceId);
        return total + (service?.price || 0);
    }, 0);
};
