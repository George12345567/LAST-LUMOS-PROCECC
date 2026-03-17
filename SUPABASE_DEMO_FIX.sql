-- ═══════════════════════════════════════════════════════════════════
-- SUPABASE DEMO FIX — Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════
-- Fixes the /demo?id=UUID page showing "Preview Unavailable"
--
-- Root cause: The `saved_designs` table either:
--   a) Doesn't exist yet  →  run DATABASE_SAVED_DESIGNS.sql first
--   b) Exists but the public read RLS policy is missing
--   c) Supabase project was paused (free tier) — unpause it at supabase.com
-- ═══════════════════════════════════════════════════════════════════

-- Step 1: Make sure the table exists (safe — does nothing if it already exists)
-- If you get an error here about missing columns/FK, run DATABASE_SAVED_DESIGNS.sql instead.
CREATE TABLE IF NOT EXISTS saved_designs (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name   TEXT NOT NULL DEFAULT 'My Business',
    service_type    TEXT NOT NULL DEFAULT 'restaurant',
    selected_theme  TEXT DEFAULT 'default',
    custom_theme    JSONB DEFAULT '{"primary":"#00bcd4","accent":"#00bcd4","gradient":"linear-gradient(135deg,#00bcd4,#00acc1)"}',
    selected_template TEXT DEFAULT 'classic',
    is_dark_mode    BOOLEAN DEFAULT FALSE,
    glass_effect    BOOLEAN DEFAULT FALSE,
    active_texture  TEXT DEFAULT 'none',
    font_size       NUMERIC(3,2) DEFAULT 1.0,
    view_mode       TEXT DEFAULT 'list',
    device_view     TEXT DEFAULT 'mobile',
    enable_3d       BOOLEAN DEFAULT TRUE,
    rotation_x      INTEGER DEFAULT 0,
    rotation_y      INTEGER DEFAULT 0,
    show_ratings    BOOLEAN DEFAULT TRUE,
    show_time       BOOLEAN DEFAULT TRUE,
    show_featured   BOOLEAN DEFAULT TRUE,
    image_quality   TEXT DEFAULT 'standard',
    sort_by         TEXT DEFAULT 'name',
    custom_items    JSONB DEFAULT '[]'::jsonb,
    cart_items      JSONB DEFAULT '{}'::jsonb,
    favorites       JSONB DEFAULT '[]'::jsonb,
    client_id       UUID,
    visitor_name    TEXT,
    visitor_email   TEXT,
    visitor_phone   TEXT,
    visitor_note    TEXT,
    browser_data    JSONB DEFAULT '{}'::jsonb,
    status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'featured')),
    view_count      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable RLS (safe — does nothing if already enabled)
ALTER TABLE saved_designs ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop any old conflicting policies (safe — IF EXISTS)
DROP POLICY IF EXISTS "Anyone can create designs"  ON saved_designs;
DROP POLICY IF EXISTS "Anyone can view designs"    ON saved_designs;
DROP POLICY IF EXISTS "public_read_active"         ON saved_designs;
DROP POLICY IF EXISTS "Public read active designs" ON saved_designs;

-- Step 4: Create the correct policies
-- INSERT: public visitors can save new designs
CREATE POLICY "Anyone can create designs" ON saved_designs
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- SELECT: public (anon) access so QR scan / /demo?id= works WITHOUT login
CREATE POLICY "Anyone can view designs" ON saved_designs
    FOR SELECT TO anon, authenticated
    USING (true);

-- UPDATE: only authenticated sessions (admin dashboard)
DROP POLICY IF EXISTS "Authenticated users can update designs" ON saved_designs;
CREATE POLICY "Authenticated users can update designs" ON saved_designs
    FOR UPDATE TO authenticated
    USING (true) WITH CHECK (true);

-- DELETE: only authenticated sessions (admin dashboard)
DROP POLICY IF EXISTS "Authenticated users can delete designs" ON saved_designs;
CREATE POLICY "Authenticated users can delete designs" ON saved_designs
    FOR DELETE TO authenticated
    USING (true);

-- Step 5: Ensure the view-count RPC exists
CREATE OR REPLACE FUNCTION increment_design_views(design_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE saved_designs SET view_count = view_count + 1 WHERE id = design_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Ensure auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_saved_designs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_saved_designs_timestamp ON saved_designs;
CREATE TRIGGER trigger_update_saved_designs_timestamp
    BEFORE UPDATE ON saved_designs
    FOR EACH ROW
    EXECUTE FUNCTION update_saved_designs_updated_at();

-- ───────────────────────────────────────────────────────────────────
-- Verify: run this query to confirm the policies are set
-- ───────────────────────────────────────────────────────────────────
-- SELECT policyname, cmd, roles::text FROM pg_policies WHERE tablename = 'saved_designs';
--
-- Expected output — you should see:
--   Anyone can create designs   | INSERT | {anon,authenticated}
--   Anyone can view designs     | SELECT | {anon,authenticated}
--   Authenticated users can ... | UPDATE | {authenticated}
--   Authenticated users can ... | DELETE | {authenticated}
-- ═══════════════════════════════════════════════════════════════════
