// ============================================
// LOGO SERVICE
// ============================================
// Service for managing logo designs in the database

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { toast } from 'sonner';
import type { 
  LogoDesign, 
  LogoConfig, 
  LogoVariants,
  LogoMockups,
  LogoExports,
  BrandKit,
  ServiceResponse 
} from '../types';

// Default logo configuration
export const DEFAULT_LOGO_CONFIG: LogoConfig = {
  text: 'BRAND',
  fontFamily: 'Inter',
  fontWeight: '800',
  fontSize: 64,
  letterSpacing: -2,
  textGradient: false,
  textColorStart: '#1e293b',
  textColorEnd: '#334155',
  iconName: 'Zap',
  iconSize: 56,
  iconRotation: 0,
  iconGradient: true,
  iconColorStart: '#6366f1',
  iconColorEnd: '#a855f7',
  layoutMode: 'row',
  gap: 16,
  padding: 32,
  bgType: 'transparent',
  bgColorStart: '#ffffff',
  bgColorEnd: '#f8fafc',
  borderRadius: 16,
  shadow: false,
  glow: false
};

export const logoService = {
  // ============ CREATE ============
  async create(projectId: string, config?: Partial<LogoConfig>): Promise<ServiceResponse<LogoDesign>> {
    try {
      const logoData = {
        project_id: projectId,
        config: { ...DEFAULT_LOGO_CONFIG, ...config },
        variants: {},
        mockups: {},
        exports: {},
        brand_kit: { colors: [], fonts: [], spacing: {}, usage_guidelines: '' },
        is_final: false,
        version_number: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseAdmin
        .from('logos')
        .insert(logoData)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating logo:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ READ ============
  async getByProjectId(projectId: string): Promise<ServiceResponse<LogoDesign>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('logos')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      return { success: true, data: data || undefined };
    } catch (error: any) {
      console.error('Error fetching logo:', error);
      return { success: false, error: error.message };
    }
  },

  async getById(id: string): Promise<ServiceResponse<LogoDesign>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('logos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching logo:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ UPDATE ============
  async update(id: string, data: Partial<LogoDesign>): Promise<ServiceResponse<LogoDesign>> {
    try {
      const { data: logo, error } = await supabaseAdmin
        .from('logos')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: logo };
    } catch (error: any) {
      console.error('Error updating logo:', error);
      return { success: false, error: error.message };
    }
  },

  async updateConfig(projectId: string, config: Partial<LogoConfig>): Promise<ServiceResponse<LogoDesign>> {
    try {
      // Get current logo
      const { data: current } = await this.getByProjectId(projectId);
      
      if (!current) {
        // Create new logo if doesn't exist
        return this.create(projectId, config);
      }

      // Merge configs
      const newConfig = { ...current.config, ...config };

      const { data, error } = await supabaseAdmin
        .from('logos')
        .update({
          config: newConfig,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating logo config:', error);
      return { success: false, error: error.message };
    }
  },

  async updateVariants(projectId: string, variants: Partial<LogoVariants>): Promise<ServiceResponse<LogoDesign>> {
    try {
      const { data: current } = await this.getByProjectId(projectId);
      
      if (!current) {
        return { success: false, error: 'Logo not found' };
      }

      const newVariants = { ...current.variants, ...variants };

      const { data, error } = await supabaseAdmin
        .from('logos')
        .update({
          variants: newVariants,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating logo variants:', error);
      return { success: false, error: error.message };
    }
  },

  async updateMockups(projectId: string, mockups: Partial<LogoMockups>): Promise<ServiceResponse<LogoDesign>> {
    try {
      const { data: current } = await this.getByProjectId(projectId);
      
      if (!current) {
        return { success: false, error: 'Logo not found' };
      }

      const newMockups = { ...current.mockups, ...mockups };

      const { data, error } = await supabaseAdmin
        .from('logos')
        .update({
          mockups: newMockups,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating logo mockups:', error);
      return { success: false, error: error.message };
    }
  },

  async updateBrandKit(projectId: string, brandKit: Partial<BrandKit>): Promise<ServiceResponse<LogoDesign>> {
    try {
      const { data: current } = await this.getByProjectId(projectId);
      
      if (!current) {
        return { success: false, error: 'Logo not found' };
      }

      const newBrandKit = { ...current.brand_kit, ...brandKit };

      const { data, error } = await supabaseAdmin
        .from('logos')
        .update({
          brand_kit: newBrandKit,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating brand kit:', error);
      return { success: false, error: error.message };
    }
  },

  async markAsFinal(projectId: string): Promise<ServiceResponse<LogoDesign>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('logos')
        .update({
          is_final: true,
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .select()
        .single();

      if (error) throw error;

      toast.success('تم اعتماد اللوجو');
      return { success: true, data };
    } catch (error: any) {
      console.error('Error marking logo as final:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ DELETE ============
  async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabaseAdmin
        .from('logos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting logo:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ EXPORT ============
  async saveExport(projectId: string, format: keyof LogoExports, url: string): Promise<ServiceResponse<LogoDesign>> {
    try {
      const { data: current } = await this.getByProjectId(projectId);
      
      if (!current) {
        return { success: false, error: 'Logo not found' };
      }

      const newExports = { ...current.exports, [format]: url };

      const { data, error } = await supabaseAdmin
        .from('logos')
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

  // ============ GENERATE BRAND KIT ============
  generateBrandKit(config: LogoConfig): BrandKit {
    const colors: string[] = [];
    
    // Extract colors from config
    if (config.textColorStart) colors.push(config.textColorStart);
    if (config.textColorEnd && config.textGradient) colors.push(config.textColorEnd);
    if (config.iconColorStart) colors.push(config.iconColorStart);
    if (config.iconColorEnd && config.iconGradient) colors.push(config.iconColorEnd);
    if (config.bgType !== 'transparent') {
      if (config.bgColorStart) colors.push(config.bgColorStart);
      if (config.bgColorEnd && config.bgType === 'gradient') colors.push(config.bgColorEnd);
    }

    // Remove duplicates
    const uniqueColors = [...new Set(colors)];

    return {
      colors: uniqueColors,
      fonts: [config.fontFamily],
      spacing: {
        gap: config.gap,
        padding: config.padding,
        borderRadius: config.borderRadius
      },
      usage_guidelines: `
        # دليل استخدام العلامة التجارية
        
        ## الألوان
        ${uniqueColors.map(c => `- ${c}`).join('\n')}
        
        ## الخطوط
        - الخط الرئيسي: ${config.fontFamily}
        - وزن الخط: ${config.fontWeight}
        
        ## المسافات
        - المسافة بين العناصر: ${config.gap}px
        - الحشوة: ${config.padding}px
        - زوايا الحدود: ${config.borderRadius}px
        
        ## إرشادات الاستخدام
        1. الحفاظ على المسافات المحددة حول اللوجو
        2. عدم تغيير ألوان اللوجو
        3. عدم تشويه أو تمديد اللوجو
        4. استخدام النسخة المناسبة حسب الخلفية
      `
    };
  },

  // ============ GENERATE VARIANTS ============
  generateVariantConfigs(config: LogoConfig): { light: LogoConfig; dark: LogoConfig; mono: LogoConfig } {
    return {
      light: {
        ...config,
        textColorStart: '#1e293b',
        textColorEnd: '#334155',
        bgType: 'solid',
        bgColorStart: '#ffffff'
      },
      dark: {
        ...config,
        textColorStart: '#f8fafc',
        textColorEnd: '#e2e8f0',
        bgType: 'solid',
        bgColorStart: '#0f172a'
      },
      mono: {
        ...config,
        textGradient: false,
        iconGradient: false,
        textColorStart: '#000000',
        textColorEnd: '#000000',
        iconColorStart: '#000000',
        iconColorEnd: '#000000',
        bgType: 'transparent'
      }
    };
  }
};

export default logoService;
