export const ROUTES = {
  HOME: '/',
  DEMO: '/demo',
  CREATIVE_STUDIO: '/creative-studio',
  CLIENT_LOGIN: '/client-login',
  CLIENT_DASHBOARD: '/clients/dashboard',
  ADMIN_DASHBOARD: '/dashboard',
} as const;

export const NAV_ITEMS = [
  { label: 'الرئيسية', href: ROUTES.HOME },
  { label: 'الخدمات', href: '#services' },
  { label: 'من نحن', href: '#about' },
  { label: 'اتصل بنا', href: '#contact' },
] as const;
