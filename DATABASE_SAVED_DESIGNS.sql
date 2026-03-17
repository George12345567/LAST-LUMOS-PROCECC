-- ═══════════════════════════════════════════════════════════════════
-- SAVED DESIGNS TABLE
-- ═══════════════════════════════════════════════════════════════════
-- Stores user design configurations from the Live Preview Tool.
-- When a user clicks "Save & Publish", all their design state is
-- persisted here. The admin dashboard can view these, and the
-- /demo?id=<uuid> route loads the full design for QR-based preview.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS saved_designs (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Business identity
    business_name   TEXT NOT NULL,
    service_type    TEXT NOT NULL DEFAULT 'restaurant',
    
    -- Visual config
    selected_theme  TEXT DEFAULT 'default',
    custom_theme    JSONB DEFAULT '{"primary":"#00bcd4","accent":"#00bcd4","gradient":"linear-gradient(135deg,#00bcd4,#00acc1)"}',
    selected_template TEXT DEFAULT 'classic',
    is_dark_mode    BOOLEAN DEFAULT FALSE,
    glass_effect    BOOLEAN DEFAULT FALSE,
    active_texture  TEXT DEFAULT 'none',
    font_size       NUMERIC(3,2) DEFAULT 1.0,
    
    -- Layout config
    view_mode       TEXT DEFAULT 'list',
    device_view     TEXT DEFAULT 'mobile',
    enable_3d       BOOLEAN DEFAULT TRUE,
    rotation_x      INTEGER DEFAULT 0,
    rotation_y      INTEGER DEFAULT 0,
    
    -- Content config
    show_ratings    BOOLEAN DEFAULT TRUE,
    show_time       BOOLEAN DEFAULT TRUE,
    show_featured   BOOLEAN DEFAULT TRUE,
    image_quality   TEXT DEFAULT 'standard',
    sort_by         TEXT DEFAULT 'name',
    
    -- Items & data
    custom_items    JSONB DEFAULT '[]'::jsonb,
    cart_items      JSONB DEFAULT '{}'::jsonb,
    favorites       JSONB DEFAULT '[]'::jsonb,
    
    -- Client ownership (links to clients table)
    client_id       UUID REFERENCES clients(id) ON DELETE SET NULL,
    
    -- Visitor metadata (legacy/optional)
    visitor_name    TEXT,
    visitor_email   TEXT,
    visitor_phone   TEXT,
    visitor_note    TEXT,
    browser_data    JSONB DEFAULT '{}'::jsonb,
    
    -- Status
    status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'featured')),
    view_count      INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_saved_designs_created_at ON saved_designs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_designs_status ON saved_designs(status);
CREATE INDEX IF NOT EXISTS idx_saved_designs_service_type ON saved_designs(service_type);
CREATE INDEX IF NOT EXISTS idx_saved_designs_client_id ON saved_designs(client_id);

-- Row Level Security
ALTER TABLE saved_designs ENABLE ROW LEVEL SECURITY;

-- Anyone can INSERT (public visitors saving designs)
CREATE POLICY "Anyone can create designs" ON saved_designs
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Anyone can SELECT (for QR code preview to work)
CREATE POLICY "Anyone can view designs" ON saved_designs
    FOR SELECT TO anon, authenticated
    USING (true);

-- Only authenticated users can UPDATE (admin dashboard)
CREATE POLICY "Authenticated users can update designs" ON saved_designs
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Only authenticated users can DELETE (admin dashboard)
CREATE POLICY "Authenticated users can delete designs" ON saved_designs
    FOR DELETE TO authenticated
    USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_saved_designs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_saved_designs_timestamp
    BEFORE UPDATE ON saved_designs
    FOR EACH ROW
    EXECUTE FUNCTION update_saved_designs_updated_at();

-- Increment view_count function (called from frontend)
CREATE OR REPLACE FUNCTION increment_design_views(design_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE saved_designs SET view_count = view_count + 1 WHERE id = design_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
