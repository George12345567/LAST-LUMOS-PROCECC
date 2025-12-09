/**
 * ═══════════════════════════════════════════════════════════════════
 * Supabase Client - Secure Connection
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Initializes the Supabase client with hardcoded credentials for stability.
 * Uses ANON key only (safe for frontend).
 * 
 * ⚠️ Security Note: Only the anon key is exposed here.
 * Row Level Security (RLS) policies on Supabase protect the data.
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase Configuration (Stable & Production-Ready)
const SUPABASE_URL = 'https://hkiczkmdxldshooaelio.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhraWN6a21keGxkc2hvb2FlbGlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4OTc3MjQsImV4cCI6MjA3OTQ3MzcyNH0.4OK8cfTD38Fy6z-Kux0PBqRK_ff9laCLKYO0iEuvZCs';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Export configuration for debugging purposes
export const SUPABASE_CONFIG = {
    url: SUPABASE_URL,
    hasAnonKey: !!SUPABASE_ANON_KEY
};
