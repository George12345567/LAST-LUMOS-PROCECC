-- ============================================
-- CREATIVE STUDIO DATABASE SCHEMA
-- ============================================
-- Database schema for the unified Creative Studio (Logo + App Builder)

-- ============================================
-- 1. PROJECTS TABLE
-- ============================================
-- Main table for all creative projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ownership
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    
    -- Project Info
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('logo', 'app', 'full')), -- 'full' means both logo + app
    industry TEXT, -- restaurant, cafe, salon, etc.
    
    -- Status & Visibility
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'review', 'approved', 'completed', 'archived')),
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Media
    thumbnail TEXT, -- Preview image URL
    
    -- Metadata
    tags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_edited_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Analytics
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON public.projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- ============================================
-- 2. LOGOS TABLE
-- ============================================
-- Stores logo designs from Logo Designer
CREATE TABLE IF NOT EXISTS public.logos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- Logo Configuration (from LogoDesigner component)
    config JSONB NOT NULL, -- Full LogoConfig object
    
    -- Logo Variants
    variants JSONB DEFAULT '{
        "light": null,
        "dark": null,
        "mono": null,
        "color": null
    }'::jsonb,
    
    -- Mockups (saved rendered images)
    mockups JSONB DEFAULT '{
        "canvas": null,
        "tshirt": null,
        "neon": null,
        "card": null,
        "web": null,
        "billboard": null,
        "packaging": null,
        "social": null
    }'::jsonb,
    
    -- Export URLs
    exports JSONB DEFAULT '{
        "png": null,
        "svg": null,
        "pdf": null,
        "eps": null
    }'::jsonb,
    
    -- Brand Guidelines
    brand_kit JSONB DEFAULT '{
        "colors": [],
        "fonts": [],
        "spacing": {},
        "usage_guidelines": ""
    }'::jsonb,
    
    -- Metadata
    is_final BOOLEAN DEFAULT FALSE,
    version_number INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_logos_project_id ON public.logos(project_id);
CREATE INDEX IF NOT EXISTS idx_logos_created_at ON public.logos(created_at DESC);

-- Unique constraint: one active logo per project (unless versioning)
CREATE UNIQUE INDEX IF NOT EXISTS idx_logos_project_final 
ON public.logos(project_id) 
WHERE is_final = true;

-- ============================================
-- 3. APP_DESIGNS TABLE
-- ============================================
-- Stores app designs from Live Preview Tool / App Builder
CREATE TABLE IF NOT EXISTS public.app_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- Business Info
    business_name TEXT NOT NULL,
    service_type TEXT NOT NULL, -- restaurant, cafe, salon, etc.
    
    -- Pages Configuration (multi-page support)
    pages JSONB NOT NULL DEFAULT '[
        {
            "id": "home",
            "name": "Home",
            "type": "landing",
            "content": {}
        }
    ]'::jsonb,
    
    -- Theme Configuration
    theme JSONB NOT NULL DEFAULT '{
        "id": "default",
        "name": "Default",
        "colors": {
            "primary": "#00bcd4",
            "accent": "#00bcd4",
            "background": "#ffffff"
        },
        "typography": {
            "fontFamily": "Poppins",
            "fontSize": 1,
            "fontWeight": 400
        },
        "spacing": {
            "padding": 16,
            "margin": 8,
            "borderRadius": 12
        }
    }'::jsonb,
    
    -- Items/Products/Services
    items JSONB DEFAULT '[]'::jsonb,
    
    -- App Settings
    settings JSONB DEFAULT '{
        "language": "ar",
        "rtl": true,
        "darkMode": false,
        "showRatings": true,
        "showSearch": true,
        "enableAnimations": true,
        "animationSpeed": "normal"
    }'::jsonb,
    
    -- Features Configuration
    features JSONB DEFAULT '{
        "cart": true,
        "favorites": true,
        "reviews": true,
        "notifications": true,
        "search": true,
        "filters": true,
        "socialShare": true,
        "chat": false,
        "booking": false,
        "payment": false
    }'::jsonb,
    
    -- Navigation Structure
    navigation JSONB DEFAULT '{
        "type": "bottom",
        "items": [
            {"id": "home", "label": "الرئيسية", "icon": "Home"},
            {"id": "menu", "label": "القائمة", "icon": "ShoppingCart"},
            {"id": "profile", "label": "حسابي", "icon": "User"}
        ]
    }'::jsonb,
    
    -- SEO Data
    seo JSONB DEFAULT '{
        "title": "",
        "description": "",
        "keywords": []
    }'::jsonb,
    
    -- Export Configurations
    exports JSONB DEFAULT '{
        "pwa": null,
        "reactNative": null,
        "flutter": null,
        "html": null
    }'::jsonb,
    
    -- Metadata
    is_final BOOLEAN DEFAULT FALSE,
    version_number INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_app_designs_project_id ON public.app_designs(project_id);
CREATE INDEX IF NOT EXISTS idx_app_designs_service_type ON public.app_designs(service_type);
CREATE INDEX IF NOT EXISTS idx_app_designs_created_at ON public.app_designs(created_at DESC);

-- Unique constraint: one active app design per project
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_designs_project_final 
ON public.app_designs(project_id) 
WHERE is_final = true;

-- ============================================
-- 4. TEMPLATES TABLE
-- ============================================
-- Stores reusable templates for logos and apps
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template Info
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('logo', 'app', 'full')),
    category TEXT, -- tech, nature, modern, luxury, restaurant, cafe, etc.
    industry TEXT[],
    
    -- Template Data
    config JSONB NOT NULL, -- Full configuration for logo or app
    preview_url TEXT, -- Preview image
    
    -- Pricing & Visibility
    is_premium BOOLEAN DEFAULT FALSE,
    price DECIMAL(10, 2) DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Author
    created_by UUID REFERENCES auth.users(id),
    is_official BOOLEAN DEFAULT FALSE, -- Created by platform
    
    -- Analytics
    downloads INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    
    -- Tags
    tags TEXT[],
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_templates_type ON public.templates(type);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_premium ON public.templates(is_premium);
CREATE INDEX IF NOT EXISTS idx_templates_downloads ON public.templates(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_templates_rating ON public.templates(rating DESC);

-- ============================================
-- 5. ASSETS TABLE (Enhanced)
-- ============================================
-- Stores all media assets (images, icons, files)
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ownership
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- File Info
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- image, icon, video, document, etc.
    mime_type TEXT,
    file_url TEXT NOT NULL,
    file_size INTEGER, -- in bytes
    
    -- Image-specific
    width INTEGER,
    height INTEGER,
    format TEXT, -- jpg, png, svg, etc.
    
    -- Organization
    folder TEXT, -- virtual folder path
    tags TEXT[],
    
    -- Usage Tracking
    used_in JSONB DEFAULT '[]'::jsonb, -- Array of project IDs where this asset is used
    usage_count INTEGER DEFAULT 0,
    
    -- Metadata
    alt_text TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_project_id ON public.assets(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_file_type ON public.assets(file_type);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON public.assets(created_at DESC);

-- ============================================
-- 6. PROJECT_VERSIONS TABLE
-- ============================================
-- Stores version history for projects
CREATE TABLE IF NOT EXISTS public.project_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- Version Info
    version_number INTEGER NOT NULL,
    version_name TEXT,
    notes TEXT,
    
    -- Snapshot (full state)
    snapshot JSONB NOT NULL, -- Contains full project state including logo + app
    
    -- Changes Summary
    changes JSONB DEFAULT '{
        "logo": false,
        "app": false,
        "settings": false
    }'::jsonb,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    is_auto_save BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON public.project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_versions_created_at ON public.project_versions(created_at DESC);

-- Unique constraint for version numbers per project
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_versions_unique 
ON public.project_versions(project_id, version_number);

-- ============================================
-- 7. PROJECT_COLLABORATORS TABLE
-- ============================================
-- Manages team collaboration on projects
CREATE TABLE IF NOT EXISTS public.project_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Role & Permissions
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer', 'commenter')),
    permissions JSONB DEFAULT '{
        "edit": false,
        "comment": true,
        "export": false,
        "delete": false,
        "invite": false
    }'::jsonb,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
    invited_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    last_active_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON public.project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON public.project_collaborators(user_id);

-- Unique constraint: one role per user per project
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_collaborators_unique 
ON public.project_collaborators(project_id, user_id);

-- ============================================
-- 8. PROJECT_COMMENTS TABLE
-- ============================================
-- Comments and feedback on projects
CREATE TABLE IF NOT EXISTS public.project_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- Comment Info
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    
    -- Location (where in the project)
    target_type TEXT CHECK (target_type IN ('logo', 'app', 'page', 'general')),
    target_id TEXT, -- ID of specific element being commented on
    coordinates JSONB, -- x, y coordinates for precise commenting
    
    -- Threading
    parent_id UUID REFERENCES public.project_comments(id) ON DELETE CASCADE,
    
    -- Status
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    
    -- Reactions
    reactions JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON public.project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_user_id ON public.project_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_parent_id ON public.project_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_created_at ON public.project_comments(created_at DESC);

-- ============================================
-- 9. BRAND_KITS TABLE
-- ============================================
-- Comprehensive brand identity packages
CREATE TABLE IF NOT EXISTS public.brand_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- Brand Name
    brand_name TEXT NOT NULL,
    tagline TEXT,
    
    -- Logo Variations
    logos JSONB NOT NULL DEFAULT '{
        "primary": null,
        "secondary": null,
        "icon": null,
        "wordmark": null,
        "light": null,
        "dark": null
    }'::jsonb,
    
    -- Color Palette
    colors JSONB NOT NULL DEFAULT '{
        "primary": [],
        "secondary": [],
        "neutrals": [],
        "gradients": []
    }'::jsonb,
    
    -- Typography
    typography JSONB NOT NULL DEFAULT '{
        "primary": {"family": "", "weights": [], "sizes": {}},
        "secondary": {"family": "", "weights": [], "sizes": {}},
        "scale": {}
    }'::jsonb,
    
    -- Spacing & Grid
    spacing JSONB DEFAULT '{
        "unit": 8,
        "scale": [8, 16, 24, 32, 40, 48, 64, 80],
        "grid": {"columns": 12, "gutter": 24}
    }'::jsonb,
    
    -- Usage Guidelines
    guidelines JSONB DEFAULT '{
        "logo_usage": "",
        "color_usage": "",
        "typography_usage": "",
        "dos": [],
        "donts": []
    }'::jsonb,
    
    -- Assets
    assets JSONB DEFAULT '{
        "icons": [],
        "patterns": [],
        "illustrations": []
    }'::jsonb,
    
    -- Export
    pdf_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brand_kits_project_id ON public.brand_kits(project_id);

-- ============================================
-- 10. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 11. RLS POLICIES
-- ============================================

-- === PROJECTS ===

-- Users can view their own projects and public projects
CREATE POLICY "Users can view own and public projects"
ON public.projects FOR SELECT
USING (
    user_id = auth.uid() 
    OR is_public = true
    OR client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    OR id IN (SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid())
);

-- Users can create projects
CREATE POLICY "Users can create projects"
ON public.projects FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
ON public.projects FOR UPDATE
USING (
    user_id = auth.uid()
    OR id IN (
        SELECT project_id FROM public.project_collaborators 
        WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
ON public.projects FOR DELETE
USING (user_id = auth.uid());

-- Admins can do everything
CREATE POLICY "Admins can manage all projects"
ON public.projects FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
    )
);

-- === LOGOS ===

CREATE POLICY "Users can view logos of accessible projects"
ON public.logos FOR SELECT
USING (
    project_id IN (
        SELECT id FROM public.projects 
        WHERE user_id = auth.uid() OR is_public = true
    )
);

CREATE POLICY "Users can manage logos of own projects"
ON public.logos FOR ALL
USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
);

-- === APP_DESIGNS ===

CREATE POLICY "Users can view app designs of accessible projects"
ON public.app_designs FOR SELECT
USING (
    project_id IN (
        SELECT id FROM public.projects 
        WHERE user_id = auth.uid() OR is_public = true
    )
);

CREATE POLICY "Users can manage app designs of own projects"
ON public.app_designs FOR ALL
USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
);

-- === TEMPLATES ===

CREATE POLICY "Everyone can view public templates"
ON public.templates FOR SELECT
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates"
ON public.templates FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own templates"
ON public.templates FOR UPDATE
USING (created_by = auth.uid());

-- === ASSETS ===

CREATE POLICY "Users can view own assets"
ON public.assets FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can manage own assets"
ON public.assets FOR ALL
USING (user_id = auth.uid());

-- === PROJECT_VERSIONS ===

CREATE POLICY "Users can view versions of accessible projects"
ON public.project_versions FOR SELECT
USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create versions"
ON public.project_versions FOR INSERT
WITH CHECK (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
);

-- === PROJECT_COLLABORATORS ===

CREATE POLICY "Users can view collaborators of their projects"
ON public.project_collaborators FOR SELECT
USING (
    user_id = auth.uid() OR
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
);

CREATE POLICY "Project owners can manage collaborators"
ON public.project_collaborators FOR ALL
USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
);

-- === PROJECT_COMMENTS ===

CREATE POLICY "Users can view comments on accessible projects"
ON public.project_comments FOR SELECT
USING (
    project_id IN (
        SELECT id FROM public.projects 
        WHERE user_id = auth.uid() 
        OR id IN (SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Users can create comments"
ON public.project_comments FOR INSERT
WITH CHECK (
    project_id IN (
        SELECT id FROM public.projects 
        WHERE user_id = auth.uid() 
        OR id IN (SELECT project_id FROM public.project_collaborators WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Users can update own comments"
ON public.project_comments FOR UPDATE
USING (user_id = auth.uid());

-- === BRAND_KITS ===

CREATE POLICY "Users can view brand kits of accessible projects"
ON public.brand_kits FOR SELECT
USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid() OR is_public = true)
);

CREATE POLICY "Users can manage brand kits of own projects"
ON public.brand_kits FOR ALL
USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
);

-- ============================================
-- 12. TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_logos_updated_at
BEFORE UPDATE ON public.logos
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_app_designs_updated_at
BEFORE UPDATE ON public.app_designs
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_templates_updated_at
BEFORE UPDATE ON public.templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_brand_kits_updated_at
BEFORE UPDATE ON public.brand_kits
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update last_edited_at on project when logo or app is updated
CREATE OR REPLACE FUNCTION update_project_last_edited()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.projects 
    SET last_edited_at = NOW() 
    WHERE id = NEW.project_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_project_last_edited_on_logo_update
AFTER UPDATE ON public.logos
FOR EACH ROW EXECUTE FUNCTION update_project_last_edited();

CREATE TRIGGER set_project_last_edited_on_app_update
AFTER UPDATE ON public.app_designs
FOR EACH ROW EXECUTE FUNCTION update_project_last_edited();

-- ============================================
-- 13. VIEWS
-- ============================================

-- View for complete project details
CREATE OR REPLACE VIEW public.project_details AS
SELECT 
    p.*,
    l.config as logo_config,
    l.variants as logo_variants,
    a.business_name,
    a.service_type,
    a.theme as app_theme,
    COUNT(DISTINCT pv.id) as version_count,
    COUNT(DISTINCT pc.id) as collaborator_count,
    COUNT(DISTINCT pcom.id) as comment_count
FROM public.projects p
LEFT JOIN public.logos l ON p.id = l.project_id AND l.is_final = true
LEFT JOIN public.app_designs a ON p.id = a.project_id AND a.is_final = true
LEFT JOIN public.project_versions pv ON p.id = pv.project_id
LEFT JOIN public.project_collaborators pc ON p.id = pc.project_id
LEFT JOIN public.project_comments pcom ON p.id = pcom.project_id
GROUP BY p.id, l.id, a.id;

-- Grant access
GRANT SELECT ON public.project_details TO authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Create storage buckets for assets
-- 3. Test all policies
-- 4. Create initial templates
-- 5. Start building the Creative Studio frontend

