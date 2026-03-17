import { HOME_AI_PRICING_TRAINING_SCENARIOS } from "./homeAiPricingTraining";

export type HomeAiActionId = "pricing" | "contact" | "services" | "preview" | "faq";

export type HomeAiScenario = {
    id: string;
    keywords: string[];
    replyEn: string;
    replyAr: string;
    actions?: HomeAiActionId[];
};

export const HOME_AI_ACTION_LABELS: Record<HomeAiActionId, { en: string; ar: string }> = {
    pricing: { en: "Open Pricing", ar: "افتح الأسعار" },
    contact: { en: "Talk To Team", ar: "تواصل مع الفريق" },
    services: { en: "Explore Services", ar: "استعرض الخدمات" },
    preview: { en: "Open Preview", ar: "افتح المعاينة" },
    faq: { en: "Open FAQ", ar: "افتح الأسئلة" },
};

const GENERIC_HOME_AI_KEYWORDS = new Set([
    "price",
    "pricing",
    "service",
    "services",
    "compare",
    "difference",
    "which one",
    "plan",
    "package",
    "best",
    "fit",
    "value",
    "time",
    "process",
    "steps",
    "budget",
    "سعر",
    "الأسعار",
    "الاسعار",
    "خدمة",
    "الخدمات",
    "مقارنة",
    "الفرق",
    "أفضل",
    "باقة",
    "مدة",
    "خطوات",
    "ميزانية",
]);

export const HOME_AI_QUICK_PROMPTS = {
    en: [
        "Hi",
        "What is the best plan for me?",
        "Which services do I need first?",
        "How long does the process take?",
        "Help me write a brief for the team",
    ],
    ar: [
        "هاي",
        "ايه أنسب باقة ليا؟",
        "إيه الخدمات اللي أبدأ بيها؟",
        "المشروع بياخد قد إيه؟",
        "اكتبلي brief أبعته للفريق",
    ],
};

const HOME_AI_BASE_SCENARIOS: HomeAiScenario[] = [
    {
        id: "greeting",
        keywords: ["hi", "hello", "hey", "هاي", "هلا", "السلام", "مرحبا", "اهلا"],
        replyEn: "Hi. I can help you choose the right plan, understand the workflow, compare services, or prepare a clear brief before you contact the team.",
        replyAr: "أهلاً. أقدر أساعدك تختار الباقة المناسبة، تفهم طريقة الشغل، تقارن الخدمات، أو تجهز brief واضح قبل ما تتواصل مع الفريق.",
        actions: ["pricing", "services", "contact"],
    },
    {
        id: "pricing",
        keywords: ["price", "pricing", "plan", "package", "cost", "budget", "سعر", "الاسعار", "الأسعار", "باقة", "الباقة", "تكلفة", "ميزانية"],
        replyEn: "The best way to choose pricing is to match it to your goal first: launch, redesign, content system, or automation. Open pricing and I can help you narrow the best fit after that.",
        replyAr: "أفضل طريقة لاختيار السعر هي ربطه بهدفك أولًا: إطلاق، إعادة تصميم، نظام محتوى، أو أتمتة. افتح الأسعار وبعدها أقدر أساعدك تحدد أنسب اختيار.",
        actions: ["pricing", "contact"],
    },
    {
        id: "services",
        keywords: ["service", "services", "offer", "solution", "خدمة", "الخدمات", "حل", "حلول", "offers"],
        replyEn: "Lumos usually creates the strongest result when brand, landing experience, content, and automation work together. If you tell me your business type, I can suggest the leanest service stack.",
        replyAr: "Lumos يطلع أفضل نتيجة عادة لما البراند وتجربة الصفحة والمحتوى والأتمتة يشتغلوا مع بعض. لو قلت لي نوع نشاطك، أقدر أرشح لك أقل stack يخدمك بوضوح.",
        actions: ["services", "contact"],
    },
    {
        id: "timeline",
        keywords: ["time", "timeline", "how long", "duration", "مدة", "وقت", "تايم", "كم يوم", "قد ايه"],
        replyEn: "The timeline depends on scope, but the smooth path is: choose the direction, send the brief, align on the visual route, then move into execution and review. If speed matters, start with pricing and contact today.",
        replyAr: "المدة تعتمد على حجم الشغل، لكن المسار الطبيعي هو: نحدد الاتجاه، نستلم الـ brief، نتفق على المسار البصري، ثم ندخل التنفيذ والمراجعة. لو السرعة مهمة، ابدأ بالأسعار والتواصل اليوم.",
        actions: ["pricing", "contact"],
    },
    {
        id: "brief",
        keywords: ["brief", "write", "message", "contact", "proposal", "write for team", "بريف", "brief", "اكتب", "رسالة", "تواصل", "الفريق", "ابعت"],
        replyEn: "A strong brief is short and specific: what your business does, what you want to improve, what style you like, and what result matters most. If you want, I can help you phrase that next.",
        replyAr: "الـ brief القوي يكون قصير وواضح: نشاطك بيعمل إيه، إيه اللي عايز تطوره، ستايلك المفضل، وأهم نتيجة تهمك. لو تحب، أقدر أساعدك تصيغه بشكل أفضل بعد كده.",
        actions: ["contact"],
    },
    {
        id: "branding",
        keywords: ["brand", "branding", "identity", "logo", "color", "colors", "style", "براند", "هوية", "شعار", "لوجو", "الوان", "ألوان", "ستايل"],
        replyEn: "If your goal is a sharper brand, start with positioning, logo quality, and a disciplined color direction. Lumos can turn that into a system that improves both perception and conversion.",
        replyAr: "لو هدفك براند أقوى، ابدأ بالتموضع، جودة الشعار، واتجاه لوني منضبط. Lumos يقدر يحوّل ده إلى نظام يرفع الانطباع والتحويلات معًا.",
        actions: ["services", "preview"],
    },
    {
        id: "website",
        keywords: ["website", "landing", "page", "site", "ويب", "موقع", "لاندنج", "صفحة"],
        replyEn: "For a website or landing page, the priority is clarity: one promise, one offer path, and one conversion flow. The preview section will give you the fastest feel for the direction.",
        replyAr: "لو الهدف موقع أو landing page، الأولوية تكون للوضوح: وعد واحد، مسار عرض واحد، ومسار تحويل واحد. قسم المعاينة هو أسرع مكان تاخد منه إحساس واضح بالاتجاه.",
        actions: ["preview", "services"],
    },
    {
        id: "automation",
        keywords: ["automation", "chatbot", "bot", "whatsapp", "flow", "أتمتة", "بوت", "شات بوت", "واتساب", "فلو"],
        replyEn: "If you want automation, Lumos can connect the experience layer with operational flows like lead handling, chatbot logic, and structured follow-up. The key is defining the exact journey first.",
        replyAr: "لو هدفك الأتمتة، Lumos يقدر يربط طبقة التجربة مع الـ operational flows مثل التقاط العملاء، منطق الشات بوت، والمتابعة المنظمة. الأهم أولًا هو تحديد الرحلة المطلوبة بدقة.",
        actions: ["services", "contact"],
    },
    {
        id: "redesign",
        keywords: ["redesign", "improve", "revamp", "upgrade", "تطوير", "تحسين", "اعادة تصميم", "إعادة تصميم", "تجديد"],
        replyEn: "If this is a redesign, the fastest win is to identify what is underperforming now: trust, clarity, conversion, or visual quality. Then we rebuild the weakest layer first.",
        replyAr: "لو هذا مشروع إعادة تصميم، أسرع مكسب هو تحديد أضعف نقطة حاليًا: الثقة، الوضوح، التحويل، أو الجودة البصرية. بعد ذلك نعيد بناء أضعف طبقة أولًا.",
        actions: ["services", "contact"],
    },
    {
        id: "leadgen",
        keywords: ["lead", "leads", "conversion", "sales", "more customers", "عملاء", "مبيعات", "تحويل", "ليدز", "عملاء اكتر"],
        replyEn: "If the goal is more leads, the right stack is usually offer clarity, a stronger landing flow, better trust cues, and light automation for response speed. That mix tends to move results fastest.",
        replyAr: "لو الهدف هو عملاء أكثر، فالتركيبة المناسبة غالبًا تكون: وضوح العرض، مسار landing أقوى، عناصر ثقة أفضل، وأتمتة خفيفة ترفع سرعة الرد. هذا الخليط يحرك النتائج أسرع عادة.",
        actions: ["services", "pricing"],
    },
    {
        id: "preview",
        keywords: ["preview", "examples", "portfolio", "work", "نماذج", "أمثلة", "معاينة", "اعمال", "أعمال"],
        replyEn: "The preview area is the fastest way to understand the visual and interaction direction. Start there if you want a concrete feel before discussing scope.",
        replyAr: "قسم المعاينة هو أسرع طريقة لفهم الاتجاه البصري والتفاعلي. ابدأ منه لو تريد إحساسًا عمليًا قبل مناقشة النطاق أو التكلفة.",
        actions: ["preview"],
    },
    {
        id: "faq",
        keywords: ["faq", "question", "questions", "how does it work", "سؤال", "اسئلة", "أسئلة", "كيف"],
        replyEn: "If you want faster orientation, the FAQ section is useful for common questions, while I can help you turn your case into a direct next step.",
        replyAr: "لو تريد توجيهًا أسرع، فقسم الأسئلة الشائعة مفيد للأسئلة المتكررة، وأنا أقدر أحوّل حالتك إلى خطوة مباشرة بعد ذلك.",
        actions: ["faq"],
    },
    {
        id: "signup",
        keywords: ["signup", "sign up", "account", "login", "register", "تسجيل", "حساب", "لوجين", "دخول"],
        replyEn: "If you are ready to move, the clean path is: choose pricing, submit your contact details, then create your account so the workflow can continue without delay.",
        replyAr: "لو جاهز تبدأ، فالمسار الأنظف هو: اختر الباقة، أرسل بيانات التواصل، ثم أنشئ حسابك حتى يستمر الشغل بدون تأخير.",
        actions: ["pricing", "contact"],
    },
    {
        id: "fallback",
        keywords: [],
        replyEn: "I can help with pricing, service selection, branding direction, automation, timeline, previewing the work, or preparing the best brief before you contact the team. Ask me one of those directly.",
        replyAr: "أقدر أساعدك في الأسعار، اختيار الخدمات، اتجاه البراند، الأتمتة، المدة، معاينة الشغل، أو تجهيز أفضل brief قبل التواصل مع الفريق. اسألني مباشرة في أي واحدة منهم.",
        actions: ["pricing", "services", "contact"],
    },
];

export const HOME_AI_SCENARIOS: HomeAiScenario[] = [
    ...HOME_AI_PRICING_TRAINING_SCENARIOS,
    ...HOME_AI_BASE_SCENARIOS,
];

export function isArabicPrompt(prompt: string): boolean {
    return /[\u0600-\u06FF]/.test(prompt);
}

export function matchHomeAiScenario(prompt: string): HomeAiScenario {
    const normalized = prompt.trim().toLowerCase();

    const bestMatch = HOME_AI_SCENARIOS
        .map((scenario) => ({
            scenario,
            score: scenario.keywords.reduce((total, keyword) => {
                const normalizedKeyword = keyword.toLowerCase();
                if (!normalized.includes(normalizedKeyword)) {
                    return total;
                }

                if (GENERIC_HOME_AI_KEYWORDS.has(normalizedKeyword)) {
                    return total + 0.35;
                }

                if (normalizedKeyword.length >= 10 || normalizedKeyword.includes(" ")) {
                    return total + 2.2;
                }

                return total + 1;
            }, 0),
            longestKeyword: scenario.keywords.reduce((max, keyword) => Math.max(max, keyword.length), 0),
        }))
        .filter((entry) => entry.score > 0)
        .sort((left, right) => {
            if (right.score !== left.score) return right.score - left.score;
            return right.longestKeyword - left.longestKeyword;
        })[0];

    return bestMatch?.scenario || HOME_AI_BASE_SCENARIOS[HOME_AI_BASE_SCENARIOS.length - 1];
}
