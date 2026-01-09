// ============================================
// PROJECT SERVICE
// ============================================
// Service for managing projects in the database

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { toast } from 'sonner';
import type { 
  Project, 
  ProjectWithDetails, 
  ServiceResponse, 
  PaginatedResponse,
  ProjectVersion 
} from '../types';

// Default project values
const DEFAULT_PROJECT: Partial<Project> = {
  type: 'full',
  status: 'draft',
  is_public: false,
  views: 0,
  likes: 0,
  tags: [],
  metadata: {}
};

export const projectService = {
  // ============ CREATE ============
  async create(data: Partial<Project>): Promise<ServiceResponse<Project>> {
    try {
      const { data: user } = await supabaseAdmin.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'User not authenticated' };
      }

      const projectData = {
        ...DEFAULT_PROJECT,
        ...data,
        user_id: user.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_edited_at: new Date().toISOString()
      };

      const { data: project, error } = await supabaseAdmin
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) throw error;

      toast.success('تم إنشاء المشروع بنجاح');
      return { success: true, data: project };
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error('فشل في إنشاء المشروع');
      return { success: false, error: error.message };
    }
  },

  // ============ READ ============
  async getById(id: string): Promise<ServiceResponse<ProjectWithDetails>> {
    try {
      // Get project
      const { data: project, error: projectError } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;

      // Get logo
      const { data: logo } = await supabaseAdmin
        .from('logos')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Get app design
      const { data: appDesign } = await supabaseAdmin
        .from('app_designs')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Get counts
      const { count: versionCount } = await supabaseAdmin
        .from('project_versions')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', id);

      const { count: collaboratorCount } = await supabaseAdmin
        .from('project_collaborators')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', id);

      const { count: commentCount } = await supabaseAdmin
        .from('project_comments')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', id);

      const projectWithDetails: ProjectWithDetails = {
        ...project,
        logo: logo || undefined,
        app_design: appDesign || undefined,
        version_count: versionCount || 0,
        collaborator_count: collaboratorCount || 0,
        comment_count: commentCount || 0
      };

      return { success: true, data: projectWithDetails };
    } catch (error: any) {
      console.error('Error fetching project:', error);
      return { success: false, error: error.message };
    }
  },

  async getByUserId(
    userId: string, 
    page = 0, 
    pageSize = 20
  ): Promise<ServiceResponse<PaginatedResponse<Project>>> {
    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabaseAdmin
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('last_edited_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        success: true,
        data: {
          data: data || [],
          total: count || 0,
          page,
          pageSize,
          hasMore: (count || 0) > to + 1
        }
      };
    } catch (error: any) {
      console.error('Error fetching user projects:', error);
      return { success: false, error: error.message };
    }
  },

  async getByClientId(
    clientId: string, 
    page = 0, 
    pageSize = 20
  ): Promise<ServiceResponse<PaginatedResponse<Project>>> {
    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabaseAdmin
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('client_id', clientId)
        .order('last_edited_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        success: true,
        data: {
          data: data || [],
          total: count || 0,
          page,
          pageSize,
          hasMore: (count || 0) > to + 1
        }
      };
    } catch (error: any) {
      console.error('Error fetching client projects:', error);
      return { success: false, error: error.message };
    }
  },

  async getPublic(
    page = 0, 
    pageSize = 20, 
    filters?: { type?: string; industry?: string }
  ): Promise<ServiceResponse<PaginatedResponse<Project>>> {
    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabaseAdmin
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('is_public', true)
        .eq('status', 'completed');

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.industry) {
        query = query.eq('industry', filters.industry);
      }

      const { data, error, count } = await query
        .order('likes', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        success: true,
        data: {
          data: data || [],
          total: count || 0,
          page,
          pageSize,
          hasMore: (count || 0) > to + 1
        }
      };
    } catch (error: any) {
      console.error('Error fetching public projects:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ UPDATE ============
  async update(id: string, data: Partial<Project>): Promise<ServiceResponse<Project>> {
    try {
      const { data: project, error } = await supabaseAdmin
        .from('projects')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
          last_edited_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: project };
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error('فشل في تحديث المشروع');
      return { success: false, error: error.message };
    }
  },

  async updateStatus(id: string, status: Project['status']): Promise<ServiceResponse<Project>> {
    try {
      const updateData: Partial<Project> = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data: project, error } = await supabaseAdmin
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('تم تحديث حالة المشروع');
      return { success: true, data: project };
    } catch (error: any) {
      console.error('Error updating project status:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ DELETE ============
  async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabaseAdmin
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('تم حذف المشروع');
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error('فشل في حذف المشروع');
      return { success: false, error: error.message };
    }
  },

  // ============ VERSIONS ============
  async saveVersion(
    projectId: string, 
    snapshot: ProjectVersion['snapshot'],
    notes?: string
  ): Promise<ServiceResponse<ProjectVersion>> {
    try {
      // Get current version count
      const { count } = await supabaseAdmin
        .from('project_versions')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      const versionNumber = (count || 0) + 1;

      const { data: version, error } = await supabaseAdmin
        .from('project_versions')
        .insert({
          project_id: projectId,
          version_number: versionNumber,
          snapshot,
          notes,
          changes: {
            logo: !!snapshot.logo,
            app: !!snapshot.app,
            settings: !!snapshot.project
          },
          is_auto_save: !notes,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`تم حفظ الإصدار ${versionNumber}`);
      return { success: true, data: version };
    } catch (error: any) {
      console.error('Error saving version:', error);
      return { success: false, error: error.message };
    }
  },

  async getVersions(projectId: string): Promise<ServiceResponse<ProjectVersion[]>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('project_versions')
        .select('*')
        .eq('project_id', projectId)
        .order('version_number', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error fetching versions:', error);
      return { success: false, error: error.message };
    }
  },

  async loadVersion(projectId: string, versionNumber: number): Promise<ServiceResponse<ProjectVersion>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('project_versions')
        .select('*')
        .eq('project_id', projectId)
        .eq('version_number', versionNumber)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error loading version:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ ANALYTICS ============
  async incrementViews(id: string): Promise<void> {
    try {
      await supabaseAdmin.rpc('increment_project_views', { project_id: id });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  },

  async toggleLike(id: string): Promise<ServiceResponse<{ liked: boolean; likes: number }>> {
    try {
      // This would need a user_likes table for proper implementation
      // For now, just increment/decrement the likes count
      const { data: project } = await supabaseAdmin
        .from('projects')
        .select('likes')
        .eq('id', id)
        .single();

      const newLikes = (project?.likes || 0) + 1;

      await supabaseAdmin
        .from('projects')
        .update({ likes: newLikes })
        .eq('id', id);

      return { success: true, data: { liked: true, likes: newLikes } };
    } catch (error: any) {
      console.error('Error toggling like:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ SEARCH ============
  async search(
    query: string, 
    filters?: { type?: string; status?: string; industry?: string }
  ): Promise<ServiceResponse<Project[]>> {
    try {
      let dbQuery = supabaseAdmin
        .from('projects')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

      if (filters?.type) {
        dbQuery = dbQuery.eq('type', filters.type);
      }
      if (filters?.status) {
        dbQuery = dbQuery.eq('status', filters.status);
      }
      if (filters?.industry) {
        dbQuery = dbQuery.eq('industry', filters.industry);
      }

      const { data, error } = await dbQuery
        .order('last_edited_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error searching projects:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ DUPLICATE ============
  async duplicate(id: string, newName?: string): Promise<ServiceResponse<Project>> {
    try {
      // Get original project with details
      const { data: original } = await this.getById(id);
      if (!original) {
        return { success: false, error: 'Project not found' };
      }

      // Create new project
      const { data: newProject, error: projectError } = await supabaseAdmin
        .from('projects')
        .insert({
          ...original,
          id: undefined,
          name: newName || `${original.name} (نسخة)`,
          status: 'draft',
          is_public: false,
          views: 0,
          likes: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_edited_at: new Date().toISOString()
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Duplicate logo if exists
      if (original.logo) {
        await supabaseAdmin
          .from('logos')
          .insert({
            ...original.logo,
            id: undefined,
            project_id: newProject.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      // Duplicate app design if exists
      if (original.app_design) {
        await supabaseAdmin
          .from('app_designs')
          .insert({
            ...original.app_design,
            id: undefined,
            project_id: newProject.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      toast.success('تم نسخ المشروع بنجاح');
      return { success: true, data: newProject };
    } catch (error: any) {
      console.error('Error duplicating project:', error);
      toast.error('فشل في نسخ المشروع');
      return { success: false, error: error.message };
    }
  }
};

export default projectService;
