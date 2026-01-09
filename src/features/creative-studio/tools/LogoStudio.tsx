// ============================================
// LOGO STUDIO - ENHANCED LOGO DESIGNER
// ============================================
// Advanced logo design tool with AI, templates, and brand kit

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  Image,
  Palette,
  Sparkles,
  Download,
  Undo,
  Redo,
  Eye,
  Copy,
  Trash2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Grid,
  Layers,
  Settings,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Search,
  Plus,
  Minus,
  RefreshCw,
  Wand2,
  Sliders,
  Maximize2,
  Box,
  Circle,
  Square,
  Triangle,
  Star,
  Heart,
  Hexagon,
  Shield,
  Coffee,
  ShoppingBag,
  Utensils,
  Scissors,
  Stethoscope,
  Pill,
  Car,
  Home,
  Briefcase,
  Camera,
  Music,
  Plane,
  Laptop,
  Smartphone as Phone,
  Bookmark,
  Award,
  Crown,
  Diamond,
  Flame,
  Leaf,
  Sun,
  Moon,
  CloudSun,
  Droplet,
  Zap,
  Globe,
  Map,
  Compass,
  Target,
  TrendingUp,
  BarChart2,
  PieChart,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  HelpCircle,
  MessageCircle,
  Send,
  Mail,
  Phone as PhoneIcon,
  MapPin,
  Clock,
  Calendar,
  Bell,
  Gift,
  Tag,
  CreditCard,
  Truck,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { toast } from 'sonner';

import type { LogoDesign, LogoConfig, LogoMockup, BrandKit } from '../types';

// ============================================
// CONSTANTS
// ============================================

const FONTS = [
  { value: 'Cairo', label: 'Cairo', category: 'arabic' },
  { value: 'Tajawal', label: 'Tajawal', category: 'arabic' },
  { value: 'Almarai', label: 'Almarai', category: 'arabic' },
  { value: 'Amiri', label: 'Amiri', category: 'arabic' },
  { value: 'Changa', label: 'Changa', category: 'arabic' },
  { value: 'El Messiri', label: 'El Messiri', category: 'arabic' },
  { value: 'Lateef', label: 'Lateef', category: 'arabic' },
  { value: 'Scheherazade', label: 'Scheherazade', category: 'arabic' },
  { value: 'Poppins', label: 'Poppins', category: 'english' },
  { value: 'Inter', label: 'Inter', category: 'english' },
  { value: 'Montserrat', label: 'Montserrat', category: 'english' },
  { value: 'Roboto', label: 'Roboto', category: 'english' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'english' },
  { value: 'Raleway', label: 'Raleway', category: 'english' },
  { value: 'Oswald', label: 'Oswald', category: 'english' },
  { value: 'Merriweather', label: 'Merriweather', category: 'english' }
];

const PRESET_COLORS = [
  '#00bcd4', '#00acc1', '#0097a7', '#00838f',
  '#3498db', '#2980b9', '#1abc9c', '#16a085',
  '#9b59b6', '#8e44ad', '#e74c3c', '#c0392b',
  '#f39c12', '#d35400', '#2ecc71', '#27ae60',
  '#34495e', '#2c3e50', '#95a5a6', '#7f8c8d',
  '#1e293b', '#0f172a', '#f8fafc', '#e2e8f0',
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

const GRADIENT_PRESETS = [
  { name: 'Ocean', colors: ['#667eea', '#764ba2'] },
  { name: 'Sunset', colors: ['#f093fb', '#f5576c'] },
  { name: 'Forest', colors: ['#11998e', '#38ef7d'] },
  { name: 'Fire', colors: ['#f12711', '#f5af19'] },
  { name: 'Night', colors: ['#232526', '#414345'] },
  { name: 'Aurora', colors: ['#00c6ff', '#0072ff'] },
  { name: 'Rose', colors: ['#ee9ca7', '#ffdde1'] },
  { name: 'Gold', colors: ['#d4a574', '#c99545'] }
];

const ICON_CATEGORIES = {
  business: { label: 'أعمال', icons: [Briefcase, TrendingUp, BarChart2, Target, Award, Crown] },
  food: { label: 'طعام', icons: [Coffee, Utensils, ShoppingBag, Package] },
  health: { label: 'صحة', icons: [Stethoscope, Pill, Heart, Activity] },
  tech: { label: 'تقنية', icons: [Laptop, Phone, Globe, Zap] },
  nature: { label: 'طبيعة', icons: [Leaf, Sun, CloudSun, Droplet] },
  shapes: { label: 'أشكال', icons: [Circle, Square, Triangle, Hexagon, Diamond, Star, Shield] },
  services: { label: 'خدمات', icons: [Car, Home, Camera, Scissors, Plane, Truck] }
};

const MOCKUP_TYPES = [
  { id: 'card', label: 'بطاقة عمل', icon: CreditCard },
  { id: 'storefront', label: 'واجهة متجر', icon: Home },
  { id: 'tshirt', label: 'تي شيرت', icon: Box },
  { id: 'device', label: 'شاشة جهاز', icon: Phone },
  { id: 'paper', label: 'ورق رسمي', icon: Mail },
  { id: 'sign', label: 'لافتة', icon: MapPin },
  { id: 'bag', label: 'حقيبة', icon: ShoppingBag },
  { id: 'cup', label: 'كوب', icon: Coffee }
];

// ============================================
// INTERFACES
// ============================================

interface LogoStudioProps {
  logoDesign: LogoDesign | null;
  onUpdate: (updates: Partial<LogoDesign>) => void;
  onSave: () => void;
  onExport?: (format: string) => void;
  syncEnabled?: boolean;
  onSyncColors?: (colors: string[]) => void;
}

// ============================================
// ICON LIBRARY COMPONENT
// ============================================

interface IconLibraryProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
}

const IconLibrary: React.FC<IconLibraryProps> = ({ selectedIcon, onSelect }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  const filteredIcons = useMemo(() => {
    const allIcons: { name: string; icon: any; category: string }[] = [];
    
    Object.entries(ICON_CATEGORIES).forEach(([catKey, catValue]) => {
      catValue.icons.forEach((Icon, idx) => {
        const name = `${catKey}_${idx}`;
        if (!search || name.toLowerCase().includes(search.toLowerCase()) || 
            catValue.label.includes(search)) {
          if (category === 'all' || category === catKey) {
            allIcons.push({ name, icon: Icon, category: catKey });
          }
        }
      });
    });
    
    return allIcons;
  }, [search, category]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="بحث عن أيقونة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-slate-800 border-slate-700"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={category === 'all' ? 'default' : 'secondary'}
          className="cursor-pointer"
          onClick={() => setCategory('all')}
        >
          الكل
        </Badge>
        {Object.entries(ICON_CATEGORIES).map(([key, value]) => (
          <Badge
            key={key}
            variant={category === key ? 'default' : 'secondary'}
            className="cursor-pointer"
            onClick={() => setCategory(key)}
          >
            {value.label}
          </Badge>
        ))}
      </div>

      {/* Icons Grid */}
      <ScrollArea className="h-[200px]">
        <div className="grid grid-cols-6 gap-2">
          {filteredIcons.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                selectedIcon === name
                  ? 'bg-cyan-600 text-white ring-2 ring-cyan-400'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

// ============================================
// COLOR PICKER COMPONENT
// ============================================

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  presets?: string[];
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  label,
  presets = PRESET_COLORS
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors w-full">
          <div
            className="w-6 h-6 rounded border border-slate-600"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm text-slate-300 flex-1 text-right">
            {label || color}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-slate-900 border-slate-700 p-4">
        {/* Presets */}
        <div className="grid grid-cols-8 gap-2 mb-4">
          {presets.map((c) => (
            <button
              key={c}
              onClick={() => onChange(c)}
              className={`w-6 h-6 rounded transition-all ${
                color === c ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : ''
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Custom Input */}
        <div className="flex gap-2">
          <Input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 p-1 bg-slate-800 border-slate-700"
          />
          <Input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-slate-800 border-slate-700 text-sm"
            placeholder="#000000"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

// ============================================
// GRADIENT PICKER COMPONENT
// ============================================

interface GradientPickerProps {
  gradient: { enabled: boolean; colors: string[]; angle: number };
  onChange: (gradient: { enabled: boolean; colors: string[]; angle: number }) => void;
}

const GradientPicker: React.FC<GradientPickerProps> = ({ gradient, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-slate-300">تفعيل التدرج</Label>
        <Switch
          checked={gradient.enabled}
          onCheckedChange={(enabled) => onChange({ ...gradient, enabled })}
        />
      </div>

      {gradient.enabled && (
        <>
          {/* Preset Gradients */}
          <div className="grid grid-cols-4 gap-2">
            {GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onChange({ ...gradient, colors: preset.colors })}
                className="h-8 rounded-lg transition-all hover:ring-2 hover:ring-cyan-400"
                style={{
                  background: `linear-gradient(${gradient.angle}deg, ${preset.colors[0]}, ${preset.colors[1]})`
                }}
                title={preset.name}
              />
            ))}
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-2 gap-2">
            <ColorPicker
              color={gradient.colors[0]}
              onChange={(c) => onChange({ ...gradient, colors: [c, gradient.colors[1]] })}
              label="اللون الأول"
            />
            <ColorPicker
              color={gradient.colors[1]}
              onChange={(c) => onChange({ ...gradient, colors: [gradient.colors[0], c] })}
              label="اللون الثاني"
            />
          </div>

          {/* Angle */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-slate-300">زاوية التدرج</Label>
              <span className="text-sm text-slate-400">{gradient.angle}°</span>
            </div>
            <Slider
              value={[gradient.angle]}
              onValueChange={([angle]) => onChange({ ...gradient, angle })}
              min={0}
              max={360}
              step={15}
              className="w-full"
            />
          </div>
        </>
      )}
    </div>
  );
};

// ============================================
// LOGO CANVAS COMPONENT
// ============================================

interface LogoCanvasProps {
  config: LogoConfig;
  zoom: number;
  showGrid: boolean;
}

const LogoCanvas: React.FC<LogoCanvasProps> = ({ config, zoom, showGrid }) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Get icon component
  const IconComponent = useMemo(() => {
    if (!config.iconName) return null;
    
    const [category, idx] = config.iconName.split('_');
    const categoryIcons = ICON_CATEGORIES[category as keyof typeof ICON_CATEGORIES];
    if (!categoryIcons) return null;
    
    return categoryIcons.icons[parseInt(idx)] || null;
  }, [config.iconName]);

  // Build background style
  const backgroundStyle = useMemo(() => {
    if (config.gradient?.enabled && config.gradient.colors.length >= 2) {
      return {
        background: `linear-gradient(${config.gradient.angle}deg, ${config.gradient.colors[0]}, ${config.gradient.colors[1]})`
      };
    }
    return {
      backgroundColor: config.backgroundColor || 'transparent'
    };
  }, [config.backgroundColor, config.gradient]);

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-950 overflow-hidden relative">
      {/* Grid Overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      )}

      {/* Canvas */}
      <motion.div
        ref={canvasRef}
        className="relative"
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'center'
        }}
      >
        {/* Logo Container */}
        <div
          className="w-[300px] h-[300px] rounded-2xl flex flex-col items-center justify-center gap-4 shadow-2xl transition-all"
          style={{
            ...backgroundStyle,
            padding: config.padding || 40
          }}
        >
          {/* Icon */}
          {config.showIcon && IconComponent && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <IconComponent
                className="transition-all"
                style={{
                  width: config.iconSize || 64,
                  height: config.iconSize || 64,
                  color: config.iconColor || '#00bcd4'
                }}
              />
            </motion.div>
          )}

          {/* Text */}
          {config.text && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h1
                className="transition-all"
                style={{
                  fontFamily: config.fontFamily || 'Cairo',
                  fontSize: config.fontSize || 36,
                  fontWeight: config.fontWeight || 700,
                  color: config.textColor || '#ffffff',
                  letterSpacing: config.letterSpacing || 0,
                  textShadow: config.shadow?.enabled
                    ? `${config.shadow.offsetX}px ${config.shadow.offsetY}px ${config.shadow.blur}px ${config.shadow.color}`
                    : 'none'
                }}
              >
                {config.text}
              </h1>
              {config.tagline && (
                <p
                  className="mt-2 transition-all"
                  style={{
                    fontFamily: config.fontFamily || 'Cairo',
                    fontSize: (config.fontSize || 36) * 0.4,
                    color: config.textColor || '#ffffff',
                    opacity: 0.8
                  }}
                >
                  {config.tagline}
                </p>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ============================================
// MOCKUP PREVIEW COMPONENT
// ============================================

interface MockupPreviewProps {
  config: LogoConfig;
  mockupType: string;
}

const MockupPreview: React.FC<MockupPreviewProps> = ({ config, mockupType }) => {
  const MockupIcon = MOCKUP_TYPES.find(m => m.id === mockupType)?.icon || CreditCard;

  return (
    <div className="aspect-video bg-slate-900 rounded-xl p-4 flex items-center justify-center">
      <div className="text-center">
        <MockupIcon className="w-12 h-12 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-400 text-sm">
          معاينة {MOCKUP_TYPES.find(m => m.id === mockupType)?.label}
        </p>
      </div>
    </div>
  );
};

// ============================================
// AI SUGGESTIONS COMPONENT
// ============================================

interface AISuggestionsProps {
  businessName: string;
  serviceType: string;
  onApply: (suggestion: Partial<LogoConfig>) => void;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({
  businessName,
  serviceType,
  onApply
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<Partial<LogoConfig>[]>([]);

  const generateSuggestions = useCallback(async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newSuggestions: Partial<LogoConfig>[] = [
      {
        textColor: '#00bcd4',
        iconColor: '#00acc1',
        backgroundColor: '#1e293b',
        gradient: { enabled: true, colors: ['#667eea', '#764ba2'], angle: 135 }
      },
      {
        textColor: '#ffffff',
        iconColor: '#f97316',
        backgroundColor: '#0f172a',
        gradient: { enabled: false, colors: [], angle: 0 }
      },
      {
        textColor: '#1e293b',
        iconColor: '#22c55e',
        backgroundColor: '#f8fafc',
        gradient: { enabled: true, colors: ['#11998e', '#38ef7d'], angle: 90 }
      }
    ];
    
    setSuggestions(newSuggestions);
    setIsGenerating(false);
    toast.success('تم إنشاء اقتراحات AI');
  }, []);

  return (
    <div className="space-y-4">
      <Button
        onClick={generateSuggestions}
        disabled={isGenerating}
        className="w-full gap-2"
        variant="outline"
      >
        {isGenerating ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Wand2 className="w-4 h-4" />
        )}
        {isGenerating ? 'جاري التوليد...' : 'اقتراحات AI'}
      </Button>

      {suggestions.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onApply(suggestion)}
              className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-cyan-400 transition-all"
              style={{
                background: suggestion.gradient?.enabled
                  ? `linear-gradient(${suggestion.gradient.angle}deg, ${suggestion.gradient.colors[0]}, ${suggestion.gradient.colors[1]})`
                  : suggestion.backgroundColor
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span
                  className="text-lg font-bold"
                  style={{ color: suggestion.textColor }}
                >
                  {businessName?.charAt(0) || 'A'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN LOGO STUDIO COMPONENT
// ============================================

const LogoStudio: React.FC<LogoStudioProps> = ({
  logoDesign,
  onUpdate,
  onSave,
  onExport,
  syncEnabled = true,
  onSyncColors
}) => {
  // Local state
  const [activeTab, setActiveTab] = useState('text');
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [selectedMockup, setSelectedMockup] = useState('card');
  const [history, setHistory] = useState<LogoConfig[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Config shorthand
  const config = logoDesign?.config || {
    text: '',
    tagline: '',
    fontFamily: 'Cairo',
    fontSize: 36,
    fontWeight: 700,
    textColor: '#ffffff',
    iconName: '',
    iconSize: 64,
    iconColor: '#00bcd4',
    showIcon: true,
    backgroundColor: '#1e293b',
    gradient: { enabled: false, colors: [], angle: 0 },
    letterSpacing: 0,
    padding: 40,
    shadow: { enabled: false, color: '#000000', blur: 10, offsetX: 0, offsetY: 4 }
  };

  // Update config
  const updateConfig = useCallback((updates: Partial<LogoConfig>) => {
    const newConfig = { ...config, ...updates };
    
    // Add to history
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newConfig]);
    setHistoryIndex(prev => prev + 1);
    
    onUpdate({
      ...logoDesign,
      config: newConfig
    });

    // Sync colors if enabled
    if (syncEnabled && onSyncColors) {
      const colors = [];
      if (newConfig.textColor) colors.push(newConfig.textColor);
      if (newConfig.iconColor) colors.push(newConfig.iconColor);
      if (newConfig.gradient?.enabled && newConfig.gradient.colors) {
        colors.push(...newConfig.gradient.colors);
      }
      onSyncColors(colors);
    }
  }, [config, logoDesign, onUpdate, historyIndex, syncEnabled, onSyncColors]);

  // Undo/Redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = useCallback(() => {
    if (!canUndo) return;
    setHistoryIndex(prev => prev - 1);
    onUpdate({ ...logoDesign, config: history[historyIndex - 1] });
  }, [canUndo, historyIndex, history, logoDesign, onUpdate]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    setHistoryIndex(prev => prev + 1);
    onUpdate({ ...logoDesign, config: history[historyIndex + 1] });
  }, [canRedo, historyIndex, history, logoDesign, onUpdate]);

  return (
    <div className="h-full flex">
      {/* Left Panel - Tools */}
      <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-4 m-2 bg-slate-800">
            <TabsTrigger value="text" className="text-xs gap-1">
              <Type className="w-3 h-3" />
              نص
            </TabsTrigger>
            <TabsTrigger value="icon" className="text-xs gap-1">
              <Image className="w-3 h-3" />
              أيقونة
            </TabsTrigger>
            <TabsTrigger value="style" className="text-xs gap-1">
              <Palette className="w-3 h-3" />
              ستايل
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs gap-1">
              <Sparkles className="w-3 h-3" />
              AI
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            {/* Text Tab */}
            <TabsContent value="text" className="p-4 space-y-4 m-0">
              <div className="space-y-2">
                <Label className="text-slate-300">اسم العلامة التجارية</Label>
                <Input
                  value={config.text}
                  onChange={(e) => updateConfig({ text: e.target.value })}
                  placeholder="اسم الشركة"
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">الشعار الفرعي</Label>
                <Input
                  value={config.tagline}
                  onChange={(e) => updateConfig({ tagline: e.target.value })}
                  placeholder="شعار فرعي أو وصف"
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">الخط</Label>
                <Select
                  value={config.fontFamily}
                  onValueChange={(value) => updateConfig({ fontFamily: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="text-xs text-slate-500 px-2 py-1">عربي</div>
                    {FONTS.filter(f => f.category === 'arabic').map(font => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.label}</span>
                      </SelectItem>
                    ))}
                    <div className="text-xs text-slate-500 px-2 py-1 mt-2">إنجليزي</div>
                    {FONTS.filter(f => f.category === 'english').map(font => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-slate-300">حجم الخط</Label>
                  <span className="text-sm text-slate-400">{config.fontSize}px</span>
                </div>
                <Slider
                  value={[config.fontSize || 36]}
                  onValueChange={([v]) => updateConfig({ fontSize: v })}
                  min={12}
                  max={120}
                  step={2}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-slate-300">تباعد الحروف</Label>
                  <span className="text-sm text-slate-400">{config.letterSpacing}px</span>
                </div>
                <Slider
                  value={[config.letterSpacing || 0]}
                  onValueChange={([v]) => updateConfig({ letterSpacing: v })}
                  min={-5}
                  max={20}
                  step={1}
                />
              </div>

              <ColorPicker
                color={config.textColor || '#ffffff'}
                onChange={(color) => updateConfig({ textColor: color })}
                label="لون النص"
              />
            </TabsContent>

            {/* Icon Tab */}
            <TabsContent value="icon" className="p-4 space-y-4 m-0">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">إظهار الأيقونة</Label>
                <Switch
                  checked={config.showIcon}
                  onCheckedChange={(checked) => updateConfig({ showIcon: checked })}
                />
              </div>

              {config.showIcon && (
                <>
                  <IconLibrary
                    selectedIcon={config.iconName || ''}
                    onSelect={(iconName) => updateConfig({ iconName })}
                  />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-slate-300">حجم الأيقونة</Label>
                      <span className="text-sm text-slate-400">{config.iconSize}px</span>
                    </div>
                    <Slider
                      value={[config.iconSize || 64]}
                      onValueChange={([v]) => updateConfig({ iconSize: v })}
                      min={24}
                      max={200}
                      step={4}
                    />
                  </div>

                  <ColorPicker
                    color={config.iconColor || '#00bcd4'}
                    onChange={(color) => updateConfig({ iconColor: color })}
                    label="لون الأيقونة"
                  />
                </>
              )}
            </TabsContent>

            {/* Style Tab */}
            <TabsContent value="style" className="p-4 space-y-4 m-0">
              <ColorPicker
                color={config.backgroundColor || '#1e293b'}
                onChange={(color) => updateConfig({ backgroundColor: color })}
                label="لون الخلفية"
              />

              <GradientPicker
                gradient={config.gradient || { enabled: false, colors: [], angle: 0 }}
                onChange={(gradient) => updateConfig({ gradient })}
              />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-slate-300">الحشوة الداخلية</Label>
                  <span className="text-sm text-slate-400">{config.padding}px</span>
                </div>
                <Slider
                  value={[config.padding || 40]}
                  onValueChange={([v]) => updateConfig({ padding: v })}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              {/* Shadow */}
              <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">ظل النص</Label>
                  <Switch
                    checked={config.shadow?.enabled || false}
                    onCheckedChange={(enabled) => updateConfig({ 
                      shadow: { ...config.shadow, enabled } as any
                    })}
                  />
                </div>

                {config.shadow?.enabled && (
                  <div className="space-y-2">
                    <ColorPicker
                      color={config.shadow.color || '#000000'}
                      onChange={(color) => updateConfig({
                        shadow: { ...config.shadow, color } as any
                      })}
                      label="لون الظل"
                    />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-xs text-slate-400">Blur</Label>
                        <Slider
                          value={[config.shadow.blur || 10]}
                          onValueChange={([v]) => updateConfig({
                            shadow: { ...config.shadow, blur: v } as any
                          })}
                          min={0}
                          max={50}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* AI Tab */}
            <TabsContent value="ai" className="p-4 space-y-4 m-0">
              <AISuggestions
                businessName={config.text || ''}
                serviceType=""
                onApply={(suggestion) => updateConfig(suggestion)}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-12 bg-slate-900/80 border-b border-slate-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={undo}
                    disabled={!canUndo}
                    className="text-slate-400"
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>تراجع</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={redo}
                    disabled={!canRedo}
                    className="text-slate-400"
                  >
                    <Redo className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>إعادة</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(z => Math.max(25, z - 25))}
              className="text-slate-400"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-400 w-12 text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom(z => Math.min(200, z + 25))}
              className="text-slate-400"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowGrid(!showGrid)}
              className={showGrid ? 'text-cyan-400' : 'text-slate-400'}
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <LogoCanvas
          config={config}
          zoom={zoom}
          showGrid={showGrid}
        />
      </div>

      {/* Right Panel - Mockups */}
      <div className="w-64 bg-slate-900 border-l border-slate-700 p-4">
        <h3 className="text-white font-semibold mb-4">معاينة الموك أب</h3>
        
        {/* Mockup Type Selector */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {MOCKUP_TYPES.slice(0, 8).map((mockup) => {
            const Icon = mockup.icon;
            return (
              <button
                key={mockup.id}
                onClick={() => setSelectedMockup(mockup.id)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  selectedMockup === mockup.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
                title={mockup.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {/* Mockup Preview */}
        <MockupPreview config={config} mockupType={selectedMockup} />

        {/* Sync Status */}
        {syncEnabled && (
          <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 text-cyan-400">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">المزامنة مفعلة</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              الألوان والخطوط تتزامن مع App Builder
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoStudio;
