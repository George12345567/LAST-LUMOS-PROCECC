-- ========================================
-- SUPABASE DELETE FIX - CASCADE DELETION
-- ========================================
-- Run these commands in Supabase SQL Editor
-- to fix deletion issues with related data
-- ========================================

-- Step 1: Add CASCADE to foreign keys in marketing_data table
-- This will automatically delete marketing_data when order/contact is deleted

ALTER TABLE marketing_data
DROP CONSTRAINT IF EXISTS marketing_data_order_id_fkey;

ALTER TABLE marketing_data
ADD CONSTRAINT marketing_data_order_id_fkey
FOREIGN KEY (order_id)
REFERENCES orders(id)
ON DELETE CASCADE;

ALTER TABLE marketing_data
DROP CONSTRAINT IF EXISTS marketing_data_contact_id_fkey;

ALTER TABLE marketing_data
ADD CONSTRAINT marketing_data_contact_id_fkey
FOREIGN KEY (contact_id)
REFERENCES contacts(id)
ON DELETE CASCADE;

-- Step 2: Enable Row Level Security (RLS) if not enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies to allow all operations
-- (For admin dashboard - adjust based on your security needs)

-- Orders policies
DROP POLICY IF EXISTS "Enable all for orders" ON orders;
CREATE POLICY "Enable all for orders"
ON orders
FOR ALL
USING (true)
WITH CHECK (true);

-- Contacts policies
DROP POLICY IF EXISTS "Enable all for contacts" ON contacts;
CREATE POLICY "Enable all for contacts"
ON contacts
FOR ALL
USING (true)
WITH CHECK (true);

-- Marketing_data policies
DROP POLICY IF EXISTS "Enable all for marketing_data" ON marketing_data;
CREATE POLICY "Enable all for marketing_data"
ON marketing_data
FOR ALL
USING (true)
WITH CHECK (true);

-- Activity_log policies
DROP POLICY IF EXISTS "Enable all for activity_log" ON activity_log;
CREATE POLICY "Enable all for activity_log"
ON activity_log
FOR ALL
USING (true)
WITH CHECK (true);

-- Step 4: Verify the setup
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('marketing_data', 'activity_log')
ORDER BY tc.table_name;
