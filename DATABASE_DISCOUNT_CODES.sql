-- ============================================
-- DISCOUNT CODES TABLE FOR LUMOS AGENCY
-- ============================================

CREATE TABLE IF NOT EXISTS public.discount_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    max_uses INT, -- NULL means unlimited
    current_uses INT DEFAULT 0,
    valid_until TIMESTAMPTZ, -- NULL means it never expires
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Convert codes to uppercase automatically
CREATE OR REPLACE FUNCTION uppercase_discount_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.code = UPPER(NEW.code);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_uppercase_discount_code
BEFORE INSERT OR UPDATE ON public.discount_codes
FOR EACH ROW EXECUTE FUNCTION uppercase_discount_code();

-- Indexes for quick lookup
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON public.discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON public.discount_codes(is_active);

-- ============================================
-- RLS (Row Level Security) 
-- ============================================
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage discount codes"
ON public.discount_codes
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Anyone (public) can READ the discount code to validate it, but we only want to leak valid ones, 
-- or we can just let any authenticated user read them. To allow guests to validate, we allow select.
-- We only allow them to select active ones.
CREATE POLICY "Anyone can view active discount codes"
ON public.discount_codes
FOR SELECT
USING (is_active = true);

-- Insert dummy data for testing
INSERT INTO public.discount_codes (code, discount_type, discount_value)
VALUES ('WELCOME20', 'percentage', 20.00),
       ('LUMOS500', 'fixed', 500.00)
ON CONFLICT (code) DO NOTHING;
