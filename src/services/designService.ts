/**
 * ═══════════════════════════════════════════════════════════════════
 * Design Service — Save & Load designs from Supabase
 * ═══════════════════════════════════════════════════════════════════
 */

import { supabase } from '@/lib/supabaseClient';
import type { SavedDesign } from '@/types/dashboard';
import type { MenuItem } from '@/types';

export interface SaveDesignPayload {
    business_name: string;
    service_type: string;
    selected_theme: string;
    custom_theme: { primary: string; accent: string; gradient: string };
    selected_template: string;
    is_dark_mode: boolean;
    glass_effect: boolean;
    active_texture: string;
    font_size: number;
    view_mode: string;
    device_view: string;
    enable_3d: boolean;
    rotation_x: number;
    rotation_y: number;
    show_ratings: boolean;
    show_time: boolean;
    show_featured: boolean;
    image_quality: string;
    sort_by: string;
    custom_items: MenuItem[];
    cart_items: Record<string, number>;
    favorites: number[];
    client_id?: string;
    browser_data?: Record<string, unknown>;
}

/**
 * Save a design configuration to Supabase.
 * Returns the created design with its UUID for QR/sharing.
 */
export const saveDesign = async (payload: SaveDesignPayload): Promise<SavedDesign> => {
    const { data, error } = await supabase
        .from('saved_designs')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error('Failed to save design:', error);
        throw new Error(error.message || 'Failed to save design');
    }

    return data as SavedDesign;
};

/**
 * Update an existing design (upsert for auto-save).
 */
export const updateDesign = async (designId: string, payload: Partial<SaveDesignPayload>): Promise<SavedDesign> => {
    const { data, error } = await supabase
        .from('saved_designs')
        .update(payload)
        .eq('id', designId)
        .select()
        .single();

    if (error) {
        console.error('Failed to update design:', error);
        throw new Error(error.message || 'Failed to update design');
    }

    return data as SavedDesign;
};

/**
 * Fetch all designs belonging to a specific client.
 */
export const fetchDesignsByClient = async (clientId: string): Promise<SavedDesign[]> => {
    const { data, error } = await supabase
        .from('saved_designs')
        .select('*')
        .eq('client_id', clientId)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch client designs:', error);
        return [];
    }

    return (data || []) as SavedDesign[];
};

export type LoadDesignResult =
  | { data: SavedDesign; reason: null }
  | { data: null; reason: 'not_found' | 'network' | 'permission' | 'unknown' };

/**
 * Load a design by its UUID (for QR preview).
 * Never throws — always returns a result with a reason.
 */
export const loadDesign = async (designId: string): Promise<LoadDesignResult> => {
    try {
        const { data, error } = await supabase
            .from('saved_designs')
            .select('*')
            .eq('id', designId)
            .single();

        if (error) {
            // PGRST116 = no rows found
            if (error.code === 'PGRST116') return { data: null, reason: 'not_found' };
            // 42501 / PGRST301 = permission denied (RLS)
            if (error.code === '42501' || error.code === 'PGRST301') return { data: null, reason: 'permission' };
            console.error('loadDesign error:', error.code, error.message);
            return { data: null, reason: 'unknown' };
        }

        // Increment view count in background (best effort)
        supabase.rpc('increment_design_views', { design_id: designId }).catch(() => { });

        return { data: data as SavedDesign, reason: null };
    } catch (err) {
        console.error('loadDesign network error:', err);
        return { data: null, reason: 'network' };
    }
};

/**
 * @deprecated Use loadDesign() which returns LoadDesignResult.
 * Kept as a simple backward-compat shim for any callers that expect SavedDesign | null.
 */
export const loadDesignSimple = async (designId: string): Promise<SavedDesign | null> => {
    const result = await loadDesign(designId);
    return result.data;
};

/**
 * Fetch all designs (for admin dashboard).
 */
export const fetchAllDesigns = async (): Promise<SavedDesign[]> => {
    const { data, error } = await supabase
        .from('saved_designs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch designs:', error);
        return [];
    }

    return (data || []) as SavedDesign[];
};

/**
 * Update design status (admin dashboard).
 */
export const updateDesignStatus = async (id: string, status: string): Promise<void> => {
    const { error } = await supabase
        .from('saved_designs')
        .update({ status })
        .eq('id', id);

    if (error) throw new Error(error.message);
};

/**
 * Delete a design (admin dashboard).
 */
export const deleteDesign = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('saved_designs')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
};
