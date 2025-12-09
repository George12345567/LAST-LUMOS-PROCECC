import { supabase } from '@/lib/supabaseClient';
import { collectBrowserData } from '@/lib/collectBrowserData';

interface FormData {
    name?: string;
    phone?: string;
    message?: string;
    businessName?: string;
    industry?: string;
    serviceNeeded?: string;
    description?: string;
}

interface SubmissionResult {
    success: boolean;
    contactId?: number;
    error?: string;
}

/**
 * Submit contact form data to Supabase
 * Inserts into: contacts, marketing_data, activity_log tables
 */
export const submitContactForm = async (
    formData: FormData,
    locationUrl: string | null,
    formType: string = 'Contact Form'
): Promise<SubmissionResult> => {
    try {
        // Step 1: Collect user/device data
        const browserData = collectBrowserData();

        // Step 2: Insert into contacts table
        const { data: contactData, error: contactError } = await supabase
            .from('contacts')
            .insert([
                {
                    name: formData.name || 'غير محدد',
                    phone: formData.phone || 'غير محدد',
                    message: formData.message || formData.description || 'غير محدد',
                    location_url: locationUrl || 'لم يتم السماح بالموقع',
                    status: 'new',
                    auto_collected_data: {
                        browser: browserData.browser,
                        os: browserData.os,
                        language: browserData.language,
                        referrer: browserData.referrer,
                        timestamp: browserData.timestamp,
                        timezone: browserData.timezone,
                        platform: browserData.platform,
                        // Additional form-specific data
                        form_type: formType,
                        business_name: formData.businessName,
                        industry: formData.industry,
                        service_needed: formData.serviceNeeded,
                    },
                },
            ])
            .select()
            .single();

        if (contactError) {
            console.error('❌ Supabase contacts insert error:', contactError);
            return { success: false, error: contactError.message };
        }

        const contactId = contactData.id;
        console.log('✅ Contact inserted with ID:', contactId);

        // Step 3: Insert into marketing_data table
        const { error: marketingError } = await supabase
            .from('marketing_data')
            .insert([
                {
                    contact_id: contactId,
                    device_type: browserData.deviceType,
                    screen_width: window.screen.width,
                    full_data: {
                        ...browserData,
                        form_type: formType,
                        business_name: formData.businessName,
                        industry: formData.industry,
                        service_needed: formData.serviceNeeded,
                    },
                },
            ]);

        if (marketingError) {
            console.error('❌ Supabase marketing_data insert error:', marketingError);
            // Don't fail the whole operation if marketing data fails
        } else {
            console.log('✅ Marketing data inserted for contact:', contactId);
        }

        // Step 4: Insert into activity_log
        const { error: logError } = await supabase
            .from('activity_log')
            .insert([
                {
                    activity_type: 'form_submission',
                    activity_data: {
                        contact_id: contactId,
                        form_type: formType,
                        timestamp: new Date().toISOString(),
                        device_type: browserData.deviceType,
                        browser: browserData.browser,
                        os: browserData.os,
                    },
                },
            ]);

        if (logError) {
            console.error('❌ Supabase activity_log insert error:', logError);
            // Don't fail the whole operation if activity log fails
        } else {
            console.log('✅ Activity logged for contact:', contactId);
        }

        return { success: true, contactId };
    } catch (error) {
        console.error('❌ Supabase submission error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};
