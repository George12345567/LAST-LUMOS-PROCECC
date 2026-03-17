/**
 * ═══════════════════════════════════════════════════════════════════
 * Profile Service - Avatar & Identity Management
 * ═══════════════════════════════════════════════════════════════════
 */

import {
  edgeGetAvatarPresets,
  edgeGetProfile,
  edgeGetProfileActivity,
  edgeUpdateProfile,
} from '@/services/profileEdgeService';

// ─── Types ───────────────────────────────────────────────────────

export interface AvatarConfig {
  style: 'nanoBanana' | 'cosmicDust' | 'liquidMetal' | 'crystalFacet' | 'neonPulse' | 'holographic' | 'origami' | 'photo'
  | 'mesh' | 'abstract' | 'glass' | 'monogram' | 'geometric' | 'pixel';
  seed: string;
  colors: string[];
  pattern?: string;
  complexity?: number;
  shape?: string;
  glow?: boolean;
  animated?: boolean;
  size?: number;
  stars?: number;
  connections?: boolean;
  palette?: string;
  imageUrl?: string;
  filter?: string;
}

export interface SocialLinks {
  website?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  dribbble?: string;
  behance?: string;
}

export interface ProfileData {
  avatar_style: string;
  avatar_seed: string;
  avatar_config: AvatarConfig;
  avatar_url: string;
  display_name: string;
  bio: string;
  tagline: string;
  website: string;
  location: string;
  timezone: string;
  social_links: SocialLinks;
  brand_colors: string[];
  logo_url: string;
  cover_gradient: string;
  theme_accent: string;
  profile_visible: boolean;
}

export interface ProfileUpdatePayload extends Partial<ProfileData> {
  last_profile_update?: string;
}

// ─── Service ─────────────────────────────────────────────────────

export const profileService = {

  /**
   * Fetch full profile data for a client
   */
  async getProfile(clientId: string): Promise<ProfileData | null> {
    try {
      const data = await edgeGetProfile(clientId);
      if (!data) return null;
      return data as ProfileData;
    } catch {
      return null;
    }
  },

  /**
   * Update profile fields
   */
  async updateProfile(clientId: string, updates: ProfileUpdatePayload): Promise<boolean> {
    try {
      await edgeUpdateProfile(clientId, updates as Record<string, unknown>);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Update avatar specifically
   */
  async updateAvatar(clientId: string, style: string, seed: string, config: AvatarConfig): Promise<boolean> {
    return this.updateProfile(clientId, {
      avatar_style: style,
      avatar_seed: seed,
      avatar_config: config,
    });
  },

  /**
   * Fetch avatar presets
   */
  async getAvatarPresets() {
    try {
      return await edgeGetAvatarPresets();
    } catch {
      return [];
    }
  },

  /**
   * Get profile activity log
   */
  async getActivityLog(clientId: string, limit = 20) {
    try {
      return await edgeGetProfileActivity(clientId, limit);
    } catch {
      return [];
    }
  },
};
