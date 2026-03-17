# Profile Redesign Roadmap

## Product Direction

The profile system should feel calm, premium, and globally competitive.
The experience target is not just a settings form. It should behave like a lightweight identity product inside the platform.

## Visual Direction

- Light-first palette with soft blue, cloud white, mint, and blush accents.
- Rounded surfaces, subtle shadows, quiet contrast, and minimal noise.
- Upload-first media UX instead of preset-only avatar selection.
- Fast comprehension on mobile before desktop density.

## UX Priorities

1. Real profile photo upload for client and admin.
2. Strong profile header with image, company identity, status, and completion health.
3. Clear sectioning for identity, media, colors, privacy, and account settings.
4. Autosave with explicit sync feedback.
5. Empty states, upload guidance, and helpful defaults.

## Build Phases

### Phase 1

- Upload real avatar images.
- Normalize cover gradients so admin and client render the same way.
- Refresh profile surfaces to a softer light UI.
- Keep existing data model working.

### Phase 2

- Add cover image upload.
- Add headline, public slug, visibility controls, and social links health.
- Add profile completion scoring from backend.
- Add public profile preview mode.

### Phase 3

- Add verification badges.
- Add portfolio block and featured work.
- Add team member profiles for agencies.
- Add media transformations and thumbnail metadata.

## Data Model Notes

- Keep core identity fields on `clients`.
- Store advanced media and future growth data in dedicated profile media tables.
- Use idempotent migrations and avoid breaking current profile queries.

## Current Implementation Delta

- Client profile now supports direct avatar uploads.
- Admin profile now supports direct avatar uploads.
- Cover gradients are normalized into real CSS gradients.
- Next recommended backend step is running `DATABASE_PROFILE_REDESIGN_UPGRADE.sql`.
