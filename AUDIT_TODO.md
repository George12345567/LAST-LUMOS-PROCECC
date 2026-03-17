# Project Audit TODO

Last updated: 2026-03-17

## P0 - Critical Security (fix first)

- [ ] Remove service-role client usage from frontend runtime.
  - [ ] Replace all `supabaseAdmin` usage in frontend with server-side endpoints (Supabase Edge Functions or backend API).
  - [ ] Keep service key only in server/edge secrets.
  - [x] Disable service-role usage in frontend runtime (force anon client in `src/lib/supabaseAdmin.js`).
  - [x] Added Edge Function for secure login flow (`supabase/functions/client-login/index.ts`) and wired `authService.login` + `authService.verifySecurity` to it.
  - [x] Added Edge Function for secure password reset (`supabase/functions/client-reset-password/index.ts`) and wired reset step in `src/pages/ForgotPassword.tsx`.
  - [x] Added Edge Function for admin client CRUD (`supabase/functions/admin-client-update/index.ts`) and wired `addClient/deleteClient/updateClient` in `src/hooks/useAdminDashboard.ts`.
  - [x] Added `client-portal` edge snapshot/actions and migrated core `ClientProfile` data flows to service calls (`src/services/clientPortalService.ts`).
  - [x] Added `admin-client-modal` edge snapshot/actions and migrated `ClientMasterModal` CRUD/chat/upload flows to service calls (`src/services/adminClientModalService.ts`).
  - [x] Migrated `useAdminDashboard` reads/writes to `admin-dashboard` edge service (`src/services/adminDashboardService.ts`).
  - [x] Migrated `ClientSheet` reads/writes to admin modal edge service snapshot/actions.
  - [x] Removed direct `supabaseAdmin` access from auth/profile services by wiring edge-backed actions:
    - `src/services/authService.ts`
    - `src/services/profileService.ts`
  - [x] Removed all frontend `supabaseAdmin` imports/usages from `src/**` (remaining reference is compatibility export in `src/lib/supabaseAdmin.js`).
  - Affected files (imports):
    - `src/hooks/useAdminDashboard.ts`
    - `src/pages/ClientProfile.tsx`
    - `src/pages/ClientSignUp.tsx`
    - `src/pages/ForgotPassword.tsx`
    - `src/pages/Dashboard.tsx`
    - `src/pages/AdminProfile.tsx`
    - `src/components/pricing/PricingModal.tsx`
    - `src/components/admin/ClientSheet.tsx`
    - `src/components/admin/ClientMasterModal.tsx`
    - `src/services/profileService.ts`
    - `src/services/pricingRequestService.ts`
    - `src/services/authService.ts`
    - `src/services/db.js`

- [ ] Rotate exposed secrets immediately.
  - [ ] Rotate `VITE_SUPABASE_SERVICE_KEY`.
  - [ ] Rotate DB password in `DATABASE_URL`.
  - [ ] Rotate anon key if repo was shared publicly.
  - [ ] Revoke old keys and verify no old token works.
  - Exposed locations:
    - `.env`
    - `src/lib/supabaseClient.js`
    - `test-supabase-connection.js`
  - [x] Added secrets/deploy runbook: `EDGE_FUNCTIONS_SETUP.md`.

- [x] Remove hardcoded Supabase credentials from source code.
  - [x] Replace hardcoded URL/key in `src/lib/supabaseClient.js` with `import.meta.env`.
  - [x] Update `test-supabase-connection.js` to read from env or delete the file.

- [ ] Replace plaintext auth storage and comparison.
  - [x] Stop storing `password` as plaintext in `clients` table.
  - [ ] Store only salted hashes (Argon2id/Bcrypt).
  - [x] Hash and compare `security_answer` securely.
  - [x] Migrate existing records to hashed fields (lazy migration on successful login/security verification).
  - Affected logic:
    - `src/services/authService.ts` (`login`, `verifySecurity`)
    - `src/pages/ClientSignUp.tsx` (insert password/security_answer)
    - `src/pages/ForgotPassword.tsx` (security verify + password reset)

- [ ] Replace insecure mailto-based magic link flow.
  - [x] Send real email via server-side provider.
  - [x] Add single-use, short TTL, rate-limit, and IP/device logging.
  - [x] Validate redirect allow-list.
  - Affected logic:
    - `src/services/authService.ts` (`requestMagicLink`, `verifyMagicLink`)

## P1 - Lint Errors (blocking quality)

Current status from `npm run lint`: 0 issues (0 errors, 0 warnings).

- [x] Fix `@typescript-eslint/no-unused-expressions`.
  - `src/components/admin/ClientMasterModal.tsx`

- [x] Fix `@typescript-eslint/no-empty-object-type`.
  - `src/components/ui/command.tsx`
  - `src/components/ui/textarea.tsx`

- [x] Fix `no-empty`.
  - `src/pages/MobileDemoPage.tsx`

- [x] Fix `@typescript-eslint/no-require-imports`.
  - `tailwind.config.ts`

- [x] Fix all `no-useless-escape` regex issues.
  - `src/components/pricing/PricingModal.tsx`
  - `src/components/shared/VerifiedPhoneInput.tsx`
  - `src/features/contact/EnhancedContact.tsx`
  - `src/pages/ClientSignUp.tsx`
  - `supabase/functions/send-otp/index.ts`
  - `supabase/functions/verify-otp/index.ts`

- [x] Fix all `@typescript-eslint/no-explicit-any`.
  - `src/lib/logger.ts`
  - `src/types/dashboard.ts`
  - `src/pages/AdminProfile.tsx`
  - `src/services/discountService.ts`
  - `src/lib/collectBrowserData.ts`
  - `src/components/shared/VerifiedPhoneInput.tsx`
  - `src/components/pricing/PricingModal.tsx`

- [x] Fix hook dependency warnings (`react-hooks/exhaustive-deps`).
  - `src/components/admin/ClientMasterModal.tsx`
  - `src/components/layout/EnhancedNavbar.tsx`
  - `src/features/hero/TypewriterHero.tsx`
  - `src/features/live-preview/LivePreviewTool.tsx`
  - `src/pages/MobileDemoPage.tsx`

- [x] Fix fast-refresh warnings (`react-refresh/only-export-components`) where needed.
  - Files under `src/components/ui/*` and context files reported by lint.

## P2 - Architecture / Maintainability

Project guideline requires max 500 lines per file (`CODING_GUIDELINES.md`).

- [ ] Refactor oversized files above 500 lines.
  - `src/pages/ClientProfile.tsx` (2874)
  - `src/components/pricing/PricingModal.tsx` (1786)
  - `src/features/live-preview/LivePreviewTool.tsx` (1565)
  - `src/components/admin/ClientSheet.tsx` (1008)
  - `src/pages/ClientSignUp.tsx` (959)
  - `src/features/live-preview/templates/Template1Screen.tsx` (953)
  - `src/pages/Dashboard.tsx` (941)
  - `src/components/admin/ClientMasterModal.tsx` (767)
  - `src/components/layout/EnhancedNavbar.tsx` (743)
  - `src/features/live-preview/components/studio/BrandTab.tsx` (704)
  - `src/pages/ClientLogin.tsx` (669)
  - `src/pages/MobileDemoPage.tsx` (641)
  - `src/pages/ForgotPassword.tsx` (636)
  - `src/pages/AdminProfile.tsx` (610)
  - `src/data/homeAiPricingTraining.ts` (606)
  - [x] Initial decomposition started:
    - [x] Extracted `ClientProfile` constants/tabs to `src/pages/client-profile/constants.ts`
    - [x] Extracted `PricingModal` helpers to `src/components/pricing/pricingHelpers.tsx`
    - [x] Extracted edge service wrappers for heavy admin/client views:
      - `src/services/clientPortalService.ts`
      - `src/services/adminClientModalService.ts`
    - [x] Extracted `ClientSheet` data/state/actions into dedicated hook:
      - `src/components/admin/client-sheet/useClientSheetData.ts`

- [ ] Extract repeated logic into hooks/services.
  - Auth/session helpers
  - Supabase query wrappers
  - Form validation schemas

- [ ] Add stronger type contracts for dashboard/client data models.

## P3 - Hardening and Validation

- [ ] Add security tests for login, lockout, recovery, magic-link replay, and rate limits.
- [ ] Add integration tests for edge functions handling privileged operations.
- [ ] Add CI gates:
  - [ ] `npm run lint` must pass
  - [ ] type-check must pass
  - [ ] unit/integration tests must pass
- [ ] Add pre-commit secret scanning (gitleaks/trufflehog) and block leaked keys.
- [ ] Add runtime monitoring for auth failures and suspicious admin access patterns.

## Definition of Done

- [ ] No service-role key in frontend bundle/runtime.
- [ ] No plaintext password/security answer anywhere.
- [ ] No exposed secrets in repo history or current files.
- [x] `npm run lint` returns 0 errors and 0 warnings.
- [ ] Files follow size rule or have approved exceptions.
