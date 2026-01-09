export interface Order {
    id: string;
    client_name: string;
    phone: string;
    total_price: number;
    plan_details: any;
    auto_collected_data: any;
    location_url: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    created_at: string;
}

export interface Contact {
    id: string;
    name: string;
    phone: string;
    message: string;
    auto_collected_data: any;
    location_url: string;
    status: 'new' | 'read' | 'contacted' | 'resolved';
    created_at: string;
}

export interface Client {
    id: string;
    username: string;
    password: string;
    company_name?: string;
    security_question?: string;
    security_answer?: string;
    package_name?: string;
    status?: string;
    progress?: number;
    next_steps?: string;
    package_details?: any;
    subscription_config?: any;
    package_payload?: any;
    admin_notes?: string;
    active_offer?: string;
    created_at: string;
}

export interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    totalContacts: number;
    pendingOrders: number;
    completedOrders: number;
    newContacts: number;
    avgOrderValue: number;
    unreadMessages: number;
}
