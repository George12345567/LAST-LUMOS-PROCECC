// ============================================
// APP BUILDER - ENHANCED LIVE PREVIEW TOOL
// ============================================
// Advanced app design tool for mobile-first experiences

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Palette,
  Menu,
  Grid,
  Settings,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Copy,
  Move,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Image,
  Star,
  Heart,
  ShoppingCart,
  Search,
  Bell,
  User,
  Home,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Coffee,
  Utensils,
  Scissors,
  Stethoscope,
  ShoppingBag,
  Car,
  Plane,
  Camera,
  Wifi,
  Battery,
  Signal,
  MoreHorizontal,
  LayoutGrid,
  Layers,
  Sliders,
  RefreshCw,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Share2,
  Type,
  Maximize2,
  Minimize2,
  Bookmark,
  Filter,
  Tag,
  DollarSign,
  Percent,
  Package,
  Truck,
  CreditCard,
  Gift,
  MessageCircle,
  Send,
  ThumbsUp,
  Award,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

import type { 
  AppDesign, 
  AppTheme, 
  MenuItem, 
  AppPage, 
  AppSettings, 
  AppFeatures,
  AppNavigation 
} from '../types';

// ============================================
// CONSTANTS
// ============================================

const SERVICE_TYPES = [
  { value: 'restaurant', label: 'مطعم', icon: Utensils, color: '#ef4444' },
  { value: 'cafe', label: 'كافيه', icon: Coffee, color: '#f97316' },
  { value: 'salon', label: 'صالون', icon: Scissors, color: '#ec4899' },
  { value: 'pharmacy', label: 'صيدلية', icon: Stethoscope, color: '#22c55e' },
  { value: 'store', label: 'متجر', icon: ShoppingBag, color: '#3b82f6' },
  { value: 'clinic', label: 'عيادة', icon: Stethoscope, color: '#06b6d4' },
  { value: 'travel', label: 'سفر', icon: Plane, color: '#8b5cf6' },
  { value: 'automotive', label: 'سيارات', icon: Car, color: '#64748b' }
];

const THEME_PRESETS = [
  { 
    name: 'Ocean',
    colors: { primary: '#00bcd4', accent: '#00acc1', background: '#ffffff', text: '#1e293b', textSecondary: '#64748b' }
  },
  { 
    name: 'Forest',
    colors: { primary: '#22c55e', accent: '#16a34a', background: '#ffffff', text: '#1e293b', textSecondary: '#64748b' }
  },
  { 
    name: 'Sunset',
    colors: { primary: '#f97316', accent: '#ea580c', background: '#ffffff', text: '#1e293b', textSecondary: '#64748b' }
  },
  { 
    name: 'Rose',
    colors: { primary: '#ec4899', accent: '#db2777', background: '#ffffff', text: '#1e293b', textSecondary: '#64748b' }
  },
  { 
    name: 'Royal',
    colors: { primary: '#8b5cf6', accent: '#7c3aed', background: '#ffffff', text: '#1e293b', textSecondary: '#64748b' }
  },
  { 
    name: 'Dark',
    colors: { primary: '#00bcd4', accent: '#00acc1', background: '#0f172a', text: '#f8fafc', textSecondary: '#94a3b8' }
  }
];

const SAMPLE_ITEMS: MenuItem[] = [
  { id: 1, name: 'برجر كلاسيك', nameEn: 'Classic Burger', description: 'برجر لحم مع جبنة شيدر', price: 45, category: 'main', image: '/placeholder.jpg', available: true, rating: 4.5, featured: true },
  { id: 2, name: 'بيتزا مارجريتا', nameEn: 'Margherita Pizza', description: 'صلصة طماطم مع جبنة موتزاريلا', price: 65, category: 'main', image: '/placeholder.jpg', available: true, rating: 4.7, featured: true },
  { id: 3, name: 'سلطة سيزر', nameEn: 'Caesar Salad', description: 'خس روماني مع صوص سيزر', price: 35, category: 'appetizer', image: '/placeholder.jpg', available: true, rating: 4.3 },
  { id: 4, name: 'عصير برتقال', nameEn: 'Orange Juice', description: 'عصير برتقال طازج', price: 18, category: 'beverage', image: '/placeholder.jpg', available: true, rating: 4.8 },
  { id: 5, name: 'تشيز كيك', nameEn: 'Cheesecake', description: 'كيك الجبنة مع صوص التوت', price: 28, category: 'dessert', image: '/placeholder.jpg', available: true, rating: 4.6 }
];

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: Grid },
  { id: 'main', label: 'رئيسي', icon: Utensils },
  { id: 'appetizer', label: 'مقبلات', icon: Star },
  { id: 'beverage', label: 'مشروبات', icon: Coffee },
  { id: 'dessert', label: 'حلويات', icon: Gift }
];

// ============================================
// INTERFACES
// ============================================

interface AppBuilderProps {
  appDesign: AppDesign | null;
  onUpdate: (updates: Partial<AppDesign>) => void;
  onSave: () => void;
  syncedColors?: string[];
  syncedFont?: string;
  logoUrl?: string;
}

// ============================================
// PHONE FRAME COMPONENT
// ============================================

interface PhoneFrameProps {
  children: React.ReactNode;
  theme: AppTheme;
  settings: AppSettings;
  businessName: string;
  zoom?: number;
}

const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  theme,
  settings,
  businessName,
  zoom = 100
}) => {
  const currentTime = new Date().toLocaleTimeString('ar-EG', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  return (
    <motion.div
      className="relative mx-auto"
      style={{
        width: 375,
        height: 812,
        transform: `scale(${zoom / 100})`,
        transformOrigin: 'center top'
      }}
    >
      {/* Phone Frame */}
      <div className="absolute inset-0 bg-slate-900 rounded-[50px] shadow-2xl border-4 border-slate-800">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-900 rounded-b-3xl z-20" />
        
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-slate-700" />
        </div>
        
        {/* Status Bar */}
        <div 
          className="absolute top-0 left-0 right-0 h-12 flex items-end justify-between px-8 pb-1 z-10"
          style={{ color: settings.darkMode ? '#f8fafc' : '#1e293b' }}
        >
          <span className="text-xs font-semibold">{currentTime}</span>
          <div className="flex items-center gap-1">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-4 h-4" />
          </div>
        </div>
        
        {/* Screen */}
        <div 
          className="absolute inset-4 top-12 bottom-4 rounded-[38px] overflow-hidden"
          style={{ 
            backgroundColor: theme.colors.background,
            direction: settings.rtl ? 'rtl' : 'ltr'
          }}
        >
          {children}
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-700 rounded-full" />
      </div>
    </motion.div>
  );
};

// ============================================
// APP HEADER COMPONENT
// ============================================

interface AppHeaderProps {
  businessName: string;
  theme: AppTheme;
  logoUrl?: string;
  showSearch?: boolean;
  onSearchClick?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  businessName,
  theme,
  logoUrl,
  showSearch = true,
  onSearchClick
}) => {
  return (
    <div 
      className="flex items-center justify-between p-4"
      style={{ backgroundColor: theme.colors.background }}
    >
      <div className="flex items-center gap-3">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: theme.colors.primary }}
          >
            {businessName.charAt(0)}
          </div>
        )}
        <div>
          <h1 
            className="font-bold text-lg"
            style={{ 
              color: theme.colors.text,
              fontFamily: theme.typography.fontFamily 
            }}
          >
            {businessName}
          </h1>
          <div className="flex items-center gap-1 text-xs" style={{ color: theme.colors.textSecondary }}>
            <MapPin className="w-3 h-3" />
            <span>2.5 كم</span>
            <span className="mx-1">•</span>
            <Clock className="w-3 h-3" />
            <span>25-35 د</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {showSearch && (
          <button 
            onClick={onSearchClick}
            className="p-2 rounded-full transition-colors hover:bg-slate-100"
            style={{ color: theme.colors.primary }}
          >
            <Search className="w-5 h-5" />
          </button>
        )}
        <button 
          className="p-2 rounded-full transition-colors hover:bg-slate-100"
          style={{ color: theme.colors.primary }}
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ============================================
// CATEGORY TABS COMPONENT
// ============================================

interface CategoryTabsProps {
  categories: typeof CATEGORIES;
  activeCategory: string;
  onSelect: (id: string) => void;
  theme: AppTheme;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onSelect,
  theme
}) => {
  return (
    <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all"
            style={{
              backgroundColor: isActive ? theme.colors.primary : 'transparent',
              color: isActive ? '#ffffff' : theme.colors.textSecondary,
              border: isActive ? 'none' : `1px solid ${theme.colors.textSecondary}33`
            }}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ============================================
// MENU ITEM CARD COMPONENT
// ============================================

interface MenuItemCardProps {
  item: MenuItem;
  theme: AppTheme;
  onAddToCart?: () => void;
  onFavorite?: () => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  theme,
  onAddToCart,
  onFavorite
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 p-3 rounded-xl transition-all"
      style={{ 
        backgroundColor: theme.colors.background,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      {/* Image */}
      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: `${theme.colors.primary}20` }}
        >
          <Utensils className="w-8 h-8" style={{ color: theme.colors.primary }} />
        </div>
        {item.featured && (
          <div 
            className="absolute top-1 right-1 px-2 py-0.5 rounded-full text-[10px] text-white font-bold"
            style={{ backgroundColor: theme.colors.primary }}
          >
            مميز
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <h3 
              className="font-semibold text-sm"
              style={{ 
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamily 
              }}
            >
              {item.name}
            </h3>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-1"
            >
              <Heart 
                className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`}
                style={{ color: isFavorite ? '#ef4444' : theme.colors.textSecondary }}
              />
            </button>
          </div>
          <p 
            className="text-xs mt-1 line-clamp-2"
            style={{ color: theme.colors.textSecondary }}
          >
            {item.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span 
              className="font-bold"
              style={{ color: theme.colors.primary }}
            >
              {item.price} ر.س
            </span>
            {item.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span 
                  className="text-xs"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {item.rating}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onAddToCart}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// BOTTOM NAVIGATION COMPONENT
// ============================================

interface BottomNavProps {
  navigation: AppNavigation;
  theme: AppTheme;
  activePage: string;
  onNavigate: (pageId: string) => void;
  cartCount?: number;
}

const NAV_ICONS: Record<string, any> = {
  Home, home: Home,
  menu: Menu, Menu,
  ShoppingCart, cart: ShoppingCart,
  Heart, favorites: Heart,
  User, profile: User,
  Search, search: Search,
  Bell, notifications: Bell,
  Settings, settings: Settings,
  Grid, categories: Grid,
  Bookmark, saved: Bookmark
};

const BottomNav: React.FC<BottomNavProps> = ({
  navigation,
  theme,
  activePage,
  onNavigate,
  cartCount = 0
}) => {
  return (
    <div 
      className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-around px-2"
      style={{ 
        backgroundColor: theme.colors.background,
        borderTop: `1px solid ${theme.colors.textSecondary}22`,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
      }}
    >
      {navigation.items.map((item) => {
        const Icon = NAV_ICONS[item.icon] || Home;
        const isActive = activePage === item.id;
        const isCart = item.id === 'cart';
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all"
            style={{
              color: isActive ? theme.colors.primary : theme.colors.textSecondary
            }}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {isCart && cartCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] text-white flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -bottom-1 w-1 h-1 rounded-full"
                style={{ backgroundColor: theme.colors.primary }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

// ============================================
// APP PREVIEW COMPONENT
// ============================================

interface AppPreviewProps {
  appDesign: AppDesign;
  logoUrl?: string;
  zoom: number;
}

const AppPreview: React.FC<AppPreviewProps> = ({ appDesign, logoUrl, zoom }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePage, setActivePage] = useState('home');

  const filteredItems = useMemo(() => {
    const items = appDesign.items.length > 0 ? appDesign.items : SAMPLE_ITEMS;
    if (activeCategory === 'all') return items;
    return items.filter(item => item.category === activeCategory);
  }, [appDesign.items, activeCategory]);

  return (
    <PhoneFrame
      theme={appDesign.theme}
      settings={appDesign.settings}
      businessName={appDesign.business_name}
      zoom={zoom}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <AppHeader
          businessName={appDesign.business_name}
          theme={appDesign.theme}
          logoUrl={logoUrl}
          showSearch={appDesign.features.search}
        />
        
        {/* Categories */}
        <CategoryTabs
          categories={CATEGORIES}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          theme={appDesign.theme}
        />
        
        {/* Menu Items */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3 pb-20">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                theme={appDesign.theme}
              />
            ))}
          </div>
        </ScrollArea>
        
        {/* Bottom Navigation */}
        <BottomNav
          navigation={appDesign.navigation}
          theme={appDesign.theme}
          activePage={activePage}
          onNavigate={setActivePage}
          cartCount={2}
        />
      </div>
    </PhoneFrame>
  );
};

// ============================================
// THEME EDITOR PANEL
// ============================================

interface ThemeEditorProps {
  theme: AppTheme;
  onChange: (theme: AppTheme) => void;
  syncedColors?: string[];
}

const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme, onChange, syncedColors }) => {
  const updateColor = useCallback((key: keyof AppTheme['colors'], value: string) => {
    onChange({
      ...theme,
      colors: { ...theme.colors, [key]: value }
    });
  }, [theme, onChange]);

  return (
    <div className="space-y-4">
      {/* Synced Colors Indicator */}
      {syncedColors && syncedColors.length > 0 && (
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-cyan-400 text-sm mb-2">
            <RefreshCw className="w-4 h-4" />
            <span>ألوان متزامنة من الشعار</span>
          </div>
          <div className="flex gap-2">
            {syncedColors.map((color, idx) => (
              <button
                key={idx}
                onClick={() => updateColor(idx === 0 ? 'primary' : 'accent', color)}
                className="w-8 h-8 rounded-lg border-2 border-white/20 transition-all hover:scale-110"
                style={{ backgroundColor: color }}
                title={`تطبيق اللون ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Preset Themes */}
      <div>
        <Label className="text-slate-300 mb-2 block">ثيمات جاهزة</Label>
        <div className="grid grid-cols-3 gap-2">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onChange({ ...theme, colors: preset.colors })}
              className="p-2 rounded-lg border border-slate-700 hover:border-cyan-500 transition-all"
            >
              <div className="flex gap-1 mb-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.colors.primary }} />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.colors.accent }} />
              </div>
              <span className="text-xs text-slate-400">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="space-y-3">
        <Label className="text-slate-300">ألوان مخصصة</Label>
        
        {[
          { key: 'primary', label: 'اللون الرئيسي' },
          { key: 'accent', label: 'اللون الثانوي' },
          { key: 'background', label: 'الخلفية' },
          { key: 'text', label: 'النص' },
          { key: 'textSecondary', label: 'النص الثانوي' }
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3">
            <input
              type="color"
              value={theme.colors[key as keyof AppTheme['colors']]}
              onChange={(e) => updateColor(key as keyof AppTheme['colors'], e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-sm text-slate-300">{label}</span>
              <span className="text-xs text-slate-500 block">
                {theme.colors[key as keyof AppTheme['colors']]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Typography */}
      <div className="space-y-3">
        <Label className="text-slate-300">الخط</Label>
        <Select
          value={theme.typography.fontFamily}
          onValueChange={(value) => onChange({
            ...theme,
            typography: { ...theme.typography, fontFamily: value }
          })}
        >
          <SelectTrigger className="bg-slate-800 border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['Cairo', 'Tajawal', 'Almarai', 'Poppins', 'Inter'].map(font => (
              <SelectItem key={font} value={font}>
                <span style={{ fontFamily: font }}>{font}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Spacing */}
      <div className="space-y-3">
        <Label className="text-slate-300">حجم الزوايا</Label>
        <Slider
          value={[theme.spacing.borderRadius]}
          onValueChange={([v]) => onChange({
            ...theme,
            spacing: { ...theme.spacing, borderRadius: v }
          })}
          min={0}
          max={24}
          step={2}
        />
      </div>
    </div>
  );
};

// ============================================
// MENU EDITOR PANEL
// ============================================

interface MenuEditorProps {
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
}

const MenuEditor: React.FC<MenuEditorProps> = ({ items, onChange }) => {
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const displayItems = items.length > 0 ? items : SAMPLE_ITEMS;

  const addItem = useCallback(() => {
    const newItem: MenuItem = {
      id: Date.now(),
      name: 'عنصر جديد',
      nameEn: 'New Item',
      description: 'وصف العنصر',
      price: 0,
      category: 'main',
      available: true
    };
    onChange([...items, newItem]);
    setEditingItem(newItem);
  }, [items, onChange]);

  const updateItem = useCallback((id: number, updates: Partial<MenuItem>) => {
    onChange(items.map(item => item.id === id ? { ...item, ...updates } : item));
  }, [items, onChange]);

  const deleteItem = useCallback((id: number) => {
    onChange(items.filter(item => item.id !== id));
  }, [items, onChange]);

  return (
    <div className="space-y-4">
      {/* Add Item Button */}
      <Button
        onClick={addItem}
        className="w-full gap-2"
        variant="outline"
      >
        <Plus className="w-4 h-4" />
        إضافة عنصر
      </Button>

      {/* Items List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-800/50 rounded-lg flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                <Utensils className="w-5 h-5 text-slate-400" />
              </div>
              
              <div className="flex-1">
                <h4 className="text-white text-sm font-medium">{item.name}</h4>
                <p className="text-slate-400 text-xs">{item.price} ر.س</p>
              </div>

              <div className="flex items-center gap-1">
                <Switch
                  checked={item.available}
                  onCheckedChange={(available) => updateItem(item.id, { available })}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingItem(item)}
                  className="text-slate-400 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteItem(item.id)}
                  className="text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">تعديل العنصر</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">الاسم</Label>
                <Input
                  value={editingItem.name}
                  onChange={(e) => {
                    setEditingItem({ ...editingItem, name: e.target.value });
                    updateItem(editingItem.id, { name: e.target.value });
                  }}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div>
                <Label className="text-slate-300">الوصف</Label>
                <Textarea
                  value={editingItem.description}
                  onChange={(e) => {
                    setEditingItem({ ...editingItem, description: e.target.value });
                    updateItem(editingItem.id, { description: e.target.value });
                  }}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div>
                <Label className="text-slate-300">السعر</Label>
                <Input
                  type="number"
                  value={editingItem.price}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value);
                    setEditingItem({ ...editingItem, price });
                    updateItem(editingItem.id, { price });
                  }}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div>
                <Label className="text-slate-300">التصنيف</Label>
                <Select
                  value={editingItem.category}
                  onValueChange={(category) => {
                    setEditingItem({ ...editingItem, category });
                    updateItem(editingItem.id, { category });
                  }}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================
// SETTINGS EDITOR PANEL
// ============================================

interface SettingsEditorProps {
  settings: AppSettings;
  features: AppFeatures;
  onSettingsChange: (settings: AppSettings) => void;
  onFeaturesChange: (features: AppFeatures) => void;
}

const SettingsEditor: React.FC<SettingsEditorProps> = ({
  settings,
  features,
  onSettingsChange,
  onFeaturesChange
}) => {
  return (
    <div className="space-y-6">
      {/* App Settings */}
      <div className="space-y-4">
        <h4 className="text-white font-medium">إعدادات التطبيق</h4>
        
        <div className="flex items-center justify-between">
          <Label className="text-slate-300">الوضع الليلي</Label>
          <Switch
            checked={settings.darkMode}
            onCheckedChange={(darkMode) => onSettingsChange({ ...settings, darkMode })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-slate-300">اتجاه RTL</Label>
          <Switch
            checked={settings.rtl}
            onCheckedChange={(rtl) => onSettingsChange({ ...settings, rtl })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-slate-300">إظهار التقييمات</Label>
          <Switch
            checked={settings.showRatings}
            onCheckedChange={(showRatings) => onSettingsChange({ ...settings, showRatings })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-slate-300">تفعيل الأنيميشن</Label>
          <Switch
            checked={settings.enableAnimations}
            onCheckedChange={(enableAnimations) => onSettingsChange({ ...settings, enableAnimations })}
          />
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h4 className="text-white font-medium">الميزات</h4>
        
        {[
          { key: 'cart', label: 'سلة التسوق', icon: ShoppingCart },
          { key: 'favorites', label: 'المفضلة', icon: Heart },
          { key: 'reviews', label: 'التقييمات', icon: Star },
          { key: 'notifications', label: 'الإشعارات', icon: Bell },
          { key: 'search', label: 'البحث', icon: Search },
          { key: 'filters', label: 'الفلاتر', icon: Filter },
          { key: 'socialShare', label: 'المشاركة', icon: Share2 },
          { key: 'chat', label: 'المحادثة', icon: MessageCircle }
        ].map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-slate-400" />
              <Label className="text-slate-300">{label}</Label>
            </div>
            <Switch
              checked={features[key as keyof AppFeatures] || false}
              onCheckedChange={(value) => onFeaturesChange({ ...features, [key]: value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// MAIN APP BUILDER COMPONENT
// ============================================

const AppBuilder: React.FC<AppBuilderProps> = ({
  appDesign,
  onUpdate,
  onSave,
  syncedColors,
  syncedFont,
  logoUrl
}) => {
  // Local state
  const [activeTab, setActiveTab] = useState('theme');
  const [zoom, setZoom] = useState(70);
  const [deviceRotation, setDeviceRotation] = useState(0);

  // Design shorthand with defaults
  const design: AppDesign = appDesign || {
    id: '',
    project_id: '',
    business_name: 'اسم المشروع',
    service_type: 'restaurant',
    pages: [],
    theme: {
      id: 'default',
      name: 'Default',
      colors: { primary: '#00bcd4', accent: '#00acc1', background: '#ffffff', text: '#1e293b', textSecondary: '#64748b' },
      typography: { fontFamily: 'Cairo', fontSize: 1, fontWeight: 400 },
      spacing: { padding: 16, margin: 8, borderRadius: 12 }
    },
    items: [],
    settings: { language: 'ar', rtl: true, darkMode: false, showRatings: true, showSearch: true, enableAnimations: true, animationSpeed: 'normal' },
    features: { cart: true, favorites: true, reviews: true, notifications: true, search: true, filters: true, socialShare: true, chat: false, booking: false, payment: false },
    navigation: { type: 'bottom', items: [
      { id: 'home', label: 'الرئيسية', icon: 'Home' },
      { id: 'menu', label: 'القائمة', icon: 'Menu' },
      { id: 'cart', label: 'السلة', icon: 'ShoppingCart' },
      { id: 'profile', label: 'حسابي', icon: 'User' }
    ]},
    seo: { title: '', description: '', keywords: [] },
    exports: {},
    is_final: false,
    version_number: 1,
    created_at: '',
    updated_at: ''
  };

  // Update handlers
  const updateTheme = useCallback((theme: AppTheme) => {
    onUpdate({ theme });
  }, [onUpdate]);

  const updateItems = useCallback((items: MenuItem[]) => {
    onUpdate({ items });
  }, [onUpdate]);

  const updateSettings = useCallback((settings: AppSettings) => {
    onUpdate({ settings });
  }, [onUpdate]);

  const updateFeatures = useCallback((features: AppFeatures) => {
    onUpdate({ features });
  }, [onUpdate]);

  return (
    <div className="h-full flex">
      {/* Left Panel - Editor */}
      <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col">
        {/* Service Type Selector */}
        <div className="p-4 border-b border-slate-700">
          <Label className="text-slate-300 mb-2 block">نوع الخدمة</Label>
          <div className="grid grid-cols-4 gap-2">
            {SERVICE_TYPES.slice(0, 8).map((service) => {
              const Icon = service.icon;
              const isActive = design.service_type === service.value;
              return (
                <button
                  key={service.value}
                  onClick={() => onUpdate({ service_type: service.value })}
                  className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                    isActive ? 'ring-2 ring-cyan-500' : ''
                  }`}
                  style={{
                    backgroundColor: isActive ? `${service.color}20` : 'transparent',
                    borderColor: service.color
                  }}
                >
                  <Icon 
                    className="w-5 h-5"
                    style={{ color: isActive ? service.color : '#64748b' }}
                  />
                  <span className="text-[10px] text-slate-400">{service.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3 m-2 bg-slate-800">
            <TabsTrigger value="theme" className="text-xs gap-1">
              <Palette className="w-3 h-3" />
              ثيم
            </TabsTrigger>
            <TabsTrigger value="menu" className="text-xs gap-1">
              <Menu className="w-3 h-3" />
              قائمة
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs gap-1">
              <Settings className="w-3 h-3" />
              إعدادات
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="theme" className="p-4 m-0">
              <ThemeEditor
                theme={design.theme}
                onChange={updateTheme}
                syncedColors={syncedColors}
              />
            </TabsContent>

            <TabsContent value="menu" className="p-4 m-0">
              <MenuEditor
                items={design.items}
                onChange={updateItems}
              />
            </TabsContent>

            <TabsContent value="settings" className="p-4 m-0">
              <SettingsEditor
                settings={design.settings}
                features={design.features}
                onSettingsChange={updateSettings}
                onFeaturesChange={updateFeatures}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col bg-slate-950">
        {/* Toolbar */}
        <div className="h-12 bg-slate-900/80 border-b border-slate-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Input
              value={design.business_name}
              onChange={(e) => onUpdate({ business_name: e.target.value })}
              className="w-48 bg-slate-800 border-slate-700 text-sm"
              placeholder="اسم المشروع"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(z => Math.max(50, z - 10))}
              className="text-slate-400"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-400 w-12 text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(z => Math.min(100, z + 10))}
              className="text-slate-400"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeviceRotation(r => r === 0 ? 90 : 0)}
              className="text-slate-400"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 flex items-center justify-center overflow-auto p-8">
          <div style={{ transform: `rotate(${deviceRotation}deg)` }}>
            <AppPreview
              appDesign={design}
              logoUrl={logoUrl}
              zoom={zoom}
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Quick Actions */}
      <div className="w-16 bg-slate-900 border-l border-slate-700 flex flex-col items-center py-4 gap-4">
        <TooltipProvider>
          {[
            { icon: Eye, label: 'معاينة', action: () => toast.info('معاينة') },
            { icon: Download, label: 'تصدير', action: () => toast.info('تصدير') },
            { icon: Share2, label: 'مشاركة', action: () => toast.info('مشاركة') },
            { icon: Layers, label: 'قوالب', action: () => toast.info('قوالب') }
          ].map(({ icon: Icon, label, action }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={action}
                  className="text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <Icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">{label}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>

        {/* Sync Status */}
        {syncedColors && syncedColors.length > 0 && (
          <div className="mt-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-1">
                    <RefreshCw className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] text-cyan-400">متزامن</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                  الألوان متزامنة من Logo Studio
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppBuilder;
