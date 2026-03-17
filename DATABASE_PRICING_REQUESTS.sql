BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.pricing_requests (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	client_id uuid NULL REFERENCES public.clients(id) ON DELETE SET NULL,

	request_type text NOT NULL
		CHECK (request_type IN ('package', 'custom')),

	status text NOT NULL DEFAULT 'new'
		CHECK (status IN ('new', 'reviewing', 'approved', 'converted', 'rejected')),

	request_source text NOT NULL DEFAULT 'pricing_modal',

	package_id text NULL,
	package_name text NULL,

	selected_services jsonb NOT NULL DEFAULT '[]'::jsonb,

	estimated_subtotal numeric(12, 2) NOT NULL DEFAULT 0,
	estimated_total numeric(12, 2) NOT NULL DEFAULT 0,
	price_currency text NOT NULL DEFAULT 'EGP',

	guest_name text NULL,
	guest_phone text NULL,
	guest_email text NULL,
	company_name text NULL,

	client_snapshot jsonb NULL DEFAULT '{}'::jsonb,
	request_notes text NULL,
	admin_notes text NULL,

	converted_order_id uuid NULL,

	location_url text NULL,
	auto_collected_data jsonb NULL DEFAULT '{}'::jsonb,

	reviewed_at timestamptz NULL,
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pricing_requests_client_id
	ON public.pricing_requests (client_id);

CREATE INDEX IF NOT EXISTS idx_pricing_requests_status
	ON public.pricing_requests (status);

CREATE INDEX IF NOT EXISTS idx_pricing_requests_created_at
	ON public.pricing_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pricing_requests_request_type
	ON public.pricing_requests (request_type);

CREATE OR REPLACE FUNCTION public.set_pricing_requests_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pricing_requests_updated_at ON public.pricing_requests;

CREATE TRIGGER trg_pricing_requests_updated_at
BEFORE UPDATE ON public.pricing_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_pricing_requests_updated_at();

COMMIT;