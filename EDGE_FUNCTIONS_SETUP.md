# Edge Functions Secrets and Deploy Runbook

Last updated: 2026-03-17

## 1) Prerequisites

- Supabase CLI installed and logged in.
- Project is linked: `supabase link --project-ref <PROJECT_REF>`
- You have a secure local `.env` source for secrets (never commit real values).
- Apply DB migration for explicit client roles: `DATABASE_CLIENT_ROLE_HARDENING.sql`.

## 2) Required Secrets

Set these once per environment (prod/staging):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `SESSION_TOKEN_SECRET`
- `ALLOWED_ORIGINS`
- `MAGIC_LINK_BASE_URL`
- `MAGIC_LINK_ALLOWED_REDIRECTS`
- `MAGIC_LINK_TOKEN_TTL_SECONDS`
- `MAGIC_LINK_RATE_LIMIT_WINDOW_SECONDS`
- `MAGIC_LINK_RATE_LIMIT_MAX`
- `RESEND_API_KEY` (or your chosen provider key)
- `MAIL_FROM`

Optional but recommended:

- `APP_ENV` (`production` / `staging`)
- `LOG_LEVEL` (`info` / `warn` / `error`)

## 3) Set Secrets

Use CLI (repeat per secret):

```bash
supabase secrets set SUPABASE_URL="https://<project>.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
supabase secrets set SUPABASE_ANON_KEY="<anon-key>"
supabase secrets set SESSION_TOKEN_SECRET="<long-random-secret>"
supabase secrets set ALLOWED_ORIGINS="https://last-lumos.com,https://www.last-lumos.com,http://localhost:5173"
supabase secrets set MAGIC_LINK_BASE_URL="https://last-lumos.com"
supabase secrets set MAGIC_LINK_ALLOWED_REDIRECTS="https://last-lumos.com/client-profile,https://www.last-lumos.com/client-profile"
supabase secrets set MAGIC_LINK_TOKEN_TTL_SECONDS="900"
supabase secrets set MAGIC_LINK_RATE_LIMIT_WINDOW_SECONDS="300"
supabase secrets set MAGIC_LINK_RATE_LIMIT_MAX="5"
supabase secrets set RESEND_API_KEY="<provider-key>"
supabase secrets set MAIL_FROM="LUMOS <no-reply@last-lumos.com>"
```

Or set all at once from a local env file:

```bash
supabase secrets set --env-file .env.supabase
```

## 4) Deploy Edge Functions

Deploy only the functions used by current auth/admin migration:

```bash
supabase functions deploy send-magic-link
supabase functions deploy client-login
supabase functions deploy client-reset-password
supabase functions deploy admin-client-update
supabase functions deploy client-portal
supabase functions deploy admin-client-modal
supabase functions deploy admin-dashboard
supabase functions deploy profile-service
```

Deploy all functions:

```bash
supabase functions deploy --project-ref <PROJECT_REF>
```

## 5) Verify Deploy

Smoke-check endpoints after deploy (replace URL and token):

```bash
curl -i -X POST "https://<project>.functions.supabase.co/client-login" \
  -H "Authorization: Bearer <anon-or-service-token>" \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo"}'
```

Check function logs:

```bash
supabase functions logs --name client-login
supabase functions logs --name send-magic-link
```

## 6) Rotation Procedure (Critical)

If any key was exposed:

1. Rotate `SUPABASE_SERVICE_ROLE_KEY` in Supabase dashboard.
2. Rotate DB password for `DATABASE_URL`.
3. Rotate anon key if repository was public.
4. Update all function secrets with new values.
5. Redeploy functions.
6. Validate old leaked credentials are rejected.

## 7) Frontend Environment Reminder

Frontend should use only:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Do not expose service-role, admin keys, or DB credentials in frontend env files.
