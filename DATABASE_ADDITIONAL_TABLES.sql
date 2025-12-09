-- ============================================
-- ADDITIONAL DATABASE TABLES FOR LUMOS AGENCY
-- ============================================
-- Run this after DATABASE_CUSTOMER_SCHEMA.sql

-- ============================================
-- 1. CONTACT SUBMISSIONS TABLE
-- ============================================
-- Stores all contact form submissions from the website
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Contact Info
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    
    -- Message
    subject TEXT,
    message TEXT NOT NULL,
    
    -- Metadata
    source TEXT DEFAULT 'contact_form', -- 'contact_form', 'pricing_modal', 'plan_builder'
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    
    -- Tracking
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Admin Notes
    admin_notes TEXT,
    assigned_to UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);

-- RLS Policies
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Admins can view all submissions
CREATE POLICY "Admins can view all contact submissions"
ON public.contact_submissions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Admins can update submissions
CREATE POLICY "Admins can update contact submissions"
ON public.contact_submissions
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Anyone can insert (for public contact form)
CREATE POLICY "Anyone can create contact submissions"
ON public.contact_submissions
FOR INSERT
WITH CHECK (true);

-- Service role full access
CREATE POLICY "Service role has full access to contact submissions"
ON public.contact_submissions
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER set_contact_submission_updated_at
BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION update_subscription_updated_at();


-- ============================================
-- 2. INVOICES TABLE
-- ============================================
-- Stores invoices for customer subscriptions
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Links
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Invoice Details
    invoice_number TEXT UNIQUE NOT NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    
    -- Amounts
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'EGP',
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded')),
    
    -- Payment Info
    payment_method TEXT, -- 'cash', 'bank_transfer', 'credit_card', 'paypal', etc.
    payment_date TIMESTAMPTZ,
    payment_reference TEXT,
    
    -- Additional Info
    notes TEXT,
    items JSONB, -- Array of invoice items
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON public.invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);

-- RLS Policies
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Customers can view their own invoices
CREATE POLICY "Customers can view own invoices"
ON public.invoices
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all invoices
CREATE POLICY "Admins can view all invoices"
ON public.invoices
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Admins can manage invoices
CREATE POLICY "Admins can manage invoices"
ON public.invoices
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Service role full access
CREATE POLICY "Service role has full access to invoices"
ON public.invoices
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER set_invoice_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION update_subscription_updated_at();


-- ============================================
-- 3. PAYMENTS TABLE
-- ============================================
-- Tracks all payment transactions
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Links
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Payment Details
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'EGP',
    payment_method TEXT NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    
    -- Transaction Info
    transaction_id TEXT,
    gateway_response JSONB,
    
    -- Timestamps
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Notes
    notes TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date DESC);

-- RLS Policies
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Customers can view their own payments
CREATE POLICY "Customers can view own payments"
ON public.payments
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
ON public.payments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Admins can manage payments
CREATE POLICY "Admins can manage payments"
ON public.payments
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Service role full access
CREATE POLICY "Service role has full access to payments"
ON public.payments
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');


-- ============================================
-- 4. SUPPORT TICKETS TABLE
-- ============================================
-- Customer support ticket system
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User Info
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    
    -- Ticket Details
    ticket_number TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category TEXT, -- 'technical', 'billing', 'general', etc.
    
    -- Status
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
    
    -- Assignment
    assigned_to UUID REFERENCES auth.users(id),
    
    -- Related Records
    subscription_id UUID REFERENCES public.subscriptions(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);

-- RLS Policies
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Customers can view their own tickets
CREATE POLICY "Customers can view own tickets"
ON public.support_tickets
FOR SELECT
USING (auth.uid() = user_id);

-- Customers can create tickets
CREATE POLICY "Customers can create tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
ON public.support_tickets
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Admins can manage tickets
CREATE POLICY "Admins can manage tickets"
ON public.support_tickets
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Service role full access
CREATE POLICY "Service role has full access to tickets"
ON public.support_tickets
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER set_support_ticket_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION update_subscription_updated_at();


-- ============================================
-- 5. TICKET MESSAGES TABLE
-- ============================================
-- Messages/replies within support tickets
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Links
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Message
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- Internal admin notes vs customer-visible
    
    -- Attachments
    attachments JSONB, -- Array of file URLs
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON public.ticket_messages(created_at);

-- RLS Policies
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Customers can view non-internal messages on their tickets
CREATE POLICY "Customers can view ticket messages"
ON public.ticket_messages
FOR SELECT
USING (
    NOT is_internal 
    AND EXISTS (
        SELECT 1 FROM public.support_tickets
        WHERE support_tickets.id = ticket_id
        AND support_tickets.user_id = auth.uid()
    )
);

-- Customers can add messages to their tickets
CREATE POLICY "Customers can add messages"
ON public.ticket_messages
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.support_tickets
        WHERE support_tickets.id = ticket_id
        AND support_tickets.user_id = auth.uid()
    )
);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON public.ticket_messages
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Admins can manage messages
CREATE POLICY "Admins can manage messages"
ON public.ticket_messages
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Service role full access
CREATE POLICY "Service role has full access to messages"
ON public.ticket_messages
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');


-- ============================================
-- 6. ACTIVITY LOG TABLE
-- ============================================
-- Track user and system activities
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Actor
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_name TEXT,
    actor_email TEXT,
    
    -- Activity
    action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'logged_in', etc.
    entity_type TEXT NOT NULL, -- 'subscription', 'invoice', 'ticket', 'user', etc.
    entity_id UUID,
    
    -- Details
    description TEXT,
    metadata JSONB, -- Additional context
    
    -- Tracking
    ip_address TEXT,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_type ON public.activity_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- RLS Policies
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Admins can view all activity
CREATE POLICY "Admins can view activity log"
ON public.activity_log
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Service role full access
CREATE POLICY "Service role has full access to activity log"
ON public.activity_log
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');


-- ============================================
-- 7. NOTIFICATIONS TABLE
-- ============================================
-- In-app notifications for users
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Recipient
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification Content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    
    -- Links
    action_url TEXT,
    related_entity_type TEXT,
    related_entity_id UUID,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Service role can create notifications
CREATE POLICY "Service role can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Service role full access
CREATE POLICY "Service role has full access to notifications"
ON public.notifications
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');


-- ============================================
-- 8. USEFUL VIEWS
-- ============================================

-- View: Customer Overview (for admin dashboard)
CREATE OR REPLACE VIEW public.customer_overview AS
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.phone,
    p.company,
    p.created_at as joined_at,
    COUNT(DISTINCT s.id) as total_subscriptions,
    COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_subscriptions,
    SUM(s.total) as total_spent,
    MAX(s.created_at) as last_order_date
FROM public.profiles p
LEFT JOIN public.subscriptions s ON p.id = s.user_id
WHERE p.role = 'customer'
GROUP BY p.id, p.email, p.full_name, p.phone, p.company, p.created_at;

-- Grant access
GRANT SELECT ON public.customer_overview TO authenticated;

-- View: Revenue Summary
CREATE OR REPLACE VIEW public.revenue_summary AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    currency,
    COUNT(*) as total_orders,
    SUM(total) as total_revenue,
    AVG(total) as avg_order_value,
    COUNT(DISTINCT user_id) as unique_customers
FROM public.subscriptions
WHERE status IN ('active', 'completed')
GROUP BY DATE_TRUNC('month', created_at), currency
ORDER BY month DESC;

-- Grant access
GRANT SELECT ON public.revenue_summary TO authenticated;


-- ============================================
-- 9. HELPER FUNCTIONS
-- ============================================

-- Function: Generate unique ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Format: TICK-YYYYMMDD-XXXX
        new_number := 'TICK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                      LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Check if exists
        SELECT EXISTS(SELECT 1 FROM public.support_tickets WHERE ticket_number = new_number) INTO exists;
        
        EXIT WHEN NOT exists;
    END LOOP;
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate unique invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Format: INV-YYYYMMDD-XXXX
        new_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                      LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Check if exists
        SELECT EXISTS(SELECT 1 FROM public.invoices WHERE invoice_number = new_number) INTO exists;
        
        EXIT WHEN NOT exists;
    END LOOP;
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Tables created:
-- 1. contact_submissions - Contact form submissions
-- 2. invoices - Customer invoices
-- 3. payments - Payment transactions
-- 4. support_tickets - Support ticket system
-- 5. ticket_messages - Ticket conversations
-- 6. activity_log - System activity tracking
-- 7. notifications - In-app notifications
--
-- Views created:
-- 1. customer_overview - Admin dashboard customer stats
-- 2. revenue_summary - Revenue analytics
--
-- Functions created:
-- 1. generate_ticket_number() - Auto ticket numbers
-- 2. generate_invoice_number() - Auto invoice numbers
