# Lumos Digital Ascent

Modern marketing site for Lumos Agency, highlighting services, process, portfolio highlights, and a lead-capture form.

## Tech Stack

- Vite + React 18 + TypeScript
- Tailwind CSS with a custom design system
- Radix UI primitives via shadcn/ui
- React Query, React Router, Sonner toasts, EmailJS (client-side)

## Getting Started

```sh
git clone <your-repo-url>
cd lumos-digital-ascent-main
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` by default.

## Available Scripts

- `npm run dev` – start the Vite dev server
- `npm run build` – build the production bundle
- `npm run preview` – preview the production build locally
- `npm run lint` – run ESLint across the repo

## Customization Notes

- Colors, typography, and helper utilities live in `src/index.css`.
- Landing page sections are in `src/components` and composed in `src/pages/Index.tsx`.
- The contact form uses EmailJS. Replace `YOUR_PUBLIC_KEY`, `YOUR_SERVICE_ID`, and `YOUR_TEMPLATE_ID` in `src/components/EnhancedContact.tsx`, and keep the EmailJS script include in `index.html`.

## Deployment

Any static hosting platform that supports Vite builds (e.g., Vercel, Netlify, GitHub Pages) will work:

```sh
npm run build
# deploy the contents of the generated dist/ folder
```

Make sure environment-specific secrets (EmailJS, analytics, etc.) are configured with your hosting provider rather than hard-coded in the repo.
