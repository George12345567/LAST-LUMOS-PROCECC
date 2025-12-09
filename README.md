# Lumos Digital Ascent

Modern marketing site for Lumos Agency, highlighting services, process, portfolio highlights, and a lead-capture form with complete authentication system.

## 🔐 Security Notice

**⚠️ IMPORTANT:** Please read [SECURITY.md](./SECURITY.md) before deploying to production.

**Critical Issue:** Service Role Key is currently used in frontend. This must be moved to backend before production deployment.

## ⚠️ قواعد مهمة - يجب اتباعها دائماً

**قبل أي إضافة أو تعديل جديد، راجع:**

- 📋 [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) - القواعد الصارمة للبرمجة
- 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) - بنية المشروع

### القواعد الأساسية:

- ✅ **الحد الأقصى للملف: 500 سطر** (الموصى به: 300 سطر)
- ✅ **لا ملفات كبيرة** - إذا تجاوز الملف 500 سطر → يجب تقسيمه فوراً
- ✅ **لا كود مكرر** - استخدم hooks/components/utilities
- ✅ **لا بيانات مكررة** - استخدم `constants.ts`
- ✅ **استخدم `@/` للـ imports** - path aliases دائماً
- ✅ **استخدم `index.ts`** - في كل feature folder

**هذه القواعد صارمة ويجب اتباعها في كل إضافة جديدة!**

## Tech Stack

- Vite + React 18 + TypeScript
- Tailwind CSS with a custom design system
- Radix UI primitives via shadcn/ui
- React Query, React Router, Sonner toasts, EmailJS (client-side)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun
- Supabase account

### Installation

1. Clone the repository:

```sh
git clone <your-repo-url>
cd lumos-digital-ascent-main
```

2. Install dependencies:

```sh
npm install
```

3. Set up environment variables:

```sh
cp .env.example .env
```

4. Edit `.env` file with your credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_KEY=your_service_key
VITE_MASTER_ADMIN_EMAIL=your_admin_email
```

5. Run the development server:

```sh
## Documentation

- 📋 [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) - القواعد الصارمة للبرمجة
- 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) - بنية المشروع
- 🔐 [AUTH_SETUP.md](./AUTH_SETUP.md) - إعداد نظام المصادقة
- ✅ [AUTH_FIXES.md](./AUTH_FIXES.md) - إصلاحات نظام المصادقة
- 📊 [IMPROVEMENTS_REPORT.md](./IMPROVEMENTS_REPORT.md) - تقرير المشاكل والتحسينات
- 🛡️ [SECURITY.md](./SECURITY.md) - ملاحظات أمنية مهمة
- 📖 [QUICK_START_AUTH.md](./QUICK_START_AUTH.md) - دليل سريع للمصادقة

## Deployment
```

The dev server runs at `http://localhost:5173` by default.

## Available Scripts

- `npm run dev` – start the Vite dev server
- `npm run build` – build the production bundle
- `npm run preview` – preview the production build locally
- `npm run lint` – run ESLint across the repo

## Project Structure

- **Features**: Organized by functionality in `src/features/`
- **Components**: Shared components in `src/components/` (layout, shared, ui)
- **Pages**: Route pages in `src/pages/`
- **Hooks**: Custom hooks in `src/hooks/`
- **Types**: TypeScript definitions in `src/types/`
- **Config**: Environment configuration in `src/config/`

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed structure.

## Customization Notes

- Colors, typography, and helper utilities live in `src/index.css`.
- Landing page sections are in `src/features/` and composed in `src/pages/Index.tsx`.
- The contact form uses EmailJS. Configure environment variables in `.env` file (see `.env.example`).

## Deployment

Any static hosting platform that supports Vite builds (e.g., Vercel, Netlify, GitHub Pages) will work:

```sh
npm run build
# deploy the contents of the generated dist/ folder
```

Make sure environment-specific secrets (EmailJS, analytics, etc.) are configured with your hosting provider rather than hard-coded in the repo.
