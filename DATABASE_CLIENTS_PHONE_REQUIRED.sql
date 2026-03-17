BEGIN;

ALTER TABLE public.clients
    ADD COLUMN IF NOT EXISTS phone_number text;

DO $$
DECLARE
    has_legacy_phone boolean;
    missing_phone_count bigint;
    invalid_phone_count bigint;
    missing_phone_examples text;
    invalid_phone_examples text;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'clients'
          AND column_name = 'phone'
    ) INTO has_legacy_phone;

    UPDATE public.clients
    SET phone_number = NULLIF(regexp_replace(phone_number, '\D', '', 'g'), '')
    WHERE phone_number IS NOT NULL;

    IF has_legacy_phone THEN
        EXECUTE $sql$
            UPDATE public.clients
            SET phone_number = NULLIF(regexp_replace(phone, '\D', '', 'g'), '')
            WHERE phone_number IS NULL
              AND phone IS NOT NULL
        $sql$;
    END IF;

    SELECT COUNT(*)
    INTO missing_phone_count
    FROM public.clients
    WHERE phone_number IS NULL;

    IF missing_phone_count > 0 THEN
        SELECT string_agg(
            format(
                'id=%s | username=%s | email=%s | company=%s',
                COALESCE(to_jsonb(c) ->> 'id', '?'),
                COALESCE(NULLIF(to_jsonb(c) ->> 'username', ''), '-'),
                COALESCE(NULLIF(to_jsonb(c) ->> 'email', ''), '-'),
                COALESCE(NULLIF(to_jsonb(c) ->> 'company_name', ''), COALESCE(NULLIF(to_jsonb(c) ->> 'display_name', ''), '-'))
            ),
            E'\n'
        )
        INTO missing_phone_examples
        FROM (
            SELECT *
            FROM public.clients
            WHERE phone_number IS NULL
            ORDER BY created_at NULLS LAST, id
            LIMIT 10
        ) AS c;

        RAISE EXCEPTION 'Cannot enforce required phone_number: % existing client rows still have no phone number.', missing_phone_count
            USING DETAIL = COALESCE(missing_phone_examples, 'No sample rows available.'),
                  HINT = 'Update phone_number for the listed client rows, then rerun this migration.';
    END IF;

    SELECT COUNT(*)
    INTO invalid_phone_count
    FROM public.clients
    WHERE length(phone_number) < 8 OR length(phone_number) > 15;

    IF invalid_phone_count > 0 THEN
        SELECT string_agg(
            format(
                'id=%s | phone_number=%s | username=%s | email=%s',
                COALESCE(to_jsonb(c) ->> 'id', '?'),
                COALESCE(NULLIF(to_jsonb(c) ->> 'phone_number', ''), '-'),
                COALESCE(NULLIF(to_jsonb(c) ->> 'username', ''), '-'),
                COALESCE(NULLIF(to_jsonb(c) ->> 'email', ''), '-')
            ),
            E'\n'
        )
        INTO invalid_phone_examples
        FROM (
            SELECT *
            FROM public.clients
            WHERE length(phone_number) < 8 OR length(phone_number) > 15
            ORDER BY created_at NULLS LAST, id
            LIMIT 10
        ) AS c;

        RAISE EXCEPTION 'Cannot enforce required phone_number: % existing client rows have invalid phone length.', invalid_phone_count
            USING DETAIL = COALESCE(invalid_phone_examples, 'No sample rows available.'),
                  HINT = 'Normalize or replace the listed phone_number values so each one contains 8 to 15 digits.';
    END IF;

    BEGIN
        ALTER TABLE public.clients
            DROP CONSTRAINT IF EXISTS clients_phone_number_required_length_check,
            ADD CONSTRAINT clients_phone_number_required_length_check
            CHECK (phone_number ~ '^[0-9]{8,15}$');
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    ALTER TABLE public.clients
        ALTER COLUMN phone_number SET NOT NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_clients_phone_number
    ON public.clients (phone_number)
    WHERE phone_number IS NOT NULL;

COMMIT;