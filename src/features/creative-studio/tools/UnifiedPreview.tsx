// ============================================
// UNIFIED PREVIEW COMPONENT
// ============================================
// Shows logo and app together in various mockup contexts

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Maximize2,
  Minimize2,
  RotateCw,
  Download,
  Share2,
  Smartphone,
  Monitor,
  CreditCard,
  ShoppingBag,
  FileText,
  Package,
  Palette,
  Grid,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import type { LogoDesign, AppDesign, LogoConfig, AppTheme } from '../types';

// ============================================
// INTERFACES
// ============================================

interface UnifiedPreviewProps {
  logoDesign: LogoDesign | null;
  appDesign: AppDesign | null;
  isOpen: boolean;
  onClose: () => void;
  onExport?: (format: string) => void;
}

type MockupScene = 'phone' | 'desktop' | 'card' | 'storefront' | 'paper' | 'product';

// ============================================
// MOCKUP SCENE COMPONENTS
// ============================================

interface LogoRenderProps {
  config: LogoConfig;
  size?: 'sm' | 'md' | 'lg';
}

const LogoRender: React.FC<LogoRenderProps> = ({ config, size = 'md' }) => {
  const sizes = {
    sm: { logo: 60, text: 14 },
    md: { logo: 100, text: 24 },
    lg: { logo: 160, text: 40 }
  };

  const s = sizes[size];

  const bgStyle = useMemo(() => {
    if (config.gradient?.enabled && config.gradient.colors.length >= 2) {
      return {
        background: `linear-gradient(${config.gradient.angle}deg, ${config.gradient.colors[0]}, ${config.gradient.colors[1]})`
      };
    }
    return { backgroundColor: config.backgroundColor || 'transparent' };
  }, [config]);

  return (
    <div
      className="flex items-center justify-center rounded-xl p-4"
      style={{
        ...bgStyle,
        width: s.logo * 2,
        height: s.logo * 1.5
      }}
    >
      <div className="text-center">
        {config.showIcon && config.iconName && (
          <div
            className="mx-auto mb-2"
            style={{
              width: s.logo / 2,
              height: s.logo / 2,
              color: config.iconColor
            }}
          >
            {/* Icon placeholder */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
        )}
        <div
          style={{
            fontFamily: config.fontFamily,
            fontSize: s.text,
            fontWeight: config.fontWeight || 700,
            color: config.textColor
          }}
        >
          {config.text}
        </div>
        {config.tagline && (
          <div
            style={{
              fontFamily: config.fontFamily,
              fontSize: s.text * 0.5,
              color: config.textColor,
              opacity: 0.7
            }}
          >
            {config.tagline}
          </div>
        )}
      </div>
    </div>
  );
};

// Phone Mockup Scene
interface PhoneMockupProps {
  logoConfig: LogoConfig;
  appTheme: AppTheme;
  businessName: string;
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({ logoConfig, appTheme, businessName }) => {
  return (
    <div className="relative w-[280px] h-[560px] bg-slate-900 rounded-[40px] p-3 shadow-2xl">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-b-2xl z-10" />
      
      {/* Screen */}
      <div
        className="w-full h-full rounded-[32px] overflow-hidden"
        style={{ backgroundColor: appTheme.colors.background }}
      >
        {/* Status Bar */}
        <div className="h-10 flex items-center justify-center px-6">
          <span className="text-xs" style={{ color: appTheme.colors.text }}>9:41</span>
        </div>

        {/* App Header */}
        <div className="px-4 py-3 flex items-center gap-3">
          <LogoRender config={logoConfig} size="sm" />
          <div>
            <h1 
              className="font-bold text-lg"
              style={{ 
                color: appTheme.colors.text,
                fontFamily: appTheme.typography.fontFamily 
              }}
            >
              {businessName}
            </h1>
          </div>
        </div>

        {/* Content Placeholder */}
        <div className="px-4 space-y-3">
          <div 
            className="h-32 rounded-xl"
            style={{ backgroundColor: `${appTheme.colors.primary}15` }}
          />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 h-16 rounded-lg"
                style={{ backgroundColor: `${appTheme.colors.primary}10` }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Nav */}
        <div 
          className="absolute bottom-3 left-3 right-3 h-16 rounded-2xl flex items-center justify-around"
          style={{ 
            backgroundColor: appTheme.colors.background,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
          }}
        >
          {['home', 'menu', 'cart', 'profile'].map((item) => (
            <div
              key={item}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: item === 'home' ? `${appTheme.colors.primary}20` : 'transparent' 
              }}
            >
              <div 
                className="w-5 h-5 rounded"
                style={{ 
                  backgroundColor: item === 'home' ? appTheme.colors.primary : appTheme.colors.textSecondary 
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Business Card Mockup
interface CardMockupProps {
  logoConfig: LogoConfig;
  businessName: string;
}

const CardMockup: React.FC<CardMockupProps> = ({ logoConfig, businessName }) => {
  return (
    <div className="relative">
      {/* Card */}
      <div
        className="w-[340px] h-[200px] rounded-xl shadow-2xl p-6 flex flex-col justify-between"
        style={{
          background: logoConfig.gradient?.enabled
            ? `linear-gradient(135deg, ${logoConfig.gradient.colors[0]}, ${logoConfig.gradient.colors[1]})`
            : logoConfig.backgroundColor || '#1e293b'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: logoConfig.iconColor }}
          >
            <span className="text-white font-bold">{businessName.charAt(0)}</span>
          </div>
          <span 
            className="font-bold text-lg"
            style={{ 
              color: logoConfig.textColor,
              fontFamily: logoConfig.fontFamily 
            }}
          >
            {businessName}
          </span>
        </div>

        {/* Contact Info */}
        <div className="space-y-1">
          <p style={{ color: logoConfig.textColor, opacity: 0.8, fontSize: 12 }}>
            contact@{businessName.toLowerCase().replace(/\s/g, '')}.com
          </p>
          <p style={{ color: logoConfig.textColor, opacity: 0.8, fontSize: 12 }}>
            +966 50 000 0000
          </p>
        </div>
      </div>

      {/* Shadow Card */}
      <div 
        className="absolute -bottom-3 left-3 right-3 h-4 rounded-xl opacity-30"
        style={{ backgroundColor: logoConfig.backgroundColor }}
      />
    </div>
  );
};

// Storefront Mockup
interface StorefrontMockupProps {
  logoConfig: LogoConfig;
  businessName: string;
}

const StorefrontMockup: React.FC<StorefrontMockupProps> = ({ logoConfig, businessName }) => {
  return (
    <div className="w-[400px] h-[300px] bg-gradient-to-b from-slate-700 to-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
      {/* Building */}
      <div className="absolute inset-x-8 top-8 bottom-20 bg-slate-600 rounded-t-xl">
        {/* Window */}
        <div className="absolute inset-x-4 top-4 bottom-12 bg-slate-500/30 rounded-lg backdrop-blur">
          <div className="absolute inset-0 flex items-center justify-center">
            <LogoRender config={logoConfig} size="lg" />
          </div>
        </div>
      </div>

      {/* Awning */}
      <div 
        className="absolute bottom-16 inset-x-4 h-8 rounded-t-lg"
        style={{ 
          backgroundColor: logoConfig.gradient?.enabled 
            ? logoConfig.gradient.colors[0] 
            : logoConfig.iconColor 
        }}
      />

      {/* Sidewalk */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-slate-500" />

      {/* Sign */}
      <div 
        className="absolute top-2 left-1/2 -translate-x-1/2 px-6 py-2 rounded-lg shadow-lg"
        style={{ backgroundColor: logoConfig.backgroundColor }}
      >
        <span 
          style={{ 
            color: logoConfig.textColor,
            fontFamily: logoConfig.fontFamily,
            fontWeight: 600
          }}
        >
          {businessName}
        </span>
      </div>
    </div>
  );
};

// ============================================
// MAIN UNIFIED PREVIEW COMPONENT
// ============================================

const UnifiedPreview: React.FC<UnifiedPreviewProps> = ({
  logoDesign,
  appDesign,
  isOpen,
  onClose,
  onExport
}) => {
  const [activeScene, setActiveScene] = useState<MockupScene>('phone');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  // Defaults
  const logoConfig: LogoConfig = logoDesign?.config || {
    text: 'Brand',
    fontFamily: 'Cairo',
    fontSize: 36,
    fontWeight: 700,
    textColor: '#ffffff',
    iconName: '',
    iconSize: 64,
    iconColor: '#00bcd4',
    showIcon: true,
    backgroundColor: '#1e293b',
    padding: 40
  };

  const appTheme: AppTheme = appDesign?.theme || {
    id: 'default',
    name: 'Default',
    colors: {
      primary: '#00bcd4',
      accent: '#00acc1',
      background: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b'
    },
    typography: { fontFamily: 'Cairo', fontSize: 1, fontWeight: 400 },
    spacing: { padding: 16, margin: 8, borderRadius: 12 }
  };

  const businessName = appDesign?.business_name || logoConfig.text || 'My Brand';

  const scenes = [
    { id: 'phone', label: 'تطبيق موبايل', icon: Smartphone },
    { id: 'desktop', label: 'سطح المكتب', icon: Monitor },
    { id: 'card', label: 'بطاقة عمل', icon: CreditCard },
    { id: 'storefront', label: 'واجهة متجر', icon: Package },
    { id: 'paper', label: 'ورق رسمي', icon: FileText },
    { id: 'product', label: 'منتجات', icon: ShoppingBag }
  ];

  const renderScene = () => {
    switch (activeScene) {
      case 'phone':
        return (
          <PhoneMockup
            logoConfig={logoConfig}
            appTheme={appTheme}
            businessName={businessName}
          />
        );
      case 'card':
        return (
          <CardMockup
            logoConfig={logoConfig}
            businessName={businessName}
          />
        );
      case 'storefront':
        return (
          <StorefrontMockup
            logoConfig={logoConfig}
            businessName={businessName}
          />
        );
      default:
        return (
          <div className="text-center text-slate-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>معاينة {scenes.find(s => s.id === activeScene)?.label}</p>
            <p className="text-sm mt-2">قريباً...</p>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className={`fixed ${isFullscreen ? 'inset-0' : 'inset-y-0 right-0 w-[500px]'} bg-slate-900 border-l border-slate-700 z-50 shadow-2xl flex flex-col`}
        >
          {/* Header */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              <h3 className="text-white font-semibold">معاينة موحدة</h3>
              <Badge variant="secondary" className="text-xs">
                {scenes.find(s => s.id === activeScene)?.label}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAutoRotate(!autoRotate)}
                className={autoRotate ? 'text-cyan-400' : 'text-slate-400'}
              >
                {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-slate-400 hover:text-white"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Scene Selector */}
          <div className="px-4 py-3 border-b border-slate-800">
            <ScrollArea className="w-full">
              <div className="flex gap-2">
                {scenes.map((scene) => {
                  const Icon = scene.icon;
                  const isActive = activeScene === scene.id;
                  return (
                    <button
                      key={scene.id}
                      onClick={() => setActiveScene(scene.id as MockupScene)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{scene.label}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Preview Area */}
          <div className="flex-1 flex items-center justify-center p-8 bg-slate-950 overflow-auto">
            <motion.div
              key={activeScene}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {renderScene()}
            </motion.div>
          </div>

          {/* Footer Actions */}
          <div className="h-16 flex items-center justify-between px-4 border-t border-slate-700 bg-slate-900">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <RefreshCw className="w-4 h-4" />
              <span>المزامنة مفعلة</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info('مشاركة')}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                مشاركة
              </Button>
              <Button
                size="sm"
                onClick={() => onExport?.('png')}
                className="gap-2 bg-cyan-600 hover:bg-cyan-700"
              >
                <Download className="w-4 h-4" />
                تصدير
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UnifiedPreview;
