// ============================================
// USE PROJECT HOOK
// ============================================
// Main hook for managing project state in Creative Studio

import { useState, useCallback, useEffect } from 'react';
import type { Project, LogoDesign, AppDesign, StudioState, ActiveTool } from '../types';
import { projectService } from '../services/projectService';
import { logoService } from '../services/logoService';
import { appDesignService } from '../services/appDesignService';
import { toast } from 'sonner';

interface UseProjectProps {
  projectId?: string;
  clientId?: string;
  userId?: string;
  initialTool?: ActiveTool;
}

interface UseProjectReturn {
  // State
  state: StudioState;
  project: Project | null;
  logoDesign: LogoDesign | null;
  appDesign: AppDesign | null;
  isLoading: boolean;
  error: string | null;

  // Project Actions
  createProject: (name: string, serviceType: string, businessName: string) => Promise<string | null>;
  loadProject: (id: string) => Promise<void>;
  updateProject: (updates: Partial<Project>) => Promise<void>;
  deleteProject: () => Promise<void>;
  duplicateProject: () => Promise<string | null>;

  // Logo Actions
  updateLogo: (updates: Partial<LogoDesign>) => void;
  saveLogo: () => Promise<void>;

  // App Actions
  updateApp: (updates: Partial<AppDesign>) => void;
  saveApp: () => Promise<void>;

  // Tool Navigation
  setActiveTool: (tool: ActiveTool) => void;
  togglePreview: () => void;

  // Refresh
  refresh: () => Promise<void>;
}

export function useProject({
  projectId: initialProjectId,
  clientId,
  userId,
  initialTool = 'logo'
}: UseProjectProps = {}): UseProjectReturn {

  const [state, setState] = useState<StudioState>({
    activeTab: initialTool,
    activeTool: initialTool,
    currentProjectId: initialProjectId || null,
    isPreviewOpen: false,
    project: null,
    logo: null,
    appDesign: null,
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    isLoading: false,
    error: null
  });

  const [project, setProject] = useState<Project | null>(null);
  const [logoDesign, setLogoDesign] = useState<LogoDesign | null>(null);
  const [appDesign, setAppDesign] = useState<AppDesign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============ CREATE PROJECT ============
  const createProject = useCallback(async (
    name: string,
    serviceType: string,
    businessName: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await projectService.create({
        name,
        client_id: clientId,
        user_id: userId,
        type: 'full',
        industry: serviceType,
        description: businessName
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create project');
      }

      const newProject = result.data;

      // Create logo design with business name as text
      await logoService.create(newProject.id, { text: businessName });

      // Create app design
      await appDesignService.create(newProject.id, businessName, serviceType);

      // Load the new project
      await loadProject(newProject.id);

      toast.success('تم إنشاء المشروع بنجاح');
      return newProject.id;

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل في إنشاء المشروع';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, userId]);

  // ============ LOAD PROJECT ============
  const loadProject = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Load project
      const projectResult = await projectService.getById(id);
      if (!projectResult.success || !projectResult.data) {
        throw new Error('Project not found');
      }

      setProject(projectResult.data);
      setState(prev => ({ ...prev, currentProjectId: id }));

      // Load logo design
      const logoResult = await logoService.getByProjectId(id);
      if (logoResult.success && logoResult.data) {
        setLogoDesign(logoResult.data);
      }

      // Load app design
      const appResult = await appDesignService.getByProjectId(id);
      if (appResult.success && appResult.data) {
        setAppDesign(appResult.data);
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل في تحميل المشروع';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============ UPDATE PROJECT ============
  const updateProject = useCallback(async (updates: Partial<Project>) => {
    if (!project) return;

    try {
      const result = await projectService.update(project.id, updates);
      if (result.success && result.data) {
        setProject(result.data);
      }
    } catch (err: unknown) {
      console.error('Error updating project:', err);
    }
  }, [project]);

  // ============ DELETE PROJECT ============
  const deleteProject = useCallback(async () => {
    if (!project) return;

    try {
      const result = await projectService.delete(project.id);
      if (result.success) {
        setProject(null);
        setLogoDesign(null);
        setAppDesign(null);
        setState(prev => ({ ...prev, currentProjectId: null }));
        toast.success('تم حذف المشروع');
      }
    } catch (err: unknown) {
      toast.error('فشل في حذف المشروع');
    }
  }, [project]);

  // ============ DUPLICATE PROJECT ============
  const duplicateProject = useCallback(async (): Promise<string | null> => {
    if (!project) return null;

    try {
      const result = await projectService.duplicate(project.id);
      if (result.success && result.data) {
        toast.success('تم نسخ المشروع');
        return result.data.id;
      }
      return null;
    } catch (err: unknown) {
      toast.error('فشل في نسخ المشروع');
      return null;
    }
  }, [project]);

  // ============ LOGO ACTIONS ============
  const updateLogo = useCallback((updates: Partial<LogoDesign>) => {
    setLogoDesign(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const saveLogo = useCallback(async () => {
    if (!logoDesign || !state.currentProjectId) return;

    try {
      await logoService.updateConfig(state.currentProjectId, logoDesign.config);
    } catch (err: unknown) {
      console.error('Error saving logo:', err);
    }
  }, [logoDesign, state.currentProjectId]);

  // ============ APP ACTIONS ============
  const updateApp = useCallback((updates: Partial<AppDesign>) => {
    setAppDesign(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const saveApp = useCallback(async () => {
    if (!appDesign || !state.currentProjectId) return;

    try {
      await appDesignService.updateByProjectId(state.currentProjectId, appDesign);
    } catch (err: unknown) {
      console.error('Error saving app:', err);
    }
  }, [appDesign, state.currentProjectId]);

  // ============ NAVIGATION ============
  const setActiveTool = useCallback((tool: ActiveTool) => {
    setState(prev => ({ ...prev, activeTool: tool }));
  }, []);

  const togglePreview = useCallback(() => {
    setState(prev => ({ ...prev, isPreviewOpen: !prev.isPreviewOpen }));
  }, []);

  // ============ REFRESH ============
  const refresh = useCallback(async () => {
    if (state.currentProjectId) {
      await loadProject(state.currentProjectId);
    }
  }, [state.currentProjectId, loadProject]);

  // ============ INITIAL LOAD ============
  useEffect(() => {
    if (initialProjectId) {
      loadProject(initialProjectId);
    }
  }, [initialProjectId, loadProject]);

  return {
    state,
    project,
    logoDesign,
    appDesign,
    isLoading,
    error,
    createProject,
    loadProject,
    updateProject,
    deleteProject,
    duplicateProject,
    updateLogo,
    saveLogo,
    updateApp,
    saveApp,
    setActiveTool,
    togglePreview,
    refresh
  };
}

export default useProject;
