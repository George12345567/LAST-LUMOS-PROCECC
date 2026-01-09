import { useState, useEffect } from 'react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Order, Contact, Client, DashboardStats } from '@/types/dashboard';
import { toast } from 'sonner';

export const useAdminDashboard = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalOrders: 0,
        totalRevenue: 0,
        totalContacts: 0,
        pendingOrders: 0,
        completedOrders: 0,
        newContacts: 0,
        avgOrderValue: 0,
        unreadMessages: 0
    });

    useEffect(() => {
        fetchData();
        setupRealtimeSubscription();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, contactsRes, clientsRes, messagesRes] = await Promise.all([
                supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false }),
                supabaseAdmin.from('contacts').select('*').order('created_at', { ascending: false }),
                supabaseAdmin.from('clients').select('*').order('created_at', { ascending: false }),
                supabaseAdmin.from('messages').select('*', { count: 'exact', head: true }).eq('sender', 'client').eq('is_read', false)
            ]);

            if (ordersRes.error) throw ordersRes.error;
            if (contactsRes.error) throw contactsRes.error;

            const ordersData = ordersRes.data || [];
            const contactsData = contactsRes.data || [];

            setOrders(ordersData);
            setContacts(contactsData);
            setClients(clientsRes.data || []);

            // Calculate Stats
            const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total_price || 0), 0);
            const pendingOrders = ordersData.filter(o => o.status === 'pending').length;
            const completedOrders = ordersData.filter(o => o.status === 'completed').length;
            const newContacts = contactsData.filter(c => c.status === 'new').length;
            const avgOrderValue = ordersData.length ? totalRevenue / ordersData.length : 0;

            setStats({
                totalOrders: ordersData.length,
                totalRevenue,
                totalContacts: contactsData.length,
                pendingOrders,
                completedOrders,
                newContacts,
                avgOrderValue,
                unreadMessages: messagesRes.count || 0
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const setupRealtimeSubscription = () => {
        const channel = supabaseAdmin
            .channel('admin-dashboard-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchData(); // Simplest strategy: refresh all on change to ensure consistency
                toast.info('Orders updated');
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
                fetchData();
                toast.info('Contacts updated');
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                if (payload.new.sender === 'client') {
                    toast.info('New message received!');
                    fetchData();
                }
            })
            .subscribe();

        return () => {
            supabaseAdmin.removeChannel(channel);
        };
    };

    // --- Actions ---

    const updateOrderStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabaseAdmin.from('orders').update({ status: newStatus }).eq('id', id);
            if (error) throw error;
            toast.success(`Order status updated to ${newStatus}`);
            // Optimistic update could go here, but realtime/fetchData handles it
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
        } catch (err) {
            toast.error('Failed to update order');
        }
    };

    const deleteOrder = async (id: string) => {
        if (!confirm('Are you sure you want to delete this order?')) return;
        try {
            const { error } = await supabaseAdmin.from('orders').delete().eq('id', id);
            if (error) throw error;
            toast.success('Order deleted');
            setOrders(prev => prev.filter(o => o.id !== id));
        } catch (err) {
            toast.error('Failed to delete order');
        }
    };

    const updateContactStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabaseAdmin.from('contacts').update({ status: newStatus }).eq('id', id);
            if (error) throw error;
            toast.success(`Contact marked as ${newStatus}`);
            setContacts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
        } catch (err) {
            toast.error('Failed to update contact');
        }
    };

    const deleteContact = async (id: string) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;
        try {
            const { error } = await supabaseAdmin.from('contacts').delete().eq('id', id);
            if (error) throw error;
            toast.success('Contact deleted');
            setContacts(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            toast.error('Failed to delete contact');
        }
    };

    // Client creation logic from order is complex, keeping simple here or can be moved

    return {
        orders,
        contacts,
        clients,
        stats,
        loading,
        refresh: fetchData,
        updateOrderStatus,
        deleteOrder,
        updateContactStatus,
        deleteContact
    };
};
