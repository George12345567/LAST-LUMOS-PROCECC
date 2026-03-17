-- DATABASE_PROFILE_REDESIGN_UPGRADE.sql
-- Advanced profile upgrade for calm, modern, media-rich profiles.
-- Safe to run multiple times.

BEGIN;

ALTER TABLE public.clients
    ADD COLUMN IF NOT EXISTS headline text,
    ADD COLUMN IF NOT EXISTS cover_image_url text,
    ADD COLUMN IF NOT EXISTS avatar_alt_text text,
    ADD COLUMN IF NOT EXISTS public_slug text,
    ADD COLUMN IF NOT EXISTS profile_theme jsonb DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS avatar_crop jsonb DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS cover_crop jsonb DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS profile_completion_score integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS profile_last_media_update timestamptz,
    ADD COLUMN IF NOT EXISTS verified_email boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS verified_phone boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS profile_visibility text DEFAULT 'private',
    ADD COLUMN IF NOT EXISTS profile_sections jsonb DEFAULT '[]'::jsonb;

UPDATE public.clients
SET profile_visibility = CASE
        WHEN profile_visibility IN ('private', 'team', 'public') THEN profile_visibility
        ELSE 'private'
    END,
    profile_completion_score = GREATEST(0, LEAST(COALESCE(profile_completion_score, 0), 100)),
    profile_theme = COALESCE(profile_theme, '{}'::jsonb),
    avatar_crop = COALESCE(avatar_crop, '{}'::jsonb),
    cover_crop = COALESCE(cover_crop, '{}'::jsonb),
    profile_sections = COALESCE(profile_sections, '[]'::jsonb);

DO $$
BEGIN
    BEGIN
        ALTER TABLE public.clients
            DROP CONSTRAINT IF EXISTS clients_profile_visibility_check,
            ADD CONSTRAINT clients_profile_visibility_check
            CHECK (profile_visibility IN ('private', 'team', 'public'));
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE public.clients
            DROP CONSTRAINT IF EXISTS clients_profile_completion_score_check,
            ADD CONSTRAINT clients_profile_completion_score_check
            CHECK (profile_completion_score BETWEEN 0 AND 100);
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_clients_public_slug_ci
    ON public.clients (lower(public_slug))
    WHERE public_slug IS NOT NULL AND btrim(public_slug) <> '';

CREATE INDEX IF NOT EXISTS idx_clients_profile_visibility
    ON public.clients (profile_visibility);

CREATE INDEX IF NOT EXISTS idx_clients_profile_completion_score
    ON public.clients (profile_completion_score DESC);

CREATE TABLE IF NOT EXISTS public.profile_media (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    media_kind text NOT NULL,
    storage_path text,
    public_url text NOT NULL,
    mime_type text,
    file_size_bytes bigint,
    width integer,
    height integer,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE public.profile_media
            DROP CONSTRAINT IF EXISTS profile_media_media_kind_check,
            ADD CONSTRAINT profile_media_media_kind_check
            CHECK (media_kind IN ('avatar', 'cover', 'logo', 'gallery'));
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
END $$;

CREATE INDEX IF NOT EXISTS idx_profile_media_client_id
    ON public.profile_media (client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profile_media_kind
    ON public.profile_media (client_id, media_kind);

CREATE OR REPLACE FUNCTION public.touch_profile_media_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profile_media_touch_updated_at ON public.profile_media;

CREATE TRIGGER trg_profile_media_touch_updated_at
BEFORE UPDATE ON public.profile_media
FOR EACH ROW
EXECUTE FUNCTION public.touch_profile_media_updated_at();

COMMIT;