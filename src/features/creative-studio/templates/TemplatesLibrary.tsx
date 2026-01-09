// ============================================
// TEMPLATES LIBRARY
// ============================================
// Pre-designed templates for logos and apps

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Heart,
  Download,
  Eye,
  ChevronRight,
  Sparkles,
  Palette,
  Smartphone,
  Coffee,
  Utensils,
  Scissors,
  Stethoscope,
  ShoppingBag,
  Car,
  Plane,
  Home,
  Briefcase,
  Camera,
  Music,
  Laptop,
  X,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';

import type { LogoConfig, AppTheme, Template } from '../types';

// ============================================
// TEMPLATE DATA
// ============================================

interface LogoTemplate {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  tags: string[];
  config: LogoConfig;
  preview?: string;
  isPremium?: boolean;
  isNew?: boolean;
  downloads?: number;
  rating?: number;
}

interface AppTemplate {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  serviceType: string;
  tags: string[];
  theme: AppTheme;
  preview?: string;
  isPremium?: boolean;
  isNew?: boolean;
  downloads?: number;
  rating?: number;
}

const LOGO_TEMPLATES: LogoTemplate[] = [
  {
    id: 'logo-1',
    name: 'أوشن بلو',
    nameEn: 'Ocean Blue',
    category: 'modern',
    tags: ['business', 'tech', 'minimal'],
    config: {
      text: 'العلامة',
      fontFamily: 'Cairo',
      fontSize: 36,
      fontWeight: 700,
      textColor: '#ffffff',
      iconName: 'business_0',
      iconSize: 64,
      iconColor: '#00bcd4',
      showIcon: true,
      backgroundColor: '#0f172a',
      gradient: { enabled: true, colors: ['#0f172a', '#1e3a5f'], angle: 135 },
      padding: 40
    },
    isNew: true,
    downloads: 1250,
    rating: 4.8
  },
  {
    id: 'logo-2',
    name: 'صحراء ذهبية',
    nameEn: 'Golden Desert',
    category: 'elegant',
    tags: ['restaurant', 'cafe', 'luxury'],
    config: {
      text: 'العلامة',
      fontFamily: 'Amiri',
      fontSize: 40,
      fontWeight: 600,
      textColor: '#1e293b',
      iconName: 'food_0',
      iconSize: 56,
      iconColor: '#d4a574',
      showIcon: true,
      backgroundColor: '#fefce8',
      gradient: { enabled: false, colors: [], angle: 0 },
      padding: 50
    },
    downloads: 890,
    rating: 4.6
  },
  {
    id: 'logo-3',
    name: 'طبيعة خضراء',
    nameEn: 'Nature Green',
    category: 'organic',
    tags: ['health', 'organic', 'natural'],
    config: {
      text: 'العلامة',
      fontFamily: 'Tajawal',
      fontSize: 34,
      fontWeight: 500,
      textColor: '#ffffff',
      iconName: 'nature_0',
      iconSize: 60,
      iconColor: '#22c55e',
      showIcon: true,
      backgroundColor: '#15803d',
      gradient: { enabled: true, colors: ['#15803d', '#166534'], angle: 180 },
      padding: 45
    },
    downloads: 720,
    rating: 4.5
  },
  {
    id: 'logo-4',
    name: 'تقنية مستقبلية',
    nameEn: 'Future Tech',
    category: 'tech',
    tags: ['tech', 'startup', 'digital'],
    config: {
      text: 'العلامة',
      fontFamily: 'Poppins',
      fontSize: 32,
      fontWeight: 700,
      textColor: '#f8fafc',
      iconName: 'tech_0',
      iconSize: 70,
      iconColor: '#8b5cf6',
      showIcon: true,
      backgroundColor: '#18181b',
      gradient: { enabled: true, colors: ['#7c3aed', '#ec4899'], angle: 120 },
      padding: 40
    },
    isPremium: true,
    downloads: 560,
    rating: 4.9
  },
  {
    id: 'logo-5',
    name: 'أناقة وردية',
    nameEn: 'Rose Elegance',
    category: 'feminine',
    tags: ['salon', 'beauty', 'fashion'],
    config: {
      text: 'العلامة',
      fontFamily: 'Playfair Display',
      fontSize: 38,
      fontWeight: 500,
      textColor: '#831843',
      iconName: 'services_3',
      iconSize: 52,
      iconColor: '#ec4899',
      showIcon: true,
      backgroundColor: '#fdf2f8',
      gradient: { enabled: false, colors: [], angle: 0 },
      padding: 48
    },
    downloads: 980,
    rating: 4.7
  },
  {
    id: 'logo-6',
    name: 'داكن أنيق',
    nameEn: 'Dark Minimal',
    category: 'minimal',
    tags: ['modern', 'minimal', 'professional'],
    config: {
      text: 'العلامة',
      fontFamily: 'Inter',
      fontSize: 30,
      fontWeight: 600,
      textColor: '#e2e8f0',
      iconName: '',
      iconSize: 0,
      iconColor: '#00bcd4',
      showIcon: false,
      backgroundColor: '#0f172a',
      gradient: { enabled: false, colors: [], angle: 0 },
      padding: 60
    },
    isNew: true,
    downloads: 430,
    rating: 4.4
  }
];

const APP_TEMPLATES: AppTemplate[] = [
  {
    id: 'app-1',
    name: 'مطعم كلاسيكي',
    nameEn: 'Classic Restaurant',
    category: 'restaurant',
    serviceType: 'restaurant',
    tags: ['food', 'delivery', 'menu'],
    theme: {
      id: 'restaurant-1',
      name: 'Classic Restaurant',
      colors: {
        primary: '#ef4444',
        accent: '#dc2626',
        background: '#ffffff',
        text: '#1e293b',
        textSecondary: '#64748b'
      },
      typography: { fontFamily: 'Cairo', fontSize: 1, fontWeight: 400 },
      spacing: { padding: 16, margin: 8, borderRadius: 12 }
    },
    downloads: 2100,
    rating: 4.8
  },
  {
    id: 'app-2',
    name: 'كافيه عصري',
    nameEn: 'Modern Cafe',
    category: 'cafe',
    serviceType: 'cafe',
    tags: ['coffee', 'drinks', 'cozy'],
    theme: {
      id: 'cafe-1',
      name: 'Modern Cafe',
      colors: {
        primary: '#78350f',
        accent: '#92400e',
        background: '#fef3c7',
        text: '#451a03',
        textSecondary: '#78350f'
      },
      typography: { fontFamily: 'Tajawal', fontSize: 1, fontWeight: 400 },
      spacing: { padding: 16, margin: 8, borderRadius: 16 }
    },
    isNew: true,
    downloads: 1560,
    rating: 4.7
  },
  {
    id: 'app-3',
    name: 'صالون أنيق',
    nameEn: 'Elegant Salon',
    category: 'salon',
    serviceType: 'salon',
    tags: ['beauty', 'booking', 'services'],
    theme: {
      id: 'salon-1',
      name: 'Elegant Salon',
      colors: {
        primary: '#ec4899',
        accent: '#db2777',
        background: '#fdf2f8',
        text: '#831843',
        textSecondary: '#9d174d'
      },
      typography: { fontFamily: 'Almarai', fontSize: 1, fontWeight: 400 },
      spacing: { padding: 16, margin: 8, borderRadius: 20 }
    },
    downloads: 890,
    rating: 4.6
  },
  {
    id: 'app-4',
    name: 'متجر إلكتروني',
    nameEn: 'E-Commerce Store',
    category: 'store',
    serviceType: 'store',
    tags: ['shopping', 'products', 'cart'],
    theme: {
      id: 'store-1',
      name: 'E-Commerce',
      colors: {
        primary: '#3b82f6',
        accent: '#2563eb',
        background: '#ffffff',
        text: '#1e293b',
        textSecondary: '#64748b'
      },
      typography: { fontFamily: 'Cairo', fontSize: 1, fontWeight: 400 },
      spacing: { padding: 16, margin: 8, borderRadius: 12 }
    },
    isPremium: true,
    downloads: 3200,
    rating: 4.9
  },
  {
    id: 'app-5',
    name: 'عيادة طبية',
    nameEn: 'Medical Clinic',
    category: 'clinic',
    serviceType: 'clinic',
    tags: ['health', 'doctors', 'appointments'],
    theme: {
      id: 'clinic-1',
      name: 'Medical Clinic',
      colors: {
        primary: '#06b6d4',
        accent: '#0891b2',
        background: '#ecfeff',
        text: '#164e63',
        textSecondary: '#0e7490'
      },
      typography: { fontFamily: 'Tajawal', fontSize: 1, fontWeight: 400 },
      spacing: { padding: 16, margin: 8, borderRadius: 12 }
    },
    downloads: 650,
    rating: 4.5
  },
  {
    id: 'app-6',
    name: 'داكن عصري',
    nameEn: 'Dark Modern',
    category: 'modern',
    serviceType: 'restaurant',
    tags: ['dark', 'modern', 'premium'],
    theme: {
      id: 'dark-1',
      name: 'Dark Modern',
      colors: {
        primary: '#00bcd4',
        accent: '#00acc1',
        background: '#0f172a',
        text: '#f8fafc',
        textSecondary: '#94a3b8'
      },
      typography: { fontFamily: 'Poppins', fontSize: 1, fontWeight: 400 },
      spacing: { padding: 16, margin: 8, borderRadius: 16 }
    },
    isNew: true,
    isPremium: true,
    downloads: 1800,
    rating: 4.9
  }
];

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: Grid },
  { id: 'modern', label: 'عصري', icon: Laptop },
  { id: 'elegant', label: 'أنيق', icon: Star },
  { id: 'minimal', label: 'بسيط', icon: Grid },
  { id: 'restaurant', label: 'مطعم', icon: Utensils },
  { id: 'cafe', label: 'كافيه', icon: Coffee },
  { id: 'salon', label: 'صالون', icon: Scissors },
  { id: 'store', label: 'متجر', icon: ShoppingBag },
  { id: 'clinic', label: 'عيادة', icon: Stethoscope }
];

// ============================================
// INTERFACES
// ============================================

interface TemplatesLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  activeType: 'logo' | 'app';
  onApplyLogoTemplate?: (config: LogoConfig) => void;
  onApplyAppTemplate?: (theme: AppTheme) => void;
}

// ============================================
// TEMPLATE CARD COMPONENT
// ============================================

interface TemplateCardProps {
  template: LogoTemplate | AppTemplate;
  type: 'logo' | 'app';
  onPreview: () => void;
  onApply: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  type,
  onPreview,
  onApply
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Get colors for preview
  const colors = type === 'logo'
    ? [(template as LogoTemplate).config.backgroundColor, (template as LogoTemplate).config.iconColor]
    : [(template as AppTemplate).theme.colors.primary, (template as AppTemplate).theme.colors.accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700 hover:border-cyan-500/50 transition-all"
    >
      {/* Preview Area */}
      <div 
        className="aspect-video relative overflow-hidden"
        style={{
          background: type === 'logo' && (template as LogoTemplate).config.gradient?.enabled
            ? `linear-gradient(135deg, ${(template as LogoTemplate).config.gradient!.colors[0]}, ${(template as LogoTemplate).config.gradient!.colors[1]})`
            : colors[0]
        }}
      >
        {/* Template Visual */}
        <div className="absolute inset-0 flex items-center justify-center">
          {type === 'logo' ? (
            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-lg mx-auto mb-2"
                style={{ backgroundColor: colors[1] }}
              />
              <span 
                className="text-sm font-bold"
                style={{ 
                  color: (template as LogoTemplate).config.textColor,
                  fontFamily: (template as LogoTemplate).config.fontFamily
                }}
              >
                {template.name}
              </span>
            </div>
          ) : (
            <div 
              className="w-24 h-40 rounded-2xl shadow-lg"
              style={{ backgroundColor: (template as AppTemplate).theme.colors.background }}
            >
              <div 
                className="h-8 rounded-t-2xl"
                style={{ backgroundColor: colors[0] }}
              />
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {template.isNew && (
            <Badge className="bg-cyan-500 text-white text-[10px]">جديد</Badge>
          )}
          {template.isPremium && (
            <Badge className="bg-amber-500 text-white text-[10px]">
              <Star className="w-2 h-2 mr-1" />
              مميز
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-2 left-2 p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
        >
          <Heart 
            className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
          />
        </button>

        {/* Hover Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2"
            >
              <Button
                size="sm"
                variant="secondary"
                onClick={onPreview}
                className="gap-1"
              >
                <Eye className="w-3 h-3" />
                معاينة
              </Button>
              <Button
                size="sm"
                onClick={onApply}
                className="gap-1 bg-cyan-600 hover:bg-cyan-700"
              >
                <Check className="w-3 h-3" />
                تطبيق
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="p-3">
        <h4 className="text-white font-medium text-sm">{template.name}</h4>
        <p className="text-slate-400 text-xs">{template.nameEn}</p>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {template.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-slate-400">{template.rating}</span>
              </div>
            )}
            {template.downloads && (
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-400">{template.downloads}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-1">
            {template.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// TEMPLATE PREVIEW MODAL
// ============================================

interface TemplatePreviewModalProps {
  template: LogoTemplate | AppTemplate | null;
  type: 'logo' | 'app';
  onClose: () => void;
  onApply: () => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  type,
  onClose,
  onApply
}) => {
  if (!template) return null;

  return (
    <Dialog open={!!template} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {type === 'logo' ? <Palette className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
            {template.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Large Preview */}
          <div 
            className="aspect-video rounded-xl overflow-hidden"
            style={{
              background: type === 'logo' && (template as LogoTemplate).config.gradient?.enabled
                ? `linear-gradient(135deg, ${(template as LogoTemplate).config.gradient!.colors[0]}, ${(template as LogoTemplate).config.gradient!.colors[1]})`
                : type === 'logo' 
                  ? (template as LogoTemplate).config.backgroundColor
                  : (template as AppTemplate).theme.colors.background
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              {type === 'logo' ? (
                <div className="text-center">
                  <div 
                    className="w-20 h-20 rounded-xl mx-auto mb-4"
                    style={{ backgroundColor: (template as LogoTemplate).config.iconColor }}
                  />
                  <span 
                    className="text-2xl font-bold"
                    style={{ 
                      color: (template as LogoTemplate).config.textColor,
                      fontFamily: (template as LogoTemplate).config.fontFamily
                    }}
                  >
                    اسم العلامة
                  </span>
                </div>
              ) : (
                <div 
                  className="w-40 h-72 rounded-3xl shadow-2xl overflow-hidden"
                  style={{ backgroundColor: (template as AppTemplate).theme.colors.background }}
                >
                  <div 
                    className="h-12"
                    style={{ backgroundColor: (template as AppTemplate).theme.colors.primary }}
                  />
                  <div className="p-3 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i}
                        className="h-8 rounded-lg"
                        style={{ backgroundColor: `${(template as AppTemplate).theme.colors.primary}20` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Template Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="text-white font-medium">التفاصيل</h5>
              <div className="text-sm text-slate-400 space-y-1">
                <p>الفئة: {template.category}</p>
                <p>التقييم: {template.rating} ⭐</p>
                <p>التحميلات: {template.downloads}</p>
              </div>
            </div>
            <div className="space-y-2">
              <h5 className="text-white font-medium">الوسوم</h5>
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button onClick={onApply} className="bg-cyan-600 hover:bg-cyan-700 gap-2">
              <Check className="w-4 h-4" />
              تطبيق القالب
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// MAIN TEMPLATES LIBRARY COMPONENT
// ============================================

const TemplatesLibrary: React.FC<TemplatesLibraryProps> = ({
  isOpen,
  onClose,
  activeType,
  onApplyLogoTemplate,
  onApplyAppTemplate
}) => {
  const [type, setType] = useState<'logo' | 'app'>(activeType);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewTemplate, setPreviewTemplate] = useState<LogoTemplate | AppTemplate | null>(null);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    const templates = type === 'logo' ? LOGO_TEMPLATES : APP_TEMPLATES;
    
    return templates.filter((t) => {
      const matchesSearch = 
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.nameEn.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      
      const matchesCategory = category === 'all' || t.category === category;
      
      return matchesSearch && matchesCategory;
    });
  }, [type, search, category]);

  // Handle apply
  const handleApply = useCallback((template: LogoTemplate | AppTemplate) => {
    if (type === 'logo') {
      onApplyLogoTemplate?.((template as LogoTemplate).config);
      toast.success(`تم تطبيق قالب "${template.name}"`);
    } else {
      onApplyAppTemplate?.((template as AppTemplate).theme);
      toast.success(`تم تطبيق قالب "${template.name}"`);
    }
    onClose();
  }, [type, onApplyLogoTemplate, onApplyAppTemplate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl h-[80vh] bg-slate-900 rounded-2xl border border-slate-700 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">مكتبة القوالب</h2>
              <p className="text-slate-400 text-sm">اختر قالباً جاهزاً للبدء</p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-slate-400" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          {/* Type Tabs */}
          <div className="flex gap-2">
            <Button
              variant={type === 'logo' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setType('logo')}
              className={type === 'logo' ? 'bg-cyan-600' : ''}
            >
              <Palette className="w-4 h-4 mr-2" />
              شعارات
            </Button>
            <Button
              variant={type === 'app' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setType('app')}
              className={type === 'app' ? 'bg-cyan-600' : ''}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              تطبيقات
            </Button>
          </div>

          {/* Search & View */}
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="بحث في القوالب..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700"
              />
            </div>
            <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-slate-700' : ''}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-slate-700' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-48 border-r border-slate-800 p-4">
            <h4 className="text-slate-400 text-xs font-medium mb-3">الفئات</h4>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-cyan-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Templates Grid */}
          <ScrollArea className="flex-1 p-4">
            {filteredTemplates.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد قوالب مطابقة</p>
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-3 gap-4' 
                : 'space-y-3'
              }>
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    type={type}
                    onPreview={() => setPreviewTemplate(template)}
                    onApply={() => handleApply(template)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700">
          <p className="text-slate-400 text-sm">
            {filteredTemplates.length} قالب متاح
          </p>
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </motion.div>

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        type={type}
        onClose={() => setPreviewTemplate(null)}
        onApply={() => {
          if (previewTemplate) handleApply(previewTemplate);
          setPreviewTemplate(null);
        }}
      />
    </div>
  );
};

export default TemplatesLibrary;
