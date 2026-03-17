import { supabase } from '@/lib/supabaseClient';
import { collectBrowserData } from '@/lib/collectBrowserData';
import type { PricingRequestItem } from '@/types/dashboard';

type RequestType = 'package' | 'custom';

interface GuestContactInfo {
    name?: string;
    phone?: string;
    email?: string;
}

export interface SubmitPricingRequestInput {
    requestId?: string | null;
    clientId?: string | null;
    requestType: RequestType;
    packageId?: string | null;
    packageName?: string | null;
    selectedServices: PricingRequestItem[];
    estimatedSubtotal: number;
    estimatedTotal: number;
    priceCurrency: string;
    requestNotes?: string;
    guestContact?: GuestContactInfo;
    locationUrl?: string | null;
}

export interface SubmitPricingRequestResult {
    success: boolean;
    requestId?: string;
    error?: string;
}

type ClientSnapshotRow = {
    id: string;
    username?: string | null;
    company_name?: string | null;
    email?: string | null;
    phone?: string | null;
    phone_number?: string | null;
    package_name?: string | null;
    status?: string | null;
    progress?: number | null;
    next_steps?: string | null;
    package_details?: Record<string, unknown> | null;
    display_name?: string | null;
};

const buildClientSnapshot = (clientRow: ClientSnapshotRow | null) => {
    if (!clientRow) return null;

    return {
        id: clientRow.id,
        username: clientRow.username,
        company_name: clientRow.company_name,
        display_name: clientRow.display_name,
        email: clientRow.email,
        phone: clientRow.phone || clientRow.phone_number,
        package_name: clientRow.package_name,
        status: clientRow.status,
        progress: clientRow.progress,
        next_steps: clientRow.next_steps,
        package_details: clientRow.package_details,
    };
};

export async function submitPricingRequest(input: SubmitPricingRequestInput): Promise<SubmitPricingRequestResult> {
    try {
        const browserData = collectBrowserData();
        let clientRow: ClientSnapshotRow | null = null;

        if (input.clientId) {
            const { data, error } = await supabase
                .from('clients')
                .select('id, username, company_name, email, phone, phone_number, package_name, status, progress, next_steps, package_details, display_name')
                .eq('id', input.clientId)
                .single();

            if (error) {
                console.error('Failed to load client snapshot for pricing request:', error);
            } else {
                clientRow = data as ClientSnapshotRow;
            }
        }

        const clientSnapshot = buildClientSnapshot(clientRow);
        const companyName = clientRow?.company_name || clientRow?.display_name || input.guestContact?.name || null;

        const requestPayload = {
            client_id: input.clientId || null,
            request_type: input.requestType,
            ...(input.requestId ? {} : { status: 'new' }),
            request_source: 'pricing_modal',
            package_id: input.packageId || null,
            package_name: input.packageName || null,
            selected_services: input.selectedServices,
            estimated_subtotal: input.estimatedSubtotal,
            estimated_total: input.estimatedTotal,
            price_currency: input.priceCurrency,
            guest_name: input.guestContact?.name || null,
            guest_phone: input.guestContact?.phone || null,
            guest_email: input.guestContact?.email || null,
            company_name: companyName,
            client_snapshot: clientSnapshot,
            request_notes: input.requestNotes?.trim() || null,
            location_url: input.locationUrl || 'Location not shared',
            auto_collected_data: {
                browser: browserData.browser,
                os: browserData.os,
                language: browserData.language,
                device_type: browserData.deviceType,
                referrer: browserData.referrer,
                timestamp: browserData.timestamp,
                timezone: browserData.timezone,
                platform: browserData.platform,
                source: 'pricing_modal',
            },
            reviewed_at: null,
            converted_order_id: null,
        };

        const requestQuery = input.requestId
            ? supabase
                .from('pricing_requests')
                .update(requestPayload)
                .eq('id', input.requestId)
                .select('id')
                .single()
            : supabase
                .from('pricing_requests')
                .insert(requestPayload)
                .select('id')
                .single();

        const { data, error } = await requestQuery;

        if (error) {
            console.error('Pricing request mutation error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, requestId: data.id as string };
    } catch (error) {
        console.error('Pricing request submission failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown pricing request error',
        };
    }
}