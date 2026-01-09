// ============================================
// USE STUDIO SYNC HOOK
// ============================================
// Synchronizes Logo Studio and App Builder
// - Colors sync
// - Font sync  
// - Logo in App sync
// - Brand consistency

import { useState, useCallback, useEffect, useRef } from 'react';
import type { LogoDesign, AppDesign, LogoConfig, AppTheme, BrandKit } from '../types';
import { logoService } from '../services/logoService';
import { appDesignService } from '../services/appDesignService';
import { toast } from 'sonner';

interface SyncState {
  isEnabled: boolean;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  syncMode: 'auto' | 'manual';
  syncDirection: 'logo-to-app' | 'app-to-logo' | 'bidirectional';
}

interface UseStudioSyncProps {
  projectId: string;
  logoDesign?: LogoDesign | null;
  appDesign?: AppDesign | null;
  onLogoUpdate?: (logo: LogoDesign) => void;
  onAppUpdate?: (app: AppDesign) => void;
}

interface UseStudioSyncReturn {
  syncState: SyncState;
  enableSync: () => void;
  disableSync: () => void;
  toggleSync: () => void;
  setSyncMode: (mode: 'auto' | 'manual') => void;
  setSyncDirection: (direction: 'logo-to-app' | 'app-to-logo' | 'bidirectional') => void;
  syncLogoToApp: () => Promise<void>;
  syncAppToLogo: () => Promise<void>;
  syncBidirectional: () => Promise<void>;
  extractColorsFromLogo: () => string[];
  applyLogoToApp: (logoConfig: LogoConfig, appTheme: AppTheme) => AppTheme;
  generateBrandKit: () => Promise<BrandKit | null>;
}

export function useStudioSync({
  projectId,
  logoDesign,
  appDesign,
  onLogoUpdate,
  onAppUpdate
}: UseStudioSyncProps): UseStudioSyncReturn {
  
  const [syncState, setSyncState] = useState<SyncState>({
    isEnabled: true,
    isSyncing: false,
    lastSyncAt: null,
    syncMode: 'auto',
    syncDirection: 'logo-to-app'
  });

  const prevLogoRef = useRef<LogoConfig | null>(null);
  const prevAppThemeRef = useRef<AppTheme | null>(null);

  // ============ SYNC CONTROLS ============
  const enableSync = useCallback(() => {
    setSyncState(prev => ({ ...prev, isEnabled: true }));
    toast.success('تم تفعيل المزامنة');
  }, []);

  const disableSync = useCallback(() => {
    setSyncState(prev => ({ ...prev, isEnabled: false }));
    toast.info('تم إيقاف المزامنة');
  }, []);

  const toggleSync = useCallback(() => {
    setSyncState(prev => {
      const newEnabled = !prev.isEnabled;
      toast.info(newEnabled ? 'تم تفعيل المزامنة' : 'تم إيقاف المزامنة');
      return { ...prev, isEnabled: newEnabled };
    });
  }, []);

  const setSyncMode = useCallback((mode: 'auto' | 'manual') => {
    setSyncState(prev => ({ ...prev, syncMode: mode }));
  }, []);

  const setSyncDirection = useCallback((direction: 'logo-to-app' | 'app-to-logo' | 'bidirectional') => {
    setSyncState(prev => ({ ...prev, syncDirection: direction }));
  }, []);

  // ============ COLOR EXTRACTION ============
  const extractColorsFromLogo = useCallback((): string[] => {
    if (!logoDesign?.config) return [];

    const colors: string[] = [];
    
    // Text colors
    if (logoDesign.config.textColorStart) {
      colors.push(logoDesign.config.textColorStart);
    }
    if (logoDesign.config.textGradient && logoDesign.config.textColorEnd) {
      colors.push(logoDesign.config.textColorEnd);
    }
    
    // Background color (if not transparent)
    if (logoDesign.config.bgType !== 'transparent' && logoDesign.config.bgColorStart) {
      colors.push(logoDesign.config.bgColorStart);
      if (logoDesign.config.bgType === 'gradient' && logoDesign.config.bgColorEnd) {
        colors.push(logoDesign.config.bgColorEnd);
      }
    }
    
    // Icon colors
    if (logoDesign.config.iconColorStart) {
      colors.push(logoDesign.config.iconColorStart);
    }
    if (logoDesign.config.iconGradient && logoDesign.config.iconColorEnd) {
      colors.push(logoDesign.config.iconColorEnd);
    }

    // Remove duplicates
    return [...new Set(colors)];
  }, [logoDesign]);

  // ============ APPLY LOGO TO APP ============
  const applyLogoToApp = useCallback((logoConfig: LogoConfig, appTheme: AppTheme): AppTheme => {
    const logoColors: string[] = [];
    
    if (logoConfig.textColorStart) logoColors.push(logoConfig.textColorStart);
    if (logoConfig.iconColorStart) logoColors.push(logoConfig.iconColorStart);
    if (logoConfig.textGradient && logoConfig.textColorEnd) {
      logoColors.push(logoConfig.textColorEnd);
    }
    if (logoConfig.iconGradient && logoConfig.iconColorEnd) {
      logoColors.push(logoConfig.iconColorEnd);
    }

    if (logoColors.length === 0) return appTheme;

    return {
      ...appTheme,
      colors: {
        ...appTheme.colors,
        primary: logoColors[0] || appTheme.colors.primary,
        accent: logoColors[1] || logoColors[0] || appTheme.colors.accent
      },
      typography: {
        ...appTheme.typography,
        fontFamily: logoConfig.fontFamily || appTheme.typography.fontFamily
      }
    };
  }, []);

  // ============ SYNC LOGO TO APP ============
  const syncLogoToApp = useCallback(async () => {
    if (!syncState.isEnabled || !logoDesign || !appDesign) return;

    setSyncState(prev => ({ ...prev, isSyncing: true }));

    try {
      const logoColors = extractColorsFromLogo();
      const updatedTheme = applyLogoToApp(logoDesign.config, appDesign.theme);

      const result = await appDesignService.updateTheme(projectId, updatedTheme);
      
      if (result.success && result.data) {
        onAppUpdate?.(result.data);
        setSyncState(prev => ({ 
          ...prev, 
          lastSyncAt: new Date(),
          isSyncing: false 
        }));
        toast.success('تم مزامنة الشعار مع التطبيق');
      }
    } catch (error) {
      console.error('Error syncing logo to app:', error);
      toast.error('فشل في مزامنة الشعار');
    } finally {
      setSyncState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [
    syncState.isEnabled, 
    logoDesign, 
    appDesign, 
    projectId, 
    extractColorsFromLogo, 
    applyLogoToApp, 
    onAppUpdate
  ]);

  // ============ SYNC APP TO LOGO ============
  const syncAppToLogo = useCallback(async () => {
    if (!syncState.isEnabled || !logoDesign || !appDesign) return;

    setSyncState(prev => ({ ...prev, isSyncing: true }));

    try {
      const updatedConfig: Partial<LogoConfig> = {
        textColorStart: appDesign.theme.colors.primary,
        iconColorStart: appDesign.theme.colors.accent,
        fontFamily: appDesign.theme.typography.fontFamily
      };

      const result = await logoService.updateConfig(projectId, updatedConfig);
      
      if (result.success && result.data) {
        onLogoUpdate?.(result.data);
        setSyncState(prev => ({ 
          ...prev, 
          lastSyncAt: new Date(),
          isSyncing: false 
        }));
        toast.success('تم مزامنة التطبيق مع الشعار');
      }
    } catch (error) {
      console.error('Error syncing app to logo:', error);
      toast.error('فشل في مزامنة التطبيق');
    } finally {
      setSyncState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [syncState.isEnabled, logoDesign, appDesign, projectId, onLogoUpdate]);

  // ============ BIDIRECTIONAL SYNC ============
  const syncBidirectional = useCallback(async () => {
    if (!syncState.isEnabled) return;
    
    // Default: logo is the source of truth for branding
    await syncLogoToApp();
  }, [syncState.isEnabled, syncLogoToApp]);

  // ============ GENERATE BRAND KIT ============
  const generateBrandKit = useCallback(async (): Promise<BrandKit | null> => {
    if (!logoDesign || !appDesign) return null;

    const logoColors = extractColorsFromLogo();
    
    // Collect all colors
    const allColors = [
      logoColors[0] || appDesign.theme.colors.primary,
      logoColors[1] || appDesign.theme.colors.accent,
      logoColors[2] || appDesign.theme.colors.accent,
      appDesign.theme.colors.background,
      appDesign.theme.colors.text
    ];

    // Collect all fonts
    const allFonts = [
      logoDesign.config.fontFamily || appDesign.theme.typography.fontFamily,
      'Cairo',
      'Tajawal'
    ];
    
    const brandKit: BrandKit = {
      colors: allColors,
      fonts: allFonts,
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32
      },
      usage_guidelines: `
        # Brand Guidelines
        
        ## Colors
        Primary: ${allColors[0]}
        Secondary: ${allColors[1]}
        Accent: ${allColors[2]}
        
        ## Fonts
        Primary: ${allFonts[0]}
        Secondary: ${allFonts[1]}
        
        ## Usage
        Use primary color for main CTAs and branding.
        Use secondary for supporting elements.
      `.trim()
    };

    try {
      const result = await logoService.updateBrandKit(projectId, brandKit);
      if (result.success) {
        toast.success('تم إنشاء Brand Kit');
        return brandKit;
      }
    } catch (error) {
      console.error('Error generating brand kit:', error);
      toast.error('فشل في إنشاء Brand Kit');
    }

    return brandKit;
  }, [logoDesign, appDesign, projectId, extractColorsFromLogo]);

  // ============ AUTO SYNC EFFECT ============
  useEffect(() => {
    if (!syncState.isEnabled || syncState.syncMode !== 'auto') return;
    if (!logoDesign?.config) return;

    // Check if logo config changed
    const currentConfig = JSON.stringify(logoDesign.config);
    const prevConfig = JSON.stringify(prevLogoRef.current);

    if (currentConfig !== prevConfig && prevLogoRef.current !== null) {
      // Logo changed, sync to app
      if (syncState.syncDirection === 'logo-to-app' || syncState.syncDirection === 'bidirectional') {
        syncLogoToApp();
      }
    }

    prevLogoRef.current = logoDesign.config;
  }, [logoDesign?.config, syncState.isEnabled, syncState.syncMode, syncState.syncDirection, syncLogoToApp]);

  useEffect(() => {
    if (!syncState.isEnabled || syncState.syncMode !== 'auto') return;
    if (!appDesign?.theme) return;

    // Check if app theme changed
    const currentTheme = JSON.stringify(appDesign.theme);
    const prevTheme = JSON.stringify(prevAppThemeRef.current);

    if (currentTheme !== prevTheme && prevAppThemeRef.current !== null) {
      // App theme changed, sync to logo
      if (syncState.syncDirection === 'app-to-logo' || syncState.syncDirection === 'bidirectional') {
        syncAppToLogo();
      }
    }

    prevAppThemeRef.current = appDesign.theme;
  }, [appDesign?.theme, syncState.isEnabled, syncState.syncMode, syncState.syncDirection, syncAppToLogo]);

  return {
    syncState,
    enableSync,
    disableSync,
    toggleSync,
    setSyncMode,
    setSyncDirection,
    syncLogoToApp,
    syncAppToLogo,
    syncBidirectional,
    extractColorsFromLogo,
    applyLogoToApp,
    generateBrandKit
  };
}

export default useStudioSync;
