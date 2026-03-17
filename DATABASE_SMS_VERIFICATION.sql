-- ==============================================================================
-- DATABASE SCHEMA UPDATE: SMS OTP VERIFICATION
-- ✅ SAFE TO RE-RUN — All statements use IF EXISTS guards
-- Run this script in your Supabase SQL Editor.
-- ==============================================================================

-- 1. Create phone_verifications table
CREATE TABLE IF NOT EXISTS public.phone_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT NOT NULL UNIQUE,
    current_otp TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    attempts_count INT DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    otp_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.phone_verifications IS 'Tracks SMS OTP logic, preventing rate limit abuse and confirming caller identity.';

-- 2. Add is_phone_verified to clients table (safe, skips if already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'clients'
          AND column_name = 'is_phone_verified'
    ) THEN
        ALTER TABLE public.clients ADD COLUMN is_phone_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. Auto-update timestamp trigger function
CREATE OR REPLACE FUNCTION update_phone_verification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger (safe re-run)
DROP TRIGGER IF EXISTS trg_phone_verifications_updated_at ON public.phone_verifications;
CREATE TRIGGER trg_phone_verifications_updated_at
BEFORE UPDATE ON public.phone_verifications
FOR EACH ROW EXECUTE FUNCTION update_phone_verification_timestamp();

-- 5. Enable RLS
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies — drop first to avoid "already exists" errors
DROP POLICY IF EXISTS "Allow public insert to request OTP"    ON public.phone_verifications;
DROP POLICY IF EXISTS "Allow public update for OTP verification" ON public.phone_verifications;
DROP POLICY IF EXISTS "Allow public select on verifications"  ON public.phone_verifications;

CREATE POLICY "Allow public insert to request OTP"
ON public.phone_verifications FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public update for OTP verification"
ON public.phone_verifications FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow public select on verifications"
ON public.phone_verifications FOR SELECT TO public USING (true);

-- ==============================================================================
-- END OF SMS SCHEMA SCRIPT
-- ==============================================================================

