# بنية المشروع (Project Architecture)

## 📁 هيكل المجلدات

```
src/
├── app/                    # التطبيق الرئيسي
│   ├── App.tsx            # المكون الرئيسي
│   └── main.tsx           # نقطة الدخول
│
├── pages/                  # الصفحات
│   ├── Index.tsx          # الصفحة الرئيسية
│   ├── MobileDemoPage.tsx # صفحة المعاينة
│   └── NotFound.tsx       # صفحة 404
│
├── features/              # الميزات (منظمة حسب الوظيفة)
│   ├── hero/              # مكون Hero
│   ├── live-preview/      # أداة المعاينة المباشرة
│   ├── tech-stack/        # التقنيات المستخدمة
│   ├── about/             # معلومات عن الشركة
│   ├── services/          # الخدمات
│   ├── contact/           # نموذج الاتصال
│   ├── faq/               # الأسئلة الشائعة
│   └── process/           # عملية العمل
│
├── components/            # المكونات المشتركة
│   ├── layout/           # مكونات التخطيط
│   │   ├── EnhancedNavbar.tsx
│   │   ├── Footer.tsx
│   │   └── index.ts
│   ├── shared/           # مكونات مشتركة
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingFallback.tsx
│   │   └── index.ts
│   └── ui/               # مكونات UI (shadcn)
│
├── hooks/                # Custom Hooks
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   ├── useScrollReveal.tsx
│   └── index.ts          # تصدير جميع الـ hooks
│
├── lib/                  # المكتبات والأدوات
│   ├── utils.ts          # Utilities
│   └── constants.ts      # الثوابت
│
├── types/                # تعريفات TypeScript
│   └── index.ts          # جميع الـ Types
│
├── config/               # ملفات الإعدادات
│   └── env.ts            # إعدادات البيئة
│
└── styles/               # ملفات الأنماط
    └── index.css         # الأنماط العامة
```

## 🎯 مبادئ التنظيم

### 1. Features (الميزات)
- كل feature في مجلد منفصل
- يحتوي على المكون الرئيسي و `index.ts` للتصدير
- منظم حسب الوظيفة وليس النوع

### 2. Components (المكونات)
- `layout/`: مكونات التخطيط (Navbar, Footer)
- `shared/`: مكونات مشتركة (ErrorBoundary, LoadingFallback)
- `ui/`: مكونات UI من shadcn/ui

### 3. Hooks
- جميع الـ hooks في مجلد `hooks/`
- يتم تصديرها من `hooks/index.ts`

### 4. Types
- جميع TypeScript types في `types/index.ts`
- يتم استيرادها من `@/types`

### 5. Config
- إعدادات البيئة في `config/env.ts`
- استخدام environment variables

## 📝 ملاحظات مهمة

1. **Imports**: استخدم `@/` للـ path aliases
2. **Exports**: استخدم `index.ts` في كل مجلد للتصدير
3. **Types**: جميع الـ types في `types/index.ts`
4. **Constants**: الثوابت في `lib/constants.ts`

## 🔧 الأدوات المستخدمة

- **Vite**: Build tool
- **React 18**: UI Library
- **TypeScript**: Type Safety
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI Components
- **React Router**: Routing
- **React Query**: Data Fetching

## 📋 قواعد مهمة

### حجم الملفات
- **الحد الأقصى**: 500 سطر لكل ملف
- **الحد الموصى به**: 300 سطر
- إذا تجاوز الملف 500 سطر → **يجب** تقسيمه فوراً

### تنظيم الملفات الكبيرة
1. نقل البيانات الكبيرة إلى `constants.ts`
2. تقسيم المكونات الكبيرة إلى مكونات أصغر
3. نقل الـ Hooks الكبيرة إلى ملفات منفصلة

### قواعد صارمة
- ❌ لا ملفات كبيرة (أكثر من 500 سطر)
- ❌ لا كود مكرر
- ❌ لا بيانات مكررة
- ✅ استخدم `constants.ts` للبيانات الكبيرة
- ✅ استخدم `types/index.ts` للـ types
- ✅ استخدم `index.ts` في كل feature folder

**للمزيد من التفاصيل**: راجع `CODING_GUIDELINES.md`

