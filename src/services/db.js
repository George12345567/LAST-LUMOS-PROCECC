import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { collectUserData, getLocationUrl } from '../utils/analytics.js';

/**
 * Saves contact form submission to Supabase with full analytics
 * @param {Object} formData - {name, phone, message}
 * @returns {Promise<Object>} Result with success status and data
 */
export async function saveContact(formData) {
    try {
        // Collect comprehensive Business Intelligence data
        const userData = await collectUserData();
        const locationUrl = userData.location_gps;

        // 1. Insert into contacts table
        const { data: contactData, error: contactError } = await supabaseAdmin
            .from('contacts')
            .insert({
                name: formData.name,
                phone: formData.phone,
                message: formData.message,
                auto_collected_data: userData,
                location_url: locationUrl,
                status: 'new'
            })
            .select()
            .single();

        if (contactError) throw contactError;

        const contactId = contactData.id;

        // 2. Insert into marketing_data
        const { error: marketingError } = await supabaseAdmin
            .from('marketing_data')
            .insert({
                contact_id: contactId,
                device_type: userData.tech.device_type,
                screen_width: userData.tech.screen_width,
                full_data: {
                    ...userData,
                    formType: 'contact',
                    contact_id: contactId
                }
            });

        if (marketingError) console.error('Marketing data error:', marketingError);

        // 3. Insert into activity_log
        const { error: activityError } = await supabaseAdmin
            .from('activity_log')
            .insert({
                activity_type: 'new_message',
                activity_data: {
                    contact_id: contactId,
                    name: formData.name,
                    phone: formData.phone,
                    source: 'contact_form',
                    marketing_source: userData.marketing.source,
                    marketing_medium: userData.marketing.medium,
                    marketing_campaign: userData.marketing.campaign,
                    visit_count: userData.behavior.visit_count,
                    time_on_site: userData.behavior.time_on_site_sec,
                    city: userData.location_ip.city,
                    country: userData.location_ip.country,
                    device: userData.tech.device_type,
                    os: userData.tech.os,
                    browser: userData.tech.browser
                }
            });

        if (activityError) console.error('Activity log error:', activityError);

        return {
            success: true,
            data: contactData,
            message: 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.'
        };

    } catch (error) {
        console.error('Error saving contact:', error);
        return {
            success: false,
            error: error.message,
            message: 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.'
        };
    }
}

/**
 * Saves order submission to Supabase with full analytics
 * @param {Object} orderData - {client_name, phone, total_price, plan_details}
 * @returns {Promise<Object>} Result with success status and data
 */
export async function saveOrder(orderData) {
    try {
        // Collect comprehensive Business Intelligence data
        const userData = await collectUserData();
        const locationUrl = userData.location_gps;

        // 1. Insert into orders table
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                client_name: orderData.client_name,
                phone: orderData.phone,
                total_price: orderData.total_price,
                plan_details: orderData.plan_details,
                auto_collected_data: userData,
                location_url: locationUrl,
                status: 'pending'
            })
            .select()
            .single();

        if (orderError) throw orderError;

        const orderId = order.id;

        // 2. Insert into marketing_data
        const { error: marketingError } = await supabaseAdmin
            .from('marketing_data')
            .insert({
                order_id: orderId,
                device_type: userData.tech.device_type,
                screen_width: userData.tech.screen_width,
                full_data: {
                    ...userData,
                    orderValue: orderData.total_price,
                    formType: 'order',
                    order_id: orderId
                }
            });

        if (marketingError) console.error('Marketing data error:', marketingError);

        // 3. Insert into activity_log
        const { error: activityError } = await supabaseAdmin
            .from('activity_log')
            .insert({
                activity_type: 'new_order',
                activity_data: {
                    order_id: orderId,
                    client_name: orderData.client_name,
                    phone: orderData.phone,
                    total_price: orderData.total_price,
                    source: orderData.source || 'plan_builder',
                    marketing_source: userData.marketing.source,
                    marketing_medium: userData.marketing.medium,
                    marketing_campaign: userData.marketing.campaign,
                    attribution_type: userData.marketing.attribution_type,
                    visit_count: userData.behavior.visit_count,
                    time_on_site: userData.behavior.time_on_site_sec,
                    is_returning_visitor: userData.behavior.is_returning_visitor,
                    city: userData.location_ip.city,
                    country: userData.location_ip.country,
                    isp: userData.location_ip.isp,
                    device: userData.tech.device_type,
                    os: userData.tech.os,
                    browser: userData.tech.browser
                }
            });

        if (activityError) console.error('Activity log error:', activityError);

        return {
            success: true,
            data: order,
            message: `شكراً ${orderData.client_name}! تم استلام طلبك بنجاح.`
        };

    } catch (error) {
        console.error('Error saving order:', error);
        return {
            success: false,
            error: error.message,
            message: 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.'
        };
    }
}
