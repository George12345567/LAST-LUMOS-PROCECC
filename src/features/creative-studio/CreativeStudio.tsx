// ============================================
// CREATIVE STUDIO - MAIN CONTAINER
// ============================================
// Unified creative workspace combining Logo Studio & App Builder
// with seamless synchronization and smart features

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  Download,
  Settings,
  Layers,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Link2,
  Link2Off,
  Undo,
  Redo,
  History,
  FolderOpen,
  Plus,
  Home,
  Share2,
  HelpCircle,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Grid3X3,
  Zap,
  Folder
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Hooks
import { useProject, useStudioSync, useAutoSave } from './hooks';

// Tools
import LogoStudio from './tools/LogoStudioSimple';
import AppBuilder from './tools/AppBuilder';
import UnifiedPreview from './tools/UnifiedPreview';
import TemplatesLibrary from './templates/TemplatesLibrary';
import { AssetsManager } from './assets';

// Types
import type { ActiveTool, StudioState, LogoDesign, AppDesign, LogoConfig, AppTheme } from './types';

// ============================================
// COMPONENT INTERFACES
// ============================================

interface CreativeStudioProps {
  projectId?: string;
  clientId?: string;
  userId?: string;
  initialTool?: ActiveTool;
  onClose?: () => void;
  onSave?: () => void;
  embedded?: boolean;
}

// ============================================
// STUDIO HEADER COMPONENT
// ============================================

interface StudioHeaderProps {
  projectName: string;
  activeTool: ActiveTool;
  isPreviewOpen: boolean;
  isSyncing: boolean;
  isAutoSaveEnabled: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  syncEnabled: boolean;
  onToggleSync: () => void;
  onToggleAutoSave: () => void;
  onSaveNow: () => void;
  onSaveVersion: () => void;
  onTogglePreview: () => void;
  onExport: () => void;
  onSettings: () => void;
  onClose?: () => void;
}

const StudioHeader: React.FC<StudioHeaderProps> = ({
  projectName,
  activeTool,
  isPreviewOpen,
  isSyncing,
  isAutoSaveEnabled,
  isSaving,
  lastSavedAt,
  syncEnabled,
  onToggleSync,
  onToggleAutoSave,
  onSaveNow,
  onSaveVersion,
  onTogglePreview,
  onExport,
  onSettings,
  onClose
}) => {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <Home className="w-5 h-5" />
          </Button>
        )}
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm">{projectName || 'Creative Studio'}</h1>
            <p className="text-slate-400 text-xs">
              {activeTool === 'logo' ? 'Logo Studio' : 'App Builder'}
            </p>
          </div>
        </div>
      </div>

      {/* Center Section - Status */}
      <div className="flex items-center gap-4">
        {/* Sync Status */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSync}
                className={`gap-2 ${syncEnabled ? 'text-cyan-400' : 'text-slate-500'}`}
              >
                {syncEnabled ? <Link2 className="w-4 h-4" /> : <Link2Off className="w-4 h-4" />}
                <span className="text-xs">مزامنة</span>
                {isSyncing && (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{syncEnabled ? 'المزامنة مفعلة - اضغط للإيقاف' : 'المزامنة متوقفة - اضغط للتفعيل'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Auto Save Status */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-slate-400">
                <div className={`w-2 h-2 rounded-full ${
                  isSaving ? 'bg-yellow-500 animate-pulse' : 
                  isAutoSaveEnabled ? 'bg-green-500' : 'bg-slate-600'
                }`} />
                <span className="text-xs">
                  {isSaving ? 'جاري الحفظ...' : 
                   lastSavedAt ? `آخر حفظ: ${lastSavedAt.toLocaleTimeString('ar-EG')}` : 
                   'لم يتم الحفظ بعد'}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>الحفظ التلقائي {isAutoSaveEnabled ? 'مفعل' : 'متوقف'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePreview}
          className="text-slate-400 hover:text-white"
        >
          {isPreviewOpen ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onSaveVersion}
          className="text-slate-400 hover:text-white"
        >
          <History className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onSaveNow}
          className="text-slate-400 hover:text-white"
          disabled={isSaving}
        >
          <Save className="w-5 h-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700 gap-2"
            >
              <Download className="w-4 h-4" />
              تصدير
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => toast.info('تصدير PNG')}>
              تصدير كـ PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info('تصدير SVG')}>
              تصدير كـ SVG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info('تصدير PDF')}>
              تصدير كـ PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info('Brand Kit')}>
              <Palette className="w-4 h-4 mr-2" />
              Brand Kit كامل
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={onSettings}
          className="text-slate-400 hover:text-white"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};

// ============================================
// TOOL SWITCHER COMPONENT
// ============================================

interface ToolSwitcherProps {
  activeTool: ActiveTool;
  onSwitch: (tool: ActiveTool) => void;
  logoProgress?: number;
  appProgress?: number;
}

const ToolSwitcher: React.FC<ToolSwitcherProps> = ({
  activeTool,
  onSwitch,
  logoProgress = 0,
  appProgress = 0
}) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        className="flex items-center bg-slate-800/90 backdrop-blur-sm rounded-full p-1 border border-slate-700 shadow-xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <TooltipProvider>
          {/* Logo Tool */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSwitch('logo')}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  activeTool === 'logo'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span className="font-medium text-sm">Logo Studio</span>
                {logoProgress > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs bg-white/20">
                    {logoProgress}%
                  </Badge>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>أداة تصميم الشعار المتقدمة</p>
            </TooltipContent>
          </Tooltip>

          {/* Sync Indicator */}
          <div className="flex items-center px-2">
            <motion.div
              animate={{ rotate: activeTool === 'logo' ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <Zap className="w-4 h-4 text-cyan-400" />
            </motion.div>
          </div>

          {/* App Tool */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSwitch('app')}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  activeTool === 'app'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="font-medium text-sm">App Builder</span>
                {appProgress > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs bg-white/20">
                    {appProgress}%
                  </Badge>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>أداة بناء التطبيقات المتقدمة</p>
            </TooltipContent>
          </Tooltip>

          {/* Assets Tool */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onSwitch('assets')}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  activeTool === 'assets'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Folder className="w-4 h-4" />
                <span className="font-medium text-sm">Assets</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>إدارة الملفات والصور</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    </div>
  );
};

// ============================================
// SIDEBAR COMPONENT
// ============================================

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTool: ActiveTool;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, activeTool }) => {
  const logoTools = [
    { id: 'text', icon: 'T', label: 'النص' },
    { id: 'icon', icon: '★', label: 'الأيقونة' },
    { id: 'colors', icon: '🎨', label: 'الألوان' },
    { id: 'effects', icon: '✨', label: 'التأثيرات' },
    { id: 'templates', icon: '📐', label: 'القوالب' },
    { id: 'ai', icon: '🤖', label: 'AI' }
  ];

  const appTools = [
    { id: 'theme', icon: '🎨', label: 'الثيم' },
    { id: 'menu', icon: '📋', label: 'القائمة' },
    { id: 'pages', icon: '📄', label: 'الصفحات' },
    { id: 'features', icon: '⚙️', label: 'الميزات' },
    { id: 'nav', icon: '🧭', label: 'التنقل' },
    { id: 'templates', icon: '📐', label: 'القوالب' }
  ];

  const tools = activeTool === 'logo' ? logoTools : appTools;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 64 : 0 }}
      className="bg-slate-900 border-l border-slate-700 overflow-hidden"
    >
      <div className="flex flex-col h-full py-4">
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="mx-auto mb-4 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Tools */}
        <div className="flex-1 flex flex-col gap-2 px-2">
          {tools.map((tool) => (
            <TooltipProvider key={tool.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-lg">
                    {tool.icon}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </motion.aside>
  );
};

// ============================================
// PLACEHOLDER COMPONENTS (To be replaced)
// ============================================

const LogoStudioPlaceholder: React.FC<{
  logoDesign: LogoDesign | null;
  onUpdate: (updates: Partial<LogoDesign>) => void;
}> = ({ logoDesign }) => (
  <div className="flex-1 flex items-center justify-center bg-slate-950">
    <div className="text-center">
      <Palette className="w-24 h-24 text-purple-500/50 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Logo Studio</h2>
      <p className="text-slate-400">سيتم تحميل أداة تصميم الشعار المتقدمة هنا</p>
      {logoDesign && (
        <p className="text-cyan-400 mt-4">Project ID: {logoDesign.project_id}</p>
      )}
    </div>
  </div>
);

const AppBuilderPlaceholder: React.FC<{
  appDesign: AppDesign | null;
  onUpdate: (updates: Partial<AppDesign>) => void;
}> = ({ appDesign }) => (
  <div className="flex-1 flex items-center justify-center bg-slate-950">
    <div className="text-center">
      <Smartphone className="w-24 h-24 text-cyan-500/50 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">App Builder</h2>
      <p className="text-slate-400">سيتم تحميل أداة بناء التطبيقات المتقدمة هنا</p>
      {appDesign && (
        <p className="text-cyan-400 mt-4">Business: {appDesign.business_name}</p>
      )}
    </div>
  </div>
);

const UnifiedPreviewPlaceholder: React.FC<{
  logoDesign: LogoDesign | null;
  appDesign: AppDesign | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed inset-y-0 right-0 w-[400px] bg-slate-900 border-l border-slate-700 z-40 shadow-2xl"
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-700">
          <h3 className="text-white font-semibold">معاينة موحدة</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-slate-400">
            <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>معاينة الشعار والتطبيق معاً</p>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ============================================
// MAIN CREATIVE STUDIO COMPONENT
// ============================================

const CreativeStudio: React.FC<CreativeStudioProps> = ({
  projectId,
  clientId,
  userId,
  initialTool = 'logo',
  onClose,
  onSave,
  embedded = false
}) => {
  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Project Hook
  const {
    state,
    project,
    logoDesign,
    appDesign,
    isLoading,
    error,
    updateLogo,
    updateApp,
    setActiveTool,
    togglePreview
  } = useProject({
    projectId,
    clientId,
    userId,
    initialTool
  });

  // Sync Hook
  const {
    syncState,
    toggleSync,
    syncLogoToApp,
    generateBrandKit
  } = useStudioSync({
    projectId: state.currentProjectId || '',
    logoDesign,
    appDesign,
    onLogoUpdate: (logo) => updateLogo(logo),
    onAppUpdate: (app) => updateApp(app)
  });

  // Auto Save Hook
  const {
    autoSaveState,
    toggleAutoSave,
    saveNow,
    saveVersion
  } = useAutoSave({
    projectId: state.currentProjectId || '',
    project,
    logoDesign,
    appDesign,
    onSaveSuccess: () => {
      onSave?.();
    }
  });

  // Handlers
  const handleExport = useCallback(() => {
    toast.info('جاري التصدير...');
  }, []);

  const handleSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const handleSaveVersion = useCallback(() => {
    saveVersion('حفظ يدوي');
  }, [saveVersion]);

  // Loading State
  if (isLoading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-white">جاري تحميل المشروع...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">حدث خطأ</h2>
          <p className="text-slate-400">{error}</p>
          <Button onClick={onClose} className="mt-4">
            العودة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen bg-slate-950 flex flex-col ${embedded ? '' : 'fixed inset-0 z-50'}`}>
      {/* Header */}
      <StudioHeader
        projectName={project?.name || 'مشروع جديد'}
        activeTool={state.activeTool}
        isPreviewOpen={state.isPreviewOpen}
        isSyncing={syncState.isSyncing}
        isAutoSaveEnabled={autoSaveState.isEnabled}
        isSaving={autoSaveState.isSaving}
        lastSavedAt={autoSaveState.lastSavedAt}
        syncEnabled={syncState.isEnabled}
        onToggleSync={toggleSync}
        onToggleAutoSave={toggleAutoSave}
        onSaveNow={() => saveNow('all')}
        onSaveVersion={handleSaveVersion}
        onTogglePreview={togglePreview}
        onExport={handleExport}
        onSettings={handleSettings}
        onClose={onClose}
      />

      {/* Tool Switcher */}
      <ToolSwitcher
        activeTool={state.activeTool}
        onSwitch={setActiveTool}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Workspace - Full Tools */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {state.activeTool === 'logo' ? (
              <motion.div
                key="logo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute inset-0"
              >
                <LogoStudio
                  logoDesign={logoDesign}
                  onUpdate={updateLogo}
                  onSave={() => saveNow('logo')}
                  syncEnabled={syncState.isEnabled}
                  onSyncColors={(colors) => {
                    // Colors will be synced via the useStudioSync hook
                    syncLogoToApp();
                  }}
                />
              </motion.div>
            ) : state.activeTool === 'app' ? (
              <motion.div
                key="app"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0"
              >
                <AppBuilder
                  appDesign={appDesign}
                  onUpdate={updateApp}
                  onSave={() => saveNow('app')}
                  syncedColors={logoDesign?.config ? [
                    logoDesign.config.textColorStart || '#ffffff',
                    logoDesign.config.iconColorStart || '#00bcd4'
                  ] : undefined}
                  syncedFont={logoDesign?.config?.fontFamily}
                  logoUrl={logoDesign?.mockups?.card}
                />
              </motion.div>
            ) : (
              <motion.div
                key="assets"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-white"
              >
                <AssetsManager
                  projectId={projectId}
                  clientId={clientId}
                  mode="full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Unified Preview */}
        <UnifiedPreview
          logoDesign={logoDesign}
          appDesign={appDesign}
          isOpen={state.isPreviewOpen}
          onClose={togglePreview}
        />
      </div>

      {/* Status Bar */}
      <footer className="h-8 bg-slate-900 border-t border-slate-700 flex items-center justify-between px-4 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>Creative Studio v2.0</span>
          <span>•</span>
          <span>{state.activeTool === 'logo' ? 'Logo Studio' : state.activeTool === 'app' ? 'App Builder' : 'Assets Manager'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>المزامنة: {syncState.isEnabled ? 'مفعلة' : 'متوقفة'}</span>
          <span>•</span>
          <span>الحفظ التلقائي: {autoSaveState.isEnabled ? 'مفعل' : 'متوقف'}</span>
        </div>
      </footer>
    </div>
  );
};

export default CreativeStudio;
