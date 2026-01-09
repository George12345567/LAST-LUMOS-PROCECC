// ============================================
// USE AUTO SAVE HOOK
// ============================================
// Automatic saving with debounce and conflict resolution

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { Project, LogoDesign, AppDesign } from '../types';
import { projectService } from '../services/projectService';
import { logoService } from '../services/logoService';
import { appDesignService } from '../services/appDesignService';

type SaveTarget = 'project' | 'logo' | 'app' | 'all';

interface AutoSaveState {
  isEnabled: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  pendingChanges: boolean;
  saveInterval: number; // in ms
  error: string | null;
}

interface UseAutoSaveProps {
  projectId: string;
  project?: Project | null;
  logoDesign?: LogoDesign | null;
  appDesign?: AppDesign | null;
  enabled?: boolean;
  interval?: number; // ms
  onSaveSuccess?: () => void;
  onSaveError?: (error: string) => void;
}

interface UseAutoSaveReturn {
  autoSaveState: AutoSaveState;
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  toggleAutoSave: () => void;
  setSaveInterval: (interval: number) => void;
  saveNow: (target?: SaveTarget) => Promise<void>;
  markAsChanged: () => void;
  saveVersion: (note?: string) => Promise<void>;
}

const DEFAULT_INTERVAL = 30000; // 30 seconds

export function useAutoSave({
  projectId,
  project,
  logoDesign,
  appDesign,
  enabled = true,
  interval = DEFAULT_INTERVAL,
  onSaveSuccess,
  onSaveError
}: UseAutoSaveProps): UseAutoSaveReturn {

  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    isEnabled: enabled,
    isSaving: false,
    lastSavedAt: null,
    pendingChanges: false,
    saveInterval: interval,
    error: null
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveDataRef = useRef<{
    project: string;
    logo: string;
    app: string;
  }>({
    project: '',
    logo: '',
    app: ''
  });

  // ============ CONTROLS ============
  const enableAutoSave = useCallback(() => {
    setAutoSaveState(prev => ({ ...prev, isEnabled: true }));
    toast.success('تم تفعيل الحفظ التلقائي');
  }, []);

  const disableAutoSave = useCallback(() => {
    setAutoSaveState(prev => ({ ...prev, isEnabled: false }));
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    toast.info('تم إيقاف الحفظ التلقائي');
  }, []);

  const toggleAutoSave = useCallback(() => {
    setAutoSaveState(prev => {
      const newEnabled = !prev.isEnabled;
      toast.info(newEnabled ? 'تم تفعيل الحفظ التلقائي' : 'تم إيقاف الحفظ التلقائي');
      return { ...prev, isEnabled: newEnabled };
    });
  }, []);

  const setSaveInterval = useCallback((newInterval: number) => {
    setAutoSaveState(prev => ({ ...prev, saveInterval: newInterval }));
  }, []);

  const markAsChanged = useCallback(() => {
    setAutoSaveState(prev => ({ ...prev, pendingChanges: true }));
  }, []);

  // ============ SAVE FUNCTIONS ============
  const saveProject = useCallback(async (): Promise<boolean> => {
    if (!project) return true;

    try {
      const result = await projectService.update(projectId, {
        name: project.name,
        status: project.status,
        metadata: project.metadata
      });
      return result.success;
    } catch (error) {
      console.error('Error saving project:', error);
      return false;
    }
  }, [project, projectId]);

  const saveLogo = useCallback(async (): Promise<boolean> => {
    if (!logoDesign) return true;

    try {
      const result = await logoService.updateConfig(projectId, logoDesign.config);
      return result.success;
    } catch (error) {
      console.error('Error saving logo:', error);
      return false;
    }
  }, [logoDesign, projectId]);

  const saveApp = useCallback(async (): Promise<boolean> => {
    if (!appDesign) return true;

    try {
      const result = await appDesignService.updateByProjectId(projectId, appDesign);
      return result.success;
    } catch (error) {
      console.error('Error saving app design:', error);
      return false;
    }
  }, [appDesign, projectId]);

  // ============ MAIN SAVE ============
  const saveNow = useCallback(async (target: SaveTarget = 'all') => {
    if (autoSaveState.isSaving) return;

    setAutoSaveState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      let success = true;

      switch (target) {
        case 'project':
          success = await saveProject();
          break;
        case 'logo':
          success = await saveLogo();
          break;
        case 'app':
          success = await saveApp();
          break;
        case 'all': {
          const results = await Promise.all([
            saveProject(),
            saveLogo(),
            saveApp()
          ]);
          success = results.every(r => r);
          break;
        }
      }

      if (success) {
        setAutoSaveState(prev => ({
          ...prev,
          isSaving: false,
          lastSavedAt: new Date(),
          pendingChanges: false
        }));
        
        // Update last saved data
        lastSaveDataRef.current = {
          project: JSON.stringify(project),
          logo: JSON.stringify(logoDesign),
          app: JSON.stringify(appDesign)
        };

        onSaveSuccess?.();
      } else {
        throw new Error('Save failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'فشل في الحفظ';
      setAutoSaveState(prev => ({
        ...prev,
        isSaving: false,
        error: errorMessage
      }));
      onSaveError?.(errorMessage);
      toast.error('فشل في الحفظ التلقائي');
    }
  }, [
    autoSaveState.isSaving,
    saveProject,
    saveLogo,
    saveApp,
    project,
    logoDesign,
    appDesign,
    onSaveSuccess,
    onSaveError
  ]);

  // ============ SAVE VERSION ============
  const saveVersion = useCallback(async (note?: string) => {
    try {
      const versionData = {
        project,
        logoDesign,
        appDesign
      };

      const result = await projectService.saveVersion(
        projectId,
        versionData,
        note || `Version at ${new Date().toLocaleString('ar-EG')}`
      );

      if (result.success) {
        toast.success('تم حفظ نسخة جديدة');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error saving version:', error);
      toast.error('فشل في حفظ النسخة');
    }
  }, [projectId, project, logoDesign, appDesign]);

  // ============ CHECK FOR CHANGES ============
  const hasChanges = useCallback((): boolean => {
    const currentProject = JSON.stringify(project);
    const currentLogo = JSON.stringify(logoDesign);
    const currentApp = JSON.stringify(appDesign);

    return (
      currentProject !== lastSaveDataRef.current.project ||
      currentLogo !== lastSaveDataRef.current.logo ||
      currentApp !== lastSaveDataRef.current.app
    );
  }, [project, logoDesign, appDesign]);

  // ============ AUTO SAVE EFFECT ============
  useEffect(() => {
    if (!autoSaveState.isEnabled) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new interval
    saveTimeoutRef.current = setInterval(() => {
      if (hasChanges()) {
        saveNow('all');
      }
    }, autoSaveState.saveInterval);

    return () => {
      if (saveTimeoutRef.current) {
        clearInterval(saveTimeoutRef.current);
      }
    };
  }, [autoSaveState.isEnabled, autoSaveState.saveInterval, hasChanges, saveNow]);

  // ============ BEFORE UNLOAD WARNING ============
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autoSaveState.pendingChanges || hasChanges()) {
        e.preventDefault();
        e.returnValue = 'لديك تغييرات غير محفوظة. هل أنت متأكد من المغادرة؟';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autoSaveState.pendingChanges, hasChanges]);

  return {
    autoSaveState,
    enableAutoSave,
    disableAutoSave,
    toggleAutoSave,
    setSaveInterval,
    saveNow,
    markAsChanged,
    saveVersion
  };
}

export default useAutoSave;
