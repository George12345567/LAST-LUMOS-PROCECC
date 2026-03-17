/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const defaultOrigin = (Deno.env.get('ALLOWED_ORIGINS') || '*').split(',')[0]?.trim() || '*';

const corsHeaders = {
    'Access-Control-Allow-Origin': defaultOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-api-key',
};

const json = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const fromBase64Url = (value: string): Uint8Array => {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
    const raw = atob(base64);
    return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

const verifySessionToken = async (token: string, secret: string): Promise<Record<string, unknown> | null> => {
    try {
        const [header, body, sig] = token.split('.');
        if (!header || !body || !sig) return null;
        const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
        const ok = await crypto.subtle.verify('HMAC', key, fromBase64Url(sig), new TextEncoder().encode(`${header}.${body}`));
        if (!ok) return null;
        const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as Record<string, unknown>;
        const exp = Number(payload.exp || 0);
        if (!exp || Date.now() / 1000 > exp) return null;
        return payload;
    } catch {
        return null;
    }
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return json({ success: false, error: 'Method not allowed' }, 405);

    try {
        const sessionToken = req.headers.get('x-session-token') || '';
        const secret = Deno.env.get('SESSION_TOKEN_SECRET') || '';
        if (!sessionToken || !secret) return json({ success: false, error: 'Unauthorized' }, 401);
        const session = await verifySessionToken(sessionToken, secret);
        if (!session) return json({ success: false, error: 'Unauthorized' }, 401);

        const role = String(session.role || '');
        const tokenClientId = String(session.sub || '');
        if (role !== 'admin' && role !== 'client') return json({ success: false, error: 'Unauthorized' }, 401);

        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
        const body = await req.json();
        const action = String(body?.action || '');

        if (action === 'getProfile') {
            const clientId = String(body?.clientId || '');
            if (!clientId) return json({ success: false, error: 'clientId is required' }, 400);
            if (role === 'client' && clientId !== tokenClientId) return json({ success: false, error: 'Forbidden' }, 403);

            const { data, error } = await supabase
                .from('clients')
                .select('avatar_style, avatar_seed, avatar_config, avatar_url, display_name, bio, tagline, website, location, timezone, social_links, brand_colors, logo_url, cover_gradient, theme_accent, profile_visible')
                .eq('id', clientId)
                .single();

            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true, data });
        }

        if (action === 'updateProfile') {
            const clientId = String(body?.clientId || '');
            const updates = body?.updates || {};
            if (!clientId) return json({ success: false, error: 'clientId is required' }, 400);
            if (role === 'client' && clientId !== tokenClientId) return json({ success: false, error: 'Forbidden' }, 403);

            const updatePayload = {
                ...updates,
                last_profile_update: new Date().toISOString(),
            };

            const { error } = await supabase.from('clients').update(updatePayload).eq('id', clientId);
            if (error) return json({ success: false, error: error.message }, 500);

            const actions = Object.keys(updates || {}).filter((key) => key !== 'last_profile_update');
            if (actions.length > 0) {
                await supabase.from('profile_activity').insert({
                    client_id: clientId,
                    action: actions.length === 1 ? `${actions[0]}_updated` : 'profile_bulk_update',
                    details: { fields: actions },
                });
            }

            return json({ success: true });
        }

        if (action === 'getAvatarPresets') {
            if (role !== 'admin' && role !== 'client') return json({ success: false, error: 'Unauthorized' }, 401);
            const { data, error } = await supabase.from('avatar_presets').select('*').order('sort_order', { ascending: true });
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true, data: data || [] });
        }

        if (action === 'getProfileActivity') {
            if (role !== 'admin') return json({ success: false, error: 'Unauthorized' }, 401);

            const clientId = String(body?.clientId || '');
            const limit = Math.max(1, Math.min(100, Number(body?.limit || 20)));
            if (!clientId) return json({ success: false, error: 'clientId is required' }, 400);

            const { data, error } = await supabase
                .from('profile_activity')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true, data: data || [] });
        }

        return json({ success: false, error: 'Unsupported action' }, 400);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected error';
        return json({ success: false, error: message }, 500);
    }
});
