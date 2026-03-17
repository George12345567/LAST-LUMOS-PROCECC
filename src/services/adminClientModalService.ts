import { getSessionToken } from '@/lib/sessionAuth';

const EDGE_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

const EDGE_HEADERS = {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

const callAdminModal = async (payload: Record<string, unknown>) => {
    const sessionToken = getSessionToken();
    if (!sessionToken) throw new Error('Missing admin session token');
    const response = await fetch(`${EDGE_BASE_URL}/admin-client-modal`, {
        method: 'POST',
        headers: { ...EDGE_HEADERS, 'x-session-token': sessionToken },
        body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({ success: false, error: 'Admin modal request failed' }));
    if (!response.ok || !result.success) {
        throw new Error(result.error || 'Admin modal request failed');
    }
    return result;
};

export const fetchAdminClientModalSnapshot = async (clientId: string) => {
    const result = await callAdminModal({ action: 'snapshot', clientId });
    return result.data as Record<string, unknown>;
};

export const fetchAdminClientSheetSnapshot = async (clientId: string) => {
    const result = await callAdminModal({ action: 'snapshot', clientId });
    return result.data as Record<string, unknown>;
};

export const adminUpdateClient = async (clientId: string, payload: Record<string, unknown>) => {
    await callAdminModal({ action: 'updateClient', clientId, payload });
};

export const adminUpdatePricingRequest = async (requestId: string, payload: Record<string, unknown>) => {
    await callAdminModal({ action: 'updatePricingRequest', requestId, payload });
};

export const adminInsertClientUpdate = async (payload: Record<string, unknown>) => {
    await callAdminModal({ action: 'insertClientUpdate', payload });
};

export const adminSendMessage = async (payload: Record<string, unknown>) => {
    await callAdminModal({ action: 'sendAdminMessage', payload });
};

export const adminMarkClientMessagesRead = async (clientId: string) => {
    await callAdminModal({ action: 'markMessagesRead', clientId });
};

export const adminRecordAsset = async (payload: Record<string, unknown>) => {
    await callAdminModal({ action: 'recordAsset', payload });
};
