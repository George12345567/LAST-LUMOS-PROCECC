-- DATABASE_PASSWORD_HASH_RPC.sql
-- Adds pgcrypto-backed RPC helpers for password hashing and verification.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.verify_password_hash(plain_password text, stored_hash text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN plain_password IS NULL OR stored_hash IS NULL OR stored_hash = '' THEN FALSE
    ELSE crypt(plain_password, stored_hash) = stored_hash
  END;
$$;

CREATE OR REPLACE FUNCTION public.make_password_hash(plain_password text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT crypt(plain_password, gen_salt('bf', 12));
$$;

REVOKE ALL ON FUNCTION public.verify_password_hash(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.make_password_hash(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.verify_password_hash(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.make_password_hash(text) TO service_role;
