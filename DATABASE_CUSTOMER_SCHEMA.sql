-- ============================================
-- CUSTOMER SYSTEM DATABASE SCHEMA
-- ============================================
-- This extends the existing authentication system to support customer accounts

-- 1. UPDATE profiles table to support customer role
-- ============================================
-- Add 'customer' to the role check constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'super_admin', 'viewer', 'customer'));

-- Add additional customer fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- 2. CREATE subscriptions table
-- ============================================
-- Stores customer package subscriptions and orders
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Customer Info (for backward compatibility with non-registered orders)
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    
    -- Package Details
    package_type TEXT CHECK (package_type IN ('ready_made', 'custom')),
    package_name TEXT, -- 'PRO', 'START', or 'Custom Package'
    
    -- Selected Services (for custom packages)
    selected_services JSONB DEFAULT '[]'::jsonb,
    
    -- Pricing
    subtotal DECIMAL(10, 2),
    tech_ops_fee DECIMAL(10, 2),
    total DECIMAL(10, 2),
    currency TEXT DEFAULT 'EGP',
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'completed')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    
    -- Notes
    notes TEXT
);

-- 3. CREATE indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON public.subscriptions(created_at DESC);

-- 4. ENABLE Row Level Security on subscriptions
-- ============================================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can view their own subscriptions
CREATE POLICY "Customers can view own subscriptions"
ON public.subscriptions
FOR SELECT
USING (
    auth.uid() = user_id 
    OR 
    auth.jwt() ->> 'email' = customer_email
);

-- Policy: Customers can insert their own subscriptions
CREATE POLICY "Customers can create own subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (
    auth.uid() = user_id 
    OR 
    auth.jwt() ->> 'email' = customer_email
);

-- Policy: Customers can update their own subscriptions (limited fields)
CREATE POLICY "Customers can update own subscriptions"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins and Super Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Policy: Admins can update any subscription
CREATE POLICY "Admins can update all subscriptions"
ON public.subscriptions
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Policy: Service role has full access
CREATE POLICY "Service role has full access to subscriptions"
ON public.subscriptions
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- 5. CREATE trigger for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_subscription_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscription_updated_at();

-- 6. UPDATE profiles RLS to allow customers to update their own profile
-- ============================================
-- This policy should already exist, but let's ensure it's correct
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 7. CREATE view for customer dashboard
-- ============================================
CREATE OR REPLACE VIEW public.customer_dashboard AS
SELECT 
    s.id,
    s.user_id,
    s.package_type,
    s.package_name,
    s.selected_services,
    s.total,
    s.currency,
    s.status,
    s.created_at,
    s.starts_at,
    s.ends_at,
    p.full_name,
    p.email,
    p.phone,
    p.company
FROM public.subscriptions s
LEFT JOIN public.profiles p ON s.user_id = p.id
WHERE s.user_id = auth.uid();

-- Grant access to the view
GRANT SELECT ON public.customer_dashboard TO authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify tables exist in Table Editor
-- 3. Test RLS policies work correctly
-- 4. Create first customer account for testing
