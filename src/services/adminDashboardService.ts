import { Contact, Order, PricingRequest, SavedDesign } from '@/types/dashboard';
import { getSessionToken } from '@/lib/sessionAuth';

const EDGE_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

const EDGE_HEADERS = {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

const callAdminDashboard = async (payload: Record<string, unknown>) => {
    const sessionToken = getSessionToken();
    if (!sessionToken) throw new Error('Missing admin session token');
    const response = await fetch(`${EDGE_BASE_URL}/admin-dashboard`, {
        method: 'POST',
        headers: { ...EDGE_HEADERS, 'x-session-token': sessionToken },
        body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({ success: false, error: 'Admin dashboard request failed' }));
    if (!response.ok || !result.success) {
        throw new Error(result.error || 'Admin dashboard request failed');
    }

    return result;
};

export const fetchAdminDashboardSnapshot = async () => {
    const result = await callAdminDashboard({ action: 'snapshot' });
    return result.data as Record<string, unknown>;
};

export const adminUpdateOrderStatus = async (id: string, status: Order['status']) => {
    await callAdminDashboard({ action: 'updateOrderStatus', id, status });
};

export const adminDeleteOrder = async (id: string) => {
    await callAdminDashboard({ action: 'deleteOrder', id });
};

export const adminUpdateContactStatus = async (id: string, status: Contact['status']) => {
    await callAdminDashboard({ action: 'updateContactStatus', id, status });
};

export const adminDeleteContact = async (id: string) => {
    await callAdminDashboard({ action: 'deleteContact', id });
};

export const adminUpdatePricingRequestStatus = async (id: string, payload: Record<string, unknown>) => {
    await callAdminDashboard({ action: 'updatePricingRequestStatus', id, payload });
};

export const adminDeletePricingRequest = async (id: string) => {
    await callAdminDashboard({ action: 'deletePricingRequest', id });
};

export const adminConvertPricingRequest = async (request: PricingRequest) => {
    const result = await callAdminDashboard({ action: 'convertPricingRequest', request });
    return result.data as { orderId: string; reviewedAt: string };
};

export const adminUpdateDesignStatus = async (id: string, status: SavedDesign['status']) => {
    await callAdminDashboard({ action: 'updateDesignStatus', id, status });
};

export const adminDeleteDesign = async (id: string) => {
    await callAdminDashboard({ action: 'deleteDesign', id });
};
