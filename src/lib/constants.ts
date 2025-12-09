export const ROUTES = {
  HOME: '/',
  DEMO: '/demo',
} as const;

export const NAV_ITEMS = [
  { label: 'الرئيسية', href: ROUTES.HOME },
  { label: 'الخدمات', href: '#services' },
  { label: 'من نحن', href: '#about' },
  { label: 'اتصل بنا', href: '#contact' },
] as const;
