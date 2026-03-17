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
        if (!session || String(session.role || '') !== 'admin') return json({ success: false, error: 'Unauthorized' }, 401);

        const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
        const body = await req.json();
        const action = String(body?.action || 'snapshot');

        if (action === 'snapshot') {
            const [orders, contacts, pricingRequests, clients, unreadClientMessages, designs, clientUpdates] = await Promise.all([
                supabase.from('orders').select('*').order('created_at', { ascending: false }),
                supabase.from('contacts').select('*').order('created_at', { ascending: false }),
                supabase.from('pricing_requests').select('*').order('created_at', { ascending: false }),
                supabase.from('clients').select('*').order('created_at', { ascending: false }),
                supabase.from('client_messages').select('id', { count: 'exact', head: true }).eq('sender', 'client').eq('is_read', false),
                supabase.from('saved_designs').select('*').order('created_at', { ascending: false }),
                supabase.from('client_updates').select('id,client_id,title,type,update_date').order('update_date', { ascending: false }).limit(12),
            ]);

            return json({
                success: true,
                data: {
                    orders: orders.data || [],
                    contacts: contacts.data || [],
                    pricingRequests: pricingRequests.data || [],
                    clients: clients.data || [],
                    unreadMessages: unreadClientMessages.count || 0,
                    designs: designs.data || [],
                    clientUpdates: clientUpdates.data || [],
                },
            });
        }

        if (action === 'updateOrderStatus') {
            const id = String(body?.id || '');
            const status = String(body?.status || '');
            if (!id || !status) return json({ success: false, error: 'id and status are required' }, 400);
            const { error } = await supabase.from('orders').update({ status }).eq('id', id);
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        if (action === 'deleteOrder') {
            const id = String(body?.id || '');
            if (!id) return json({ success: false, error: 'id is required' }, 400);
            const { error } = await supabase.from('orders').delete().eq('id', id);
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        if (action === 'updateContactStatus') {
            const id = String(body?.id || '');
            const status = String(body?.status || '');
            if (!id || !status) return json({ success: false, error: 'id and status are required' }, 400);
            const { error } = await supabase.from('contacts').update({ status }).eq('id', id);
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        if (action === 'deleteContact') {
            const id = String(body?.id || '');
            if (!id) return json({ success: false, error: 'id is required' }, 400);
            const { error } = await supabase.from('contacts').delete().eq('id', id);
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        if (action === 'updatePricingRequestStatus') {
            const id = String(body?.id || '');
            const payload = body?.payload || {};
            if (!id) return json({ success: false, error: 'id is required' }, 400);
            const { error } = await supabase.from('pricing_requests').update(payload).eq('id', id);
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        if (action === 'deletePricingRequest') {
            const id = String(body?.id || '');
            if (!id) return json({ success: false, error: 'id is required' }, 400);
            const { error } = await supabase.from('pricing_requests').delete().eq('id', id);
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        if (action === 'convertPricingRequest') {
            const request = body?.request || {};
            const requestId = String(request.id || '');
            if (!requestId) return json({ success: false, error: 'request.id is required' }, 400);

            const clientName = request.company_name
                || request.guest_name
                || request.client_snapshot?.display_name
                || request.client_snapshot?.username
                || 'Pricing Request';

            const phone = request.guest_phone || request.client_snapshot?.phone || 'Not provided';

            const orderPayload = {
                client_name: clientName,
                phone,
                email: request.guest_email || undefined,
                package_type: request.request_type === 'package' ? (request.package_name || 'Ready Package') : 'Custom Plan',
                total_price: request.estimated_total,
                plan_details: {
                    request_id: request.id,
                    request_type: request.request_type,
                    package_id: request.package_id,
                    package_name: request.package_name,
                    selected_services: request.selected_services,
                    notes: request.request_notes,
                },
                package_payload: request.selected_services,
                client_id: request.client_id || undefined,
                notes: request.request_notes || undefined,
                status: 'pending',
                auto_collected_data: request.auto_collected_data || {},
                location_url: request.location_url || 'Location not shared',
            };

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert(orderPayload)
                .select('id')
                .single();
            if (orderError) return json({ success: false, error: orderError.message }, 500);

            const reviewedAt = new Date().toISOString();
            const { error: pricingError } = await supabase
                .from('pricing_requests')
                .update({ status: 'converted', converted_order_id: order.id, reviewed_at: reviewedAt })
                .eq('id', requestId);
            if (pricingError) return json({ success: false, error: pricingError.message }, 500);

            return json({ success: true, data: { orderId: order.id, reviewedAt } });
        }

        if (action === 'updateDesignStatus') {
            const id = String(body?.id || '');
            const status = String(body?.status || '');
            if (!id || !status) return json({ success: false, error: 'id and status are required' }, 400);
            const { error } = await supabase.from('saved_designs').update({ status }).eq('id', id);
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        if (action === 'deleteDesign') {
            const id = String(body?.id || '');
            if (!id) return json({ success: false, error: 'id is required' }, 400);
            const { error } = await supabase.from('saved_designs').delete().eq('id', id);
            if (error) return json({ success: false, error: error.message }, 500);
            return json({ success: true });
        }

        return json({ success: false, error: 'Unsupported action' }, 400);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected error';
        return json({ success: false, error: message }, 500);
    }
});
