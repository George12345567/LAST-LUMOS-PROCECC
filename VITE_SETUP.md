# إعداد Vite و @vitejs/plugin-react-swc

## ✅ الإعدادات الصحيحة

### 1. `vite.config.ts`
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const plugins = [
    react({
      // SWC options for better performance and compatibility
      jsxRuntime: "automatic",
    }),
  ];

  // Add componentTagger only in development mode
  if (mode === "development") {
    plugins.push(componentTagger());
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Optimize dependencies for better performance
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
    },
  };
});
```

### 2. `package.json` - devDependencies
```json
{
  "devDependencies": {
    "@vitejs/plugin-react-swc": "^4.2.2",
    "vite": "^7.2.4"
  }
}
```

**⚠️ مهم**: لا تستخدم `@vitejs/plugin-react` مع `@vitejs/plugin-react-swc` - استخدم واحد فقط!

## 🔧 حل المشاكل الشائعة

### المشكلة: `Cannot find package 'vite'`

**الحل:**
```bash
# 1. احذف node_modules و package-lock.json
Remove-Item -Recurse -Force node_modules,package-lock.json

# 2. نظف npm cache
npm cache clean --force

# 3. أعد تثبيت الحزم
npm install

# 4. تأكد من تثبيت vite
npm install vite@^7.2.4 --save-dev
```

### المشكلة: تضارب بين `@vitejs/plugin-react` و `@vitejs/plugin-react-swc`

**الحل:**
```bash
# احذف @vitejs/plugin-react إذا كان موجوداً
npm uninstall @vitejs/plugin-react

# تأكد من وجود @vitejs/plugin-react-swc فقط
npm install @vitejs/plugin-react-swc@^4.2.2 --save-dev
```

## ✅ التحقق من الإعداد

```bash
# 1. تحقق من تثبيت vite
npm list vite

# 2. تحقق من تثبيت @vitejs/plugin-react-swc
npm list @vitejs/plugin-react-swc

# 3. اختبر البناء
npm run build

# 4. اختبر dev server
npm run dev
```

## 📝 ملاحظات مهمة

1. **استخدم `@vitejs/plugin-react-swc` فقط** - أسرع وأفضل أداء
2. **لا تستخدم `@vitejs/plugin-react`** - قد يسبب تضارب
3. **تأكد من تثبيت `vite`** - يجب أن يكون في `node_modules/vite`
4. **نظف cache إذا لزم الأمر** - `npm cache clean --force`


