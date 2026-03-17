/**
 * ═══════════════════════════════════════════════════════════════════
 * Supabase Client - Secure Connection
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Initializes the Supabase client from environment variables.
 * Uses ANON key only (safe for frontend).
 * 
 * ⚠️ Security Note: Only the anon key is exposed here.
 * Row Level Security (RLS) policies on Supabase protect the data.
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Missing Supabase env vars. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
    global: {
        headers: {
            'x-app-version': '2.1'
        }
    }
});

// Export configuration for debugging purposes
export const SUPABASE_CONFIG = {
    url: SUPABASE_URL,
    hasAnonKey: !!SUPABASE_ANON_KEY
};

// Health check helper - can be called to verify database connectivity
export const checkDatabaseConnection = async () => {
    try {
        const { error } = await supabase.from('contacts').select('id', { count: 'exact', head: true });
        if (error) throw error;
        return { connected: true, message: 'Database connected successfully' };
    } catch (error) {
        console.error('Database connection check failed:', error);
        return { connected: false, message: error instanceof Error ? error.message : 'Connection failed' };
    }
};
