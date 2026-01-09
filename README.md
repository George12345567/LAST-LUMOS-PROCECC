# Lumos Digital Ascent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF.svg)](https://vitejs.dev/)

Modern marketing website for Lumos Agency, featuring a complete authentication system, customer management dashboard, creative studio, and analytics platform.

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

## ✨ Features

- 🎨 **Modern Marketing Site** - Beautiful, responsive landing page with service showcase
- 🔐 **Complete Authentication** - Login, signup, password reset, and session management
- 👥 **Customer Management** - Full CRM with client tracking and analytics
- 🎭 **Creative Studio** - Project management and creative workflow tools
- 📊 **Business Intelligence** - Analytics dashboard with insights and reporting
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- 🌙 **Dark Mode Support** - Built-in theme switching
- ⚡ **High Performance** - Built with Vite for blazing-fast development and builds

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives via shadcn/ui
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Notifications**: Sonner toasts
- **Email**: EmailJS (client-side)

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or bun package manager
- Supabase account

### Installation

1. **Clone the repository:**

```sh
git clone https://github.com/George12345567/lumos-digital-ascent.git
cd lumos-digital-ascent
```

2. **Install dependencies:**

```sh
npm install
```

3. **Set up environment variables:**

```sh
cp .env.example .env
```

4. **Configure your `.env` file with your credentials:**

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_KEY=your_service_key
VITE_MASTER_ADMIN_EMAIL=your_admin_email
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
```

5. **Run the development server:**

```sh
npm run dev
```

The dev server will start at `http://localhost:5173` by default.

## 📜 Available Scripts

- `npm run dev` – Start the Vite development server
- `npm run build` – Build the production bundle
- `npm run preview` – Preview the production build locally
- `npm run lint` – Run ESLint across the repository

## 📁 Project Structure

```
src/
├── components/       # Shared UI components
│   ├── layout/      # Layout components (Header, Footer, etc.)
│   ├── shared/      # Reusable components
│   └── ui/          # shadcn/ui components
├── features/        # Feature-based organization
│   ├── auth/        # Authentication features
│   ├── dashboard/   # Dashboard features
│   └── ...
├── pages/           # Route pages
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
├── config/          # Configuration files
├── lib/             # Library integrations
├── services/        # API services
└── utils/           # Utility functions
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed structure and guidelines.

## 📚 Documentation

- 📋 [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) - Strict coding standards
- 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) - Project architecture
- 🔐 [SECURITY.md](./SECURITY.md) - Security considerations
- 📖 [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) - Quick start guide
- 👥 [CUSTOMER_SYSTEM_GUIDE.md](./CUSTOMER_SYSTEM_GUIDE.md) - Customer management guide
- 💾 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database setup instructions

## 🎨 Customization

- **Design System**: Colors, typography, and utilities are defined in `src/index.css`
- **Components**: Shared components live in `src/components/`
- **Features**: Organized by functionality in `src/features/`
- **Contact Form**: Uses EmailJS - configure environment variables in `.env`

## 🚢 Deployment

The project can be deployed to any static hosting platform that supports Vite builds (Vercel, Netlify, GitHub Pages, etc.):

```sh
npm run build
# Deploy the contents of the dist/ folder
```

**Important:** Configure environment variables with your hosting provider. Never commit secrets to the repository.

### Vercel Deployment

A `vercel.json` configuration file is included for easy Vercel deployment with proper routing.

## 🤝 Contributing

Contributions are welcome! Please read our coding guidelines before submitting pull requests:

1. Follow the strict rules in [CODING_GUIDELINES.md](./CODING_GUIDELINES.md)
2. Keep files under 500 lines (recommended: 300 lines)
3. Use path aliases (`@/`) for imports
4. No duplicate code - create reusable components/hooks
5. Test your changes thoroughly

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Repository**: [https://github.com/George12345567/lumos-digital-ascent](https://github.com/George12345567/lumos-digital-ascent)
