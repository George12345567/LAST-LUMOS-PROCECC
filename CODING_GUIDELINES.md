# قواعد البرمجة والتنظيم (Coding Guidelines)

## 📋 القواعد الأساسية

### 1. حجم الملفات (File Size Rules)
- **الحد الأقصى**: 500 سطر لكل ملف
- **الحد الموصى به**: 300 سطر
- **إذا تجاوز الملف 500 سطر**: يجب تقسيمه فوراً إلى ملفات أصغر

### 2. تنظيم الملفات الكبيرة

عندما يكون الملف كبيراً، قم بتقسيمه كالتالي:

#### أ) نقل البيانات الكبيرة إلى `constants.ts`
```typescript
// ❌ خطأ - بيانات كبيرة داخل المكون
const items = [/* 400 سطر من البيانات */];

// ✅ صحيح - نقل البيانات إلى constants.ts
import { defaultItems } from './constants';
```

#### ب) تقسيم المكونات الكبيرة
```typescript
// ❌ خطأ - مكون كبير
const LargeComponent = () => {
  // 800 سطر من الكود
};

// ✅ صحيح - تقسيم إلى مكونات أصغر
import { Header } from './components/Header';
import { Body } from './components/Body';
import { Footer } from './components/Footer';

const LargeComponent = () => {
  return (
    <>
      <Header />
      <Body />
      <Footer />
    </>
  );
};
```

#### ج) نقل الـ Hooks إلى ملفات منفصلة
```typescript
// ❌ خطأ - hooks كبيرة داخل المكون
const Component = () => {
  const complexHook = () => {
    // 200 سطر من الكود
  };
};

// ✅ صحيح - نقل إلى hooks/useComplex.ts
import { useComplex } from '@/hooks/useComplex';
```

### 3. هيكل المجلدات (Folder Structure)

```
src/
├── features/              # الميزات (كل feature في مجلد منفصل)
│   ├── feature-name/
│   │   ├── index.ts      # تصدير المكون الرئيسي
│   │   ├── FeatureName.tsx
│   │   ├── constants.ts  # إذا كانت البيانات كبيرة
│   │   └── components/  # إذا كان هناك مكونات فرعية
│
├── components/           # المكونات المشتركة
│   ├── layout/          # مكونات التخطيط
│   ├── shared/          # مكونات مشتركة
│   └── ui/              # مكونات UI (shadcn)
│
├── hooks/               # Custom Hooks
│   └── index.ts         # تصدير جميع الـ hooks
│
├── types/               # TypeScript Types
│   └── index.ts         # جميع الـ types
│
├── lib/                 # Utilities و Constants
│   ├── utils.ts
│   └── constants.ts
│
└── config/              # إعدادات
    └── env.ts
```

### 4. قواعد الـ Imports

```typescript
// ✅ صحيح - ترتيب الـ imports
// 1. React و React libraries
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// 2. Third-party libraries
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

// 3. Internal imports (types, constants)
import type { MenuItem } from "@/types";
import { ROUTES } from "@/lib/constants";

// 4. Internal imports (components, hooks)
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks";

// 5. Relative imports
import { Header } from "./components/Header";
```

### 5. قواعد الـ Exports

كل مجلد feature يجب أن يحتوي على `index.ts`:

```typescript
// src/features/hero/index.ts
export { default } from './TypewriterHero';
```

### 6. قواعد الـ Types

- جميع الـ types في `src/types/index.ts`
- لا تعيد تعريف types موجودة
- استخدم `import type` للـ types

```typescript
// ✅ صحيح
import type { MenuItem, Theme } from "@/types";

// ❌ خطأ - إعادة تعريف
interface MenuItem { /* ... */ }
```

### 7. قواعد الـ Constants

- البيانات الكبيرة → `constants.ts` داخل الـ feature
- الثوابت العامة → `src/lib/constants.ts`
- إعدادات البيئة → `src/config/env.ts`

### 8. قواعد الـ Components

- مكون واحد لكل ملف
- اسم الملف = اسم المكون
- استخدم `export default` للمكون الرئيسي

```typescript
// ✅ صحيح
// TypewriterHero.tsx
const TypewriterHero = () => { /* ... */ };
export default TypewriterHero;
```

### 9. قواعد الـ Hooks

- كل hook في ملف منفصل
- اسم الملف: `useHookName.tsx` أو `useHookName.ts`
- تصدير من `hooks/index.ts`

```typescript
// ✅ صحيح
// hooks/use-mobile.tsx
export function useIsMobile() { /* ... */ }
export const useMobile = useIsMobile;

// hooks/index.ts
export { useMobile, useIsMobile } from './use-mobile';
```

## ⚠️ قواعد صارمة (Strict Rules)

### 1. لا ملفات كبيرة
- إذا تجاوز الملف 500 سطر → **يجب** تقسيمه فوراً
- لا تنتظر حتى يكبر الملف أكثر

### 2. لا كود مكرر
- إذا كان هناك كود مكرر → استخرجه إلى:
  - Hook (إذا كان logic)
  - Component (إذا كان UI)
  - Utility function (إذا كان helper)
  - Constant (إذا كان data)

### 3. لا بيانات مكررة
- استخدم `constants.ts` المشتركة
- لا تعيد تعريف البيانات نفسها في ملفات مختلفة

### 4. لا imports غير منظمة
- رتب الـ imports حسب الترتيب المحدد
- استخدم path aliases (`@/`) دائماً

### 5. يجب الاختبار والتحقق بعد كل تنفيذ
- **لا تعتبر المهمة منتهية حتى تتأكد من أن الموقع يعمل بدون مشاكل**
- بعد أي تغيير، يجب:
  - ✅ تشغيل الموقع والتأكد من عدم وجود أخطاء
  - ✅ اختبار الميزة الجديدة/المعدلة
  - ✅ التأكد من أن الـ scroll والـ navigation يعملان بشكل صحيح
  - ✅ فحص Console للتأكد من عدم وجود errors
  - ✅ اختبار على Mobile view إذا كانت الميزة تأثر على الموبايل


## 📝 Checklist قبل إضافة أي ملف جديد

- [ ] هل الملف أقل من 500 سطر؟
- [ ] هل البيانات الكبيرة في `constants.ts`؟
- [ ] هل الـ types في `types/index.ts`؟
- [ ] هل الـ imports منظمة؟
- [ ] هل يوجد `index.ts` في الـ feature folder؟
- [ ] هل الـ exports صحيحة؟
- [ ] هل لا يوجد كود مكرر؟
- [ ] **هل تم اختبار الموقع والتأكد من عدم وجود مشاكل؟**

## 🔍 كيفية التحقق من حجم الملف

```bash
# في PowerShell
Get-Content src/path/to/file.tsx | Measure-Object -Line

# أو
(Get-Content src/path/to/file.tsx | Measure-Object -Line).Lines
```

## 📚 أمثلة

### مثال 1: تقسيم مكون كبير

**قبل (800 سطر):**
```typescript
// LargeComponent.tsx - 800 سطر
const LargeComponent = () => {
  // كل الكود هنا
};
```

**بعد (منظم):**
```typescript
// LargeComponent.tsx - 100 سطر
import { Header } from './components/Header';
import { Body } from './components/Body';
import { Footer } from './components/Footer';

const LargeComponent = () => {
  return (
    <>
      <Header />
      <Body />
      <Footer />
    </>
  );
};

// components/Header.tsx - 200 سطر
// components/Body.tsx - 300 سطر
// components/Footer.tsx - 200 سطر
```

### مثال 2: نقل البيانات الكبيرة

**قبل:**
```typescript
// Component.tsx - 600 سطر
const Component = () => {
  const data = [/* 400 سطر من البيانات */];
  // باقي الكود
};
```

**بعد:**
```typescript
// Component.tsx - 200 سطر
import { data } from './constants';

const Component = () => {
  // باقي الكود
};

// constants.ts - 400 سطر
export const data = [/* البيانات */];
```

## 🎯 الهدف النهائي

- **كود نظيف ومنظم**
- **ملفات صغيرة وسهلة القراءة**
- **سهولة الصيانة والتطوير**
- **لا مشاكل في الأداء**

---

**ملاحظة مهمة**: هذه القواعد صارمة ويجب اتباعها في كل إضافة جديدة!



