-- DATABASE_ADMIN_PROFILE_CHAT_SYNC_FIX.sql
-- Purpose: keep admin dashboard features in sync with client profile features.
-- Safe to run multiple times.

BEGIN;

-- 1) Ensure chat table used by both admin and client portal exists and is complete.
CREATE TABLE IF NOT EXISTS public.client_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    sender text NOT NULL CHECK (sender IN ('client', 'admin')),
    message text NOT NULL,
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_messages
    ADD COLUMN IF NOT EXISTS message text,
    ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS sender text,
    ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- If sender exists but has no constraint, keep data and then enforce accepted values.
UPDATE public.client_messages
SET sender = 'client'
WHERE sender IS NULL;

UPDATE public.client_messages
SET is_read = false
WHERE is_read IS NULL;

UPDATE public.client_messages
SET created_at = now()
WHERE created_at IS NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'client_messages' AND column_name = 'sender'
    ) THEN
        BEGIN
            ALTER TABLE public.client_messages
                DROP CONSTRAINT IF EXISTS client_messages_sender_check,
                ADD CONSTRAINT client_messages_sender_check CHECK (sender IN ('client', 'admin'));
        EXCEPTION WHEN OTHERS THEN
            -- ignore if constraint already equivalent
            NULL;
        END;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_client_messages_client_id ON public.client_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_created_at ON public.client_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_messages_unread ON public.client_messages(client_id, is_read, sender);

-- 2) One-time migration from legacy table public.messages -> public.client_messages (if it exists).
DO $$
DECLARE
    has_message boolean;
    has_content boolean;
    has_sender boolean;
    has_is_read boolean;
    has_created_at boolean;
    message_expr text;
    sender_expr text;
    is_read_expr text;
    created_expr text;
    sql_stmt text;
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'messages'
    ) THEN
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'message'
        ) INTO has_message;

        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'content'
        ) INTO has_content;

        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'sender'
        ) INTO has_sender;

        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'is_read'
        ) INTO has_is_read;

        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'created_at'
        ) INTO has_created_at;

        IF has_message AND has_content THEN
            message_expr := 'COALESCE(m.message, m.content, '''')';
        ELSIF has_message THEN
            message_expr := 'COALESCE(m.message, '''')';
        ELSIF has_content THEN
            message_expr := 'COALESCE(m.content, '''')';
        ELSE
            message_expr := '''''';
        END IF;

        IF has_sender THEN
            sender_expr := 'CASE WHEN m.sender IN (''client'', ''admin'') THEN m.sender ELSE ''client'' END';
        ELSE
            sender_expr := '''client''';
        END IF;

        IF has_is_read THEN
            is_read_expr := 'COALESCE(m.is_read, false)';
        ELSE
            is_read_expr := 'false';
        END IF;

        IF has_created_at THEN
            created_expr := 'COALESCE(m.created_at, now())';
        ELSE
            created_expr := 'now()';
        END IF;

        sql_stmt := format(
            'INSERT INTO public.client_messages (client_id, sender, message, is_read, created_at)
             SELECT
                 m.client_id,
                 %1$s,
                 %2$s,
                 %3$s,
                 %4$s
             FROM public.messages m
             WHERE m.client_id IS NOT NULL
               AND %2$s <> ''''
               AND NOT EXISTS (
                    SELECT 1
                    FROM public.client_messages cm
                    WHERE cm.client_id = m.client_id
                      AND cm.sender = %1$s
                      AND cm.message = %2$s
                )',
            sender_expr,
            message_expr,
            is_read_expr,
            created_expr
        );

        EXECUTE sql_stmt;
    END IF;
END $$;

-- 3) Ensure brand/profile columns used by client profile and admin editor are present.
ALTER TABLE public.clients
    ADD COLUMN IF NOT EXISTS logo_url text,
    ADD COLUMN IF NOT EXISTS brand_colors jsonb DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS theme_accent text DEFAULT '#6366f1',
    ADD COLUMN IF NOT EXISTS primary_color text,
    ADD COLUMN IF NOT EXISTS secondary_color text,
    ADD COLUMN IF NOT EXISTS display_name text,
    ADD COLUMN IF NOT EXISTS bio text,
    ADD COLUMN IF NOT EXISTS tagline text,
    ADD COLUMN IF NOT EXISTS website text,
    ADD COLUMN IF NOT EXISTS last_profile_update timestamptz;

-- 4) Backfill old/new color fields so features appear consistently in both admin and client profile.
UPDATE public.clients
SET
    theme_accent = COALESCE(theme_accent, primary_color, '#6366f1'),
    brand_colors = CASE
        WHEN jsonb_typeof(brand_colors) = 'array' AND jsonb_array_length(brand_colors) > 0 THEN brand_colors
        WHEN primary_color IS NOT NULL AND secondary_color IS NOT NULL THEN jsonb_build_array(primary_color, secondary_color)
        WHEN primary_color IS NOT NULL THEN jsonb_build_array(primary_color)
        ELSE COALESCE(brand_colors, '[]'::jsonb)
    END,
    primary_color = COALESCE(primary_color, theme_accent),
    secondary_color = COALESCE(
        secondary_color,
        CASE
            WHEN jsonb_typeof(brand_colors) = 'array' AND jsonb_array_length(brand_colors) > 1 THEN brand_colors->>1
            ELSE secondary_color
        END
    );

-- 5) Enforce unique identity fields to prevent duplicate accounts.
-- Note: clients.id is already unique by PRIMARY KEY from table design.
DO $$
DECLARE
    has_username boolean;
    has_email boolean;
    has_phone boolean;
    has_phone_number boolean;
    dup_count bigint;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'username'
    ) INTO has_username;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'email'
    ) INTO has_email;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'phone'
    ) INTO has_phone;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'phone_number'
    ) INTO has_phone_number;

    -- Normalize before uniqueness checks.
    IF has_username THEN
        EXECUTE 'UPDATE public.clients SET username = NULLIF(trim(username), '''') WHERE username IS NOT NULL';
    END IF;

    IF has_email THEN
        EXECUTE 'UPDATE public.clients SET email = NULLIF(lower(trim(email)), '''') WHERE email IS NOT NULL';
    END IF;

    IF has_phone THEN
        EXECUTE 'UPDATE public.clients
                 SET phone = NULLIF(regexp_replace(phone, ''\D'', '''', ''g''), '''')
                 WHERE phone IS NOT NULL';
    END IF;

    IF has_phone_number THEN
        EXECUTE 'UPDATE public.clients
                 SET phone_number = NULLIF(regexp_replace(phone_number, ''\D'', '''', ''g''), '''')
                 WHERE phone_number IS NOT NULL';
    END IF;

        -- Auto-resolve duplicate phone values by keeping one row and nulling the rest.
        IF has_phone THEN
                EXECUTE 'WITH ranked AS (
                                        SELECT ctid,
                                                     row_number() OVER (PARTITION BY phone ORDER BY id) AS rn
                                        FROM public.clients
                                        WHERE phone IS NOT NULL
                                 )
                                 UPDATE public.clients c
                                 SET phone = NULL
                                 FROM ranked r
                                 WHERE c.ctid = r.ctid
                                     AND r.rn > 1';
        END IF;

        -- Auto-resolve duplicate phone_number values by keeping one row and nulling the rest.
        IF has_phone_number THEN
                EXECUTE 'WITH ranked AS (
                                        SELECT ctid,
                                                     row_number() OVER (PARTITION BY phone_number ORDER BY id) AS rn
                                        FROM public.clients
                                        WHERE phone_number IS NOT NULL
                                 )
                                 UPDATE public.clients c
                                 SET phone_number = NULL
                                 FROM ranked r
                                 WHERE c.ctid = r.ctid
                                     AND r.rn > 1';
        END IF;

    -- Stop migration with a clear error if duplicates already exist.
    IF has_username THEN
        EXECUTE 'SELECT COUNT(*) FROM (
                    SELECT lower(username)
                    FROM public.clients
                    WHERE username IS NOT NULL
                    GROUP BY lower(username)
                    HAVING COUNT(*) > 1
                 ) d'
        INTO dup_count;

        IF dup_count > 0 THEN
            RAISE EXCEPTION 'Duplicate usernames found in public.clients. Resolve duplicates before applying unique constraints.';
        END IF;
    END IF;

    IF has_email THEN
        EXECUTE 'SELECT COUNT(*) FROM (
                    SELECT lower(email)
                    FROM public.clients
                    WHERE email IS NOT NULL
                    GROUP BY lower(email)
                    HAVING COUNT(*) > 1
                 ) d'
        INTO dup_count;

        IF dup_count > 0 THEN
            RAISE EXCEPTION 'Duplicate emails found in public.clients. Resolve duplicates before applying unique constraints.';
        END IF;
    END IF;

    IF has_phone THEN
        EXECUTE 'SELECT COUNT(*) FROM (
                    SELECT phone
                    FROM public.clients
                    WHERE phone IS NOT NULL
                    GROUP BY phone
                    HAVING COUNT(*) > 1
                 ) d'
        INTO dup_count;

        IF dup_count > 0 THEN
            RAISE EXCEPTION 'Duplicate phone values found in public.clients. Resolve duplicates before applying unique constraints.';
        END IF;
    END IF;

    IF has_phone_number THEN
        EXECUTE 'SELECT COUNT(*) FROM (
                    SELECT phone_number
                    FROM public.clients
                    WHERE phone_number IS NOT NULL
                    GROUP BY phone_number
                    HAVING COUNT(*) > 1
                 ) d'
        INTO dup_count;

        IF dup_count > 0 THEN
            RAISE EXCEPTION 'Duplicate phone_number values found in public.clients. Resolve duplicates before applying unique constraints.';
        END IF;
    END IF;

    -- Create unique indexes (case-insensitive where relevant).
    IF has_username THEN
        EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uq_clients_username_ci ON public.clients (lower(username)) WHERE username IS NOT NULL';
    END IF;

    IF has_email THEN
        EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uq_clients_email_ci ON public.clients (lower(email)) WHERE email IS NOT NULL';
    END IF;

    IF has_phone THEN
        EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uq_clients_phone ON public.clients (phone) WHERE phone IS NOT NULL';
    END IF;

    IF has_phone_number THEN
        EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uq_clients_phone_number ON public.clients (phone_number) WHERE phone_number IS NOT NULL';
    END IF;
END $$;

-- Optional: ensure magic link token uniqueness as well.
CREATE UNIQUE INDEX IF NOT EXISTS uq_magic_links_token ON public.magic_links(token);

COMMIT;
