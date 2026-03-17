-- ============================================
-- LUMOS AUTH HARDENING + MAGIC LINKS (IDEMPOTENT)
-- ============================================
-- Purpose:
-- 1) Ensure clients table has all auth/session columns used by app logic.
-- 2) Create login_attempts table for security telemetry.
-- 3) Create magic_links table for passwordless login.
-- 4) Add indexes and safe cleanup helpers.
--
-- Run in Supabase SQL Editor.
-- Safe to re-run.

BEGIN;

-- Ensure UUID helper exists.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- --------------------------------------------
-- 1) CLIENTS TABLE AUTH COLUMNS
-- --------------------------------------------
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS login_attempts integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until timestamptz,
ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;

-- Keep attempts non-negative.
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'clients_login_attempts_non_negative'
	) THEN
		ALTER TABLE public.clients
			ADD CONSTRAINT clients_login_attempts_non_negative CHECK (login_attempts >= 0);
	END IF;
END $$;

-- Helpful lookup indexes.
CREATE INDEX IF NOT EXISTS idx_clients_username ON public.clients (username);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients (email);
CREATE INDEX IF NOT EXISTS idx_clients_locked_until ON public.clients (locked_until);

-- --------------------------------------------
-- 2) LOGIN ATTEMPTS TABLE
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.login_attempts (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	username text NOT NULL,
	success boolean NOT NULL,
	failure_reason text,
	user_agent text,
	device_info jsonb NOT NULL DEFAULT '{}'::jsonb,
	created_at timestamptz NOT NULL DEFAULT now()
);

-- Backward-compat for pre-existing login_attempts table variants.
ALTER TABLE public.login_attempts
ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS device_info jsonb NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS failure_reason text,
ADD COLUMN IF NOT EXISTS user_agent text,
ADD COLUMN IF NOT EXISTS success boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS username text;

CREATE INDEX IF NOT EXISTS idx_login_attempts_username_created
	ON public.login_attempts (username, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_login_attempts_success_created
	ON public.login_attempts (success, created_at DESC);

-- --------------------------------------------
-- 3) MAGIC LINKS TABLE
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.magic_links (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	token text NOT NULL,
	client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
	email text NOT NULL,
	expires_at timestamptz NOT NULL,
	is_used boolean NOT NULL DEFAULT false,
	used_at timestamptz,
	user_agent text,
	created_at timestamptz NOT NULL DEFAULT now(),
	CONSTRAINT magic_links_expires_after_created CHECK (expires_at > created_at)
);

-- Backward-compat for pre-existing magic_links table variants.
ALTER TABLE public.magic_links
ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS is_used boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS used_at timestamptz,
ADD COLUMN IF NOT EXISTS user_agent text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS expires_at timestamptz,
ADD COLUMN IF NOT EXISTS client_id uuid,
ADD COLUMN IF NOT EXISTS token text;

-- Fill essential values if nullable data exists from legacy rows.
UPDATE public.magic_links
SET created_at = now()
WHERE created_at IS NULL;

UPDATE public.magic_links
SET is_used = false
WHERE is_used IS NULL;

-- Keep foreign key in place if legacy table had no FK.
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'magic_links_client_id_fkey'
	) THEN
		ALTER TABLE public.magic_links
			ADD CONSTRAINT magic_links_client_id_fkey
			FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
	END IF;
END $$;

-- Ensure token uniqueness even with retries.
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM pg_constraint
		WHERE conname = 'magic_links_token_unique'
	) THEN
		ALTER TABLE public.magic_links
			ADD CONSTRAINT magic_links_token_unique UNIQUE (token);
	END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_magic_links_client_used
	ON public.magic_links (client_id, is_used, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_magic_links_expires_at
	ON public.magic_links (expires_at);

CREATE INDEX IF NOT EXISTS idx_magic_links_email
	ON public.magic_links (email);

-- --------------------------------------------
-- 4) AUTO MAINTENANCE HELPERS
-- --------------------------------------------
-- Purge expired/used links older than 30 days.
CREATE OR REPLACE FUNCTION public.cleanup_magic_links()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
	deleted_count integer;
BEGIN
	DELETE FROM public.magic_links
	WHERE expires_at < now()
		 OR (is_used = true AND created_at < now() - interval '30 days');

	GET DIAGNOSTICS deleted_count = ROW_COUNT;
	RETURN deleted_count;
END;
$$;

-- Optionally call manually:
-- SELECT public.cleanup_magic_links();

COMMIT;

-- ============================================
-- DONE
-- ============================================
