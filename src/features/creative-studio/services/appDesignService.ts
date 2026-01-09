// ============================================
// APP DESIGN SERVICE
// ============================================
// Service for managing app designs in the database

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { toast } from 'sonner';
import type { 
  AppDesign, 
  AppTheme, 
  AppPage,
  MenuItem,
  AppSettings,
  AppFeatures,
  AppNavigation,
  AppSEO,
  ServiceResponse 
} from '../types';

// Default theme
export const DEFAULT_THEME: AppTheme = {
  id: 'default',
  name: 'Default',
  colors: {
    primary: '#00bcd4',
    accent: '#00acc1',
    background: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b'
  },
  typography: {
    fontFamily: 'Poppins',
    fontSize: 1,
    fontWeight: 400
  },
  spacing: {
    padding: 16,
    margin: 8,
    borderRadius: 12
  }
};

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  language: 'ar',
  rtl: true,
  darkMode: false,
  showRatings: true,
  showSearch: true,
  enableAnimations: true,
  animationSpeed: 'normal'
};

// Default features
export const DEFAULT_FEATURES: AppFeatures = {
  cart: true,
  favorites: true,
  reviews: true,
  notifications: true,
  search: true,
  filters: true,
  socialShare: true,
  chat: false,
  booking: false,
  payment: false
};

// Default navigation
export const DEFAULT_NAVIGATION: AppNavigation = {
  type: 'bottom',
  items: [
    { id: 'home', label: 'الرئيسية', icon: 'Home' },
    { id: 'menu', label: 'القائمة', icon: 'ShoppingCart' },
    { id: 'favorites', label: 'المفضلة', icon: 'Heart' },
    { id: 'profile', label: 'حسابي', icon: 'User' }
  ]
};

// Default pages
export const DEFAULT_PAGES: AppPage[] = [
  {
    id: 'home',
    name: 'الرئيسية',
    type: 'landing',
    content: {},
    order: 0
  },
  {
    id: 'menu',
    name: 'القائمة',
    type: 'menu',
    content: {},
    order: 1
  },
  {
    id: 'cart',
    name: 'السلة',
    type: 'cart',
    content: {},
    order: 2
  },
  {
    id: 'profile',
    name: 'الملف الشخصي',
    type: 'profile',
    content: {},
    order: 3
  }
];

export const appDesignService = {
  // ============ CREATE ============
  async create(
    projectId: string, 
    businessName: string, 
    serviceType: string,
    config?: Partial<AppDesign>
  ): Promise<ServiceResponse<AppDesign>> {
    try {
      const appData = {
        project_id: projectId,
        business_name: businessName,
        service_type: serviceType,
        pages: config?.pages || DEFAULT_PAGES,
        theme: config?.theme || DEFAULT_THEME,
        items: config?.items || [],
        settings: config?.settings || DEFAULT_SETTINGS,
        features: config?.features || DEFAULT_FEATURES,
        navigation: config?.navigation || DEFAULT_NAVIGATION,
        seo: config?.seo || { title: businessName, description: '', keywords: [] },
        exports: {},
        is_final: false,
        version_number: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseAdmin
        .from('app_designs')
        .insert(appData)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating app design:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ READ ============
  async getByProjectId(projectId: string): Promise<ServiceResponse<AppDesign>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('app_designs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return { success: true, data: data || undefined };
    } catch (error: any) {
      console.error('Error fetching app design:', error);
      return { success: false, error: error.message };
    }
  },

  async getById(id: string): Promise<ServiceResponse<AppDesign>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('app_designs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching app design:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ UPDATE ============
  async update(id: string, data: Partial<AppDesign>): Promise<ServiceResponse<AppDesign>> {
    try {
      const { data: appDesign, error } = await supabaseAdmin
        .from('app_designs')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: appDesign };
    } catch (error: any) {
      console.error('Error updating app design:', error);
      return { success: false, error: error.message };
    }
  },

  async updateByProjectId(projectId: string, data: Partial<AppDesign>): Promise<ServiceResponse<AppDesign>> {
    try {
      const { data: current } = await this.getByProjectId(projectId);
      
      if (!current) {
        // Create new if doesn't exist
        return this.create(
          projectId, 
          data.business_name || 'My App', 
          data.service_type || 'restaurant',
          data
        );
      }

      const { data: appDesign, error } = await supabaseAdmin
        .from('app_designs')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: appDesign };
    } catch (error: any) {
      console.error('Error updating app design:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ THEME ============
  async updateTheme(projectId: string, theme: Partial<AppTheme>): Promise<ServiceResponse<AppDesign>> {
    try {
      const { data: current } = await this.getByProjectId(projectId);
      
      if (!current) {
        return { success: false, error: 'App design not found' };
      }

      const newTheme = { ...current.theme, ...theme };

      const { data, error } = await supabaseAdmin
        .from('app_designs')
        .update({
          theme: newTheme,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating theme:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ ITEMS ============
  async updateItems(projectId: string, items: MenuItem[]): Promise<ServiceResponse<AppDesign>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('app_designs')
        .update({
          items,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating items:', error);
      return { success: false, error: error.message };
    }
  },

  async addItem(projectId: string, item: MenuItem): Promise<ServiceResponse<AppDesign>> {
    try {
      const { data: current } = await this.getByProjectId(projectId);
      
      if (!current) {
        return { success: false, error: 'App design not found' };
      }

      const newItems = [...current.items, item];

      return this.updateItems(projectId, newItems);
    } catch (error: any) {
      console.error('Error adding item:', error);
      return { success: false, error: error.message };
    }
  },

  async removeItem(projectId: string, itemId: number): Promise<ServiceResponse<AppDesign>> {
    try {
      const { data: current } = await this.getByProjectId(projectId);
      
      if (!current) {
        return { success: false, error: 'App design not found' };
      }

      const newItems = current.items.filter(item => item.id !== itemId);

      return this.updateItems(projectId, newItems);
    } catch (error: any) {
      console.error('Error removing item:', error);
      return { success: false, error: error.message };
    }
  },

  async updateItem(projectId: string, itemId: number, updates: Partial<MenuItem>): Promise<ServiceResponse<AppDesign>> {
    try {
      const { data: current } = await this.getByProjectId(projectId);
      
      if (!current) {
        return { success: false, error: 'App design not found' };
      }

      const newItems = current.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      );

      return this.updateItems(projectId, newItems);
    } catch (error: any) {
      console.error('Error updating item:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ PAGES ============
  async updatePages(projectId: string, pages: AppPage[]): Promise<ServiceResponse<AppDesign>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('app_designs')
        .update({
          pages,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating pages:', error);
      return { success: false, error: error.message };
    }
  },

  async addPage(projectId: string, page: AppPage): Promise<ServiceResponse<AppDesign>> {
    try {
      const { data: current } = await this.getByProjectId(projectId);
      
      if (!current) {
        return { success: false, error: 'App design not found' };
      }

      const newPages = [...current.pages, { ...page, order: current.pages.length }];

      return this.updatePages(projectId, newPages);
    } catch (error: any) {
      console.error('Error adding page:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ SETTINGS ============
  async updateSettings(projectId: string, settings: Partial<AppSettings>): Promise<ServiceResponse<AppDesign>> {
    try {
      const { data: current } = await this.getByProjectId(projectId);
      
      if (!current) {
        return { success: false, error: 'App design not found' };
      }

      const newSettings = { ...current.settings, ...settings };

      const { data, error } = await supabaseAdmin
        .from('app_designs')
        .update({
          settings: newSettings,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating settings:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ FEATURES ============
  async updateFeatures(projectId: string, features: Partial<AppFeatures>): Promise<ServiceResponse<AppDesign>> {
    try {
      const { data: current } = await this.getByProjectId(projectId);
      
      if (!current) {
        return { success: false, error: 'App design not found' };
      }

      const newFeatures = { ...current.features, ...features };

      const { data, error } = await supabaseAdmin
        .from('app_designs')
        .update({
          features: newFeatures,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating features:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ NAVIGATION ============
  async updateNavigation(projectId: string, navigation: Partial<AppNavigation>): Promise<ServiceResponse<AppDesign>> {
    try {
      const { data: current } = await this.getByProjectId(projectId);
      
      if (!current) {
        return { success: false, error: 'App design not found' };
      }

      const newNavigation = { ...current.navigation, ...navigation };

      const { data, error } = await supabaseAdmin
        .from('app_designs')
        .update({
          navigation: newNavigation,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating navigation:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ SEO ============
  async updateSEO(projectId: string, seo: Partial<AppSEO>): Promise<ServiceResponse<AppDesign>> {
    try {
      const { data: current } = await this.getByProjectId(projectId);
      
      if (!current) {
        return { success: false, error: 'App design not found' };
      }

      const newSEO = { ...current.seo, ...seo };

      const { data, error } = await supabaseAdmin
        .from('app_designs')
        .update({
          seo: newSEO,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating SEO:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ DELETE ============
  async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabaseAdmin
        .from('app_designs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting app design:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ MARK AS FINAL ============
  async markAsFinal(projectId: string): Promise<ServiceResponse<AppDesign>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('app_designs')
        .update({
          is_final: true,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;

      toast.success('تم اعتماد تصميم التطبيق');
      return { success: true, data };
    } catch (error: any) {
      console.error('Error marking app design as final:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ EXPORT ============
  async saveExport(
    projectId: string, 
    format: 'pwa' | 'reactNative' | 'flutter' | 'html', 
    url: string
  ): Promise<ServiceResponse<AppDesign>> {
    try {
      const { data: current } = await this.getByProjectId(projectId);
      
      if (!current) {
        return { success: false, error: 'App design not found' };
      }

      const newExports = { ...current.exports, [format]: url };

      const { data, error } = await supabaseAdmin
        .from('app_designs')
        .update({
          exports: newExports,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error saving export:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ APPLY LOGO SYNC ============
  applyLogoColors(theme: AppTheme, logoColors: string[]): AppTheme {
    if (logoColors.length === 0) return theme;

    return {
      ...theme,
      colors: {
        ...theme.colors,
        primary: logoColors[0] || theme.colors.primary,
        accent: logoColors[1] || logoColors[0] || theme.colors.accent
      }
    };
  }
};

export default appDesignService;
