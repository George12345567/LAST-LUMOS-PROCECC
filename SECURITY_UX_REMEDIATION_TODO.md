# Security + UX + Logic Remediation TODO

Last updated: 2026-03-17

## P0 - Critical Security

- [x] Replace frontend `VITE_ADMIN_API_KEY` trust model with signed session-token auth.
- [x] Remove `x-admin-api-key` dependency from admin edge functions.
- [x] Enforce role-based authorization in edge functions (`admin` vs `client`).
- [x] Fix IDOR in `client-portal` by binding access to authenticated session token subject.
- [x] Stop admin detection via username (`GEORGE`) in frontend routing and move to role-based checks.
- [x] Reserve blocked usernames (`GEORGE`, `ADMIN`, etc.) at signup.

## P1 - Security Hardening

- [x] Restrict CORS via allow-list env instead of `*` (env-driven default origin).
- [x] Add signed session token issuance on login/security/magic-link verify.
- [x] Validate and enforce token expiry in protected edge functions.
- [x] Replace SHA-256 password hashing with Bcrypt and keep compatibility migration on login.

## P2 - Logic/Integrity

- [x] Fix missing `/admin/login` route (currently used by navigation).
- [x] Fix OTP verification update from `phone` to `phone_number`.
- [x] Keep pricing request status on edit (do not force `new`).
- [x] Remove fixed `EGP` currency writes in Pricing Modal submit flow.

## P3 - UX/UI Weaknesses

- [x] Surface validation errors in pricing step navigation (instead of silent no-op).
- [x] Reduce heavy dashboard full-refresh churn on realtime changes.
- [x] Ensure admin/client redirect logic uses role and remains consistent after magic-link login.

## Execution Log

- [x] Created remediation plan file.
- [x] Implemented critical auth/authorization fixes, core logic fixes, and primary UX fixes.
- [x] Remaining hardening baseline completed in this pass.
