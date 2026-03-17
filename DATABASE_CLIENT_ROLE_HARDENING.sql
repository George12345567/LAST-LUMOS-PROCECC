-- DATABASE_CLIENT_ROLE_HARDENING.sql
-- Adds explicit role-based authorization metadata for clients table.

ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS role text;

ALTER TABLE public.clients
ALTER COLUMN role SET DEFAULT 'client';

UPDATE public.clients
SET role = CASE
  WHEN upper(username) = 'GEORGE' THEN 'admin'
  ELSE 'client'
END
WHERE role IS NULL OR role = '';

ALTER TABLE public.clients
DROP CONSTRAINT IF EXISTS clients_role_check;

ALTER TABLE public.clients
ADD CONSTRAINT clients_role_check
CHECK (role IN ('admin', 'client'));

CREATE INDEX IF NOT EXISTS idx_clients_role ON public.clients (role);
