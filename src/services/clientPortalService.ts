import { getSessionToken } from '@/lib/sessionAuth';

const EDGE_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const EDGE_HEADERS = {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

export interface ClientPortalSnapshot {
    client: Record<string, unknown> | null;
    updates: Record<string, unknown>[];
    messages: Record<string, unknown>[];
    assets: Record<string, unknown>[];
    pricingRequests: Record<string, unknown>[];
    orders: Record<string, unknown>[];
}

export const fetchClientPortalSnapshot = async (clientId: string): Promise<ClientPortalSnapshot> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) throw new Error('Missing session token');
    const response = await fetch(`${EDGE_BASE_URL}/client-portal`, {
        method: 'POST',
        headers: { ...EDGE_HEADERS, 'x-session-token': sessionToken },
        body: JSON.stringify({ action: 'snapshot', clientId }),
    });

    const payload = await response.json().catch(() => ({ success: false, error: 'Failed to fetch portal data' }));
    if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Failed to fetch portal data');
    }

    return payload.data as ClientPortalSnapshot;
};

export const sendClientPortalMessage = async (clientId: string, message: string): Promise<void> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) throw new Error('Missing session token');
    const response = await fetch(`${EDGE_BASE_URL}/client-portal`, {
        method: 'POST',
        headers: { ...EDGE_HEADERS, 'x-session-token': sessionToken },
        body: JSON.stringify({ action: 'sendMessage', clientId, message }),
    });

    const payload = await response.json().catch(() => ({ success: false, error: 'Failed to send message' }));
    if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Failed to send message');
    }
};

export const recordClientPortalAsset = async (payload: Record<string, unknown>): Promise<void> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) throw new Error('Missing session token');
    const response = await fetch(`${EDGE_BASE_URL}/client-portal`, {
        method: 'POST',
        headers: { ...EDGE_HEADERS, 'x-session-token': sessionToken },
        body: JSON.stringify({ action: 'recordAsset', payload }),
    });

    const result = await response.json().catch(() => ({ success: false, error: 'Failed to record asset' }));
    if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to record asset');
    }
};
