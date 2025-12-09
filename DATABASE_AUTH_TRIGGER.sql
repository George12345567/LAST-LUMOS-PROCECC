-- ═══════════════════════════════════════════════════════════════════
-- Lumos Agency - Authentication Auto Profile Creation Trigger
-- ═══════════════════════════════════════════════════════════════════
-- 
-- This SQL script creates a trigger that automatically creates a profile
-- in the public.profiles table when a new user signs up via Supabase Auth.
--
-- ⚡ AUTOMATIC EXECUTION: Run this script in Supabase SQL Editor
-- 
-- ═══════════════════════════════════════════════════════════════════

-- Step 1: Create the Trigger Function
-- This function will be called AFTER a new user is inserted into auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a new row into public.profiles for the new user
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (
        NEW.id,                                           -- User ID from auth.users
        NEW.email,                                        -- Email from auth.users
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),  -- Full name from metadata (or empty string)
        'customer',                                       -- Default role: customer
        NOW(),                                            -- Created timestamp
        NOW()                                             -- Updated timestamp
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the Trigger on auth.users
-- This trigger fires AFTER a new user is created via sign up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════════
-- SUCCESS! 🎉
-- ═══════════════════════════════════════════════════════════════════
-- 
-- The trigger is now active. When a user signs up:
-- 1. Supabase Auth creates a record in auth.users
-- 2. This trigger automatically creates a matching profile in public.profiles
-- 3. The profile will have role = 'customer' by default
-- 4. Full name will be extracted from sign up metadata
-- 
-- ═══════════════════════════════════════════════════════════════════
