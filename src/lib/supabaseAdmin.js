import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';

// ⚠️ SERVICE ROLE KEY - USE ONLY IN ADMIN DASHBOARD
// This bypasses Row Level Security - NEVER expose to public
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase Admin environment variables!');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
