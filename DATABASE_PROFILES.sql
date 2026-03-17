-- ═══════════════════════════════════════════════════════════════════
-- DATABASE: Profile System - Avatars & Identity
-- ═══════════════════════════════════════════════════════════════════
-- Run this AFTER the main clients table exists.
-- Adds profile customization, avatar config, and identity fields.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Add profile columns to existing clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS avatar_style    TEXT DEFAULT 'geometric',
ADD COLUMN IF NOT EXISTS avatar_seed     TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS avatar_config   JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS avatar_url      TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS display_name    TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS bio             TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS tagline         TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS website         TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS location        TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS timezone        TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS social_links    JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS brand_colors    JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS logo_url        TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS cover_gradient  TEXT DEFAULT 'aurora',
ADD COLUMN IF NOT EXISTS theme_accent    TEXT DEFAULT '#64ffda',
ADD COLUMN IF NOT EXISTS profile_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_profile_update  TIMESTAMPTZ DEFAULT now();

-- 2. Profile activity log (tracks changes)
CREATE TABLE IF NOT EXISTS profile_activity (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    action      TEXT NOT NULL,            -- 'avatar_changed', 'bio_updated', etc.
    details     JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_activity_client 
    ON profile_activity(client_id, created_at DESC);

-- 3. Avatar presets table (shared gallery)
CREATE TABLE IF NOT EXISTS avatar_presets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    style       TEXT NOT NULL,
    config      JSONB NOT NULL DEFAULT '{}',
    preview_url TEXT DEFAULT '',
    is_premium  BOOLEAN DEFAULT false,
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- 4. Insert some default avatar presets
INSERT INTO avatar_presets (name, style, config, sort_order) VALUES
('Neon Orb',        'gradient',      '{"colors":["#64ffda","#00bcd4","#1a237e"],"shape":"circle","glow":true}', 1),
('Cyber Grid',      'geometric',     '{"pattern":"grid","colors":["#64ffda","#0a0f1c"],"complexity":8}', 2),
('Pixel Ghost',     'pixel',         '{"size":8,"palette":"cyberpunk","shape":"ghost"}', 3),
('Constellation',   'constellation', '{"stars":24,"color":"#64ffda","connections":true}', 4),
('Aurora Wave',     'gradient',      '{"colors":["#64ffda","#7c4dff","#ff4081"],"shape":"wave","animated":true}', 5),
('Diamond Mesh',    'geometric',     '{"pattern":"diamond","colors":["#00e5ff","#1de9b6"],"complexity":6}', 6),
('Retro Terminal',  'pixel',         '{"size":6,"palette":"terminal","shape":"face"}', 7),
('Nebula Core',     'gradient',      '{"colors":["#e040fb","#7c4dff","#304ffe"],"shape":"nebula","glow":true}', 8),
('Hex Matrix',      'geometric',     '{"pattern":"hex","colors":["#64ffda","#263238"],"complexity":10}', 9),
('Star Map',        'constellation', '{"stars":40,"color":"#ffd740","connections":true}', 10)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- Done! Profile system ready.
-- ═══════════════════════════════════════════════════════════════════
