import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';

// Frontend must never hold service-role credentials.
// Keep this alias for compatibility while admin operations migrate to server/edge functions.
export const supabaseAdmin = supabaseUrl
    ? createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_ANON_KEY || '', {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    })
    : supabase;

// Service-role is intentionally disabled in frontend runtime.
export const isAdminMode = false;
