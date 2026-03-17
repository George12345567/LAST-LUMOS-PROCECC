import { getSessionToken } from '@/lib/sessionAuth';

const EDGE_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

const EDGE_HEADERS = {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

const callProfileEdge = async (payload: Record<string, unknown>) => {
    const sessionToken = getSessionToken();
    if (!sessionToken) throw new Error('Missing session token');
    const headers: Record<string, string> = { ...EDGE_HEADERS };
    headers['x-session-token'] = sessionToken;

    const response = await fetch(`${EDGE_BASE_URL}/profile-service`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({ success: false, error: 'Profile service request failed' }));
    if (!response.ok || !result.success) {
        throw new Error(result.error || 'Profile service request failed');
    }

    return result;
};

export const edgeGetProfile = async (clientId: string) => {
    const result = await callProfileEdge({ action: 'getProfile', clientId });
    return result.data as Record<string, unknown> | null;
};

export const edgeUpdateProfile = async (clientId: string, updates: Record<string, unknown>) => {
    await callProfileEdge({ action: 'updateProfile', clientId, updates });
};

export const edgeGetAvatarPresets = async () => {
    const result = await callProfileEdge({ action: 'getAvatarPresets' });
    return (result.data as Array<Record<string, unknown>>) || [];
};

export const edgeGetProfileActivity = async (clientId: string, limit = 20) => {
    const result = await callProfileEdge({ action: 'getProfileActivity', clientId, limit });
    return (result.data as Array<Record<string, unknown>>) || [];
};
