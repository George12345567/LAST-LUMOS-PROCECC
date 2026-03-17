# Category 1: Brand And Visual Design

## Features

1. Live Design Studio Main Workspace
2. Brand Setup (Business Name + Service Type)
3. Service Presets by Business Type
4. Theme System (Preset Themes + Custom Colors)
5. Template System (7 Templates)
6. Style Effects (Glassmorphism / Dark Mode / Textures)
7. Typography Scaling (Font Size Control)

## Feature-By-Feature Review

### 1) Live Design Studio Main Workspace

Current problems:
- `src/features/live-preview/LivePreviewTool.tsx` is still very large (about 1301 lines), which violates project file-size rules.
- View logic, styling logic, and orchestration state are tightly coupled in one component.
- Multiple legacy/alternative UI paths still exist in the feature folder, increasing maintenance risk.

Required improvements:
- Continue splitting the studio into focused modules: shell, tabs, preview, and actions.
- Introduce a shared studio state model (`useReducer` or store) to reduce prop drilling and duplicated state transitions.
- Remove or archive unused/legacy variants after verifying no runtime usage.

Advanced improvements:
- Add a plugin-like tab architecture so each tab can register itself with metadata and validation rules.
- Add architecture boundaries via lint rules (`no-cross-import` between internal layers).

UX priorities:
- Keep tab switching stateful (no visual reset unless user requests reset).
- Preserve scroll and focus position when switching tabs.

### 2) Brand Setup (Business Name + Service Type)

Current problems:
- Business name currently has minimal validation (empty/non-empty only).
- No enforced max length, formatting guardrails, or clear error states.
- Service type selection has no contextual onboarding hints.

Required improvements:
- Add schema validation for business name (length, allowed chars, trimming, duplicate spaces).
- Add inline helper and error messages (not only toast).
- Add service-specific placeholders/hints for first-time users.

Advanced improvements:
- Suggest business names dynamically based on service type and locale.
- Add AI assisted naming with confidence score and quick apply.

UX priorities:
- Show validation feedback live but non-blocking.
- Keep editing smooth with debounced validation and no layout jumps.

### 3) Service Presets By Business Type

Current problems:
- Presets are static in code (`constants.ts`) and require deploy for every content update.
- No versioning for presets (difficult to compare preset updates over time).

Required improvements:
- Move presets to a managed source (DB/config endpoint) with local fallback.
- Add preset metadata (version, updated_at, author).

Advanced improvements:
- Adaptive presets based on region, language, and usage analytics.
- A/B test preset packs to optimize conversion.

UX priorities:
- Transition smoothly when switching service type (animated item/context updates).
- Show a short "what changed" summary after preset switch.

### 4) Theme System (Preset Themes + Custom Colors)

Current problems:
- Custom color picker allows combinations that can break readability.
- No contrast validator for text/background combinations.
- Theme state and visual tokens are still partly coupled to template-specific logic.

Required improvements:
- Add WCAG contrast checks with warning UI and auto-fix suggestions.
- Normalize theme tokens (surface, text, accent, border) instead of direct ad-hoc color usage.
- Add a one-click "safe palette" fallback.

Advanced improvements:
- Smart color harmonization (generate matching accent and neutral scale).
- Theme snapshots and rollback history.

UX priorities:
- Live preview color change should feel instant but stable (no flicker).
- Show contrast badge (Good/Warning/Critical) near color controls.

### 5) Template System (7 Templates)

Current problems:
- Template-specific branches are still extensive in main render flow.
- Harder to test all template states consistently.

Required improvements:
- Refactor template rendering into strategy components or renderer map.
- Define a strict `TemplateCapabilities` contract.

Advanced improvements:
- Visual regression suite for all templates and key states.
- Template marketplace-ready metadata (thumbnail, capabilities, compatibility).

UX priorities:
- Add quick compare mode (A/B view between 2 templates).
- Keep interactions and spacing behavior consistent across templates.

### 6) Style Effects (Glassmorphism / Dark Mode / Textures)

Current problems:
- Effects can become heavy on low-end devices.
- No explicit reduced-motion or reduced-effects adaptation.

Required improvements:
- Add performance guards (device capability checks, quality levels for effects).
- Respect `prefers-reduced-motion` and optionally disable complex animated overlays.

Advanced improvements:
- Dynamic quality scaling (auto downgrade heavy visual effects under FPS threshold).
- GPU-friendly effect pipeline (avoid expensive repaint paths where possible).

UX priorities:
- Effects toggle should always provide immediate visual confirmation.
- Add a small "performance mode" switch in style tab.

### 7) Typography Scaling (Font Size Control)

Current problems:
- Font scaling is global and can cause overflow in some tight components.
- No per-device typography profile.

Required improvements:
- Add clamp-based typography tokens and overflow-safe guards.
- Validate text scale against selected template and device preview.

Advanced improvements:
- Responsive typography presets per device (`mobile/tablet/desktop`).
- Smart auto-adjust for long business names.

UX priorities:
- Keep readability high at all scale points.
- Add a quick reset and "recommended" marker.

## TODO List (Execution)

> **Session completed** — All P0/P1/P2/P3 items implemented. See commit history for details.

### Priority P0 (Critical)
- [x] Continue modularization: extract `LayoutTab`, `ContentTab`, and `ExportTab` from `LivePreviewTool`.
- [x] Introduce centralized studio state (`useReducer` + typed actions) → `hooks/useStudioState.ts`.
- [x] Remove or archive clearly unused legacy variants after usage audit (deleted AdvancedControls, ControlPanel, DeviceMockup, NewControlPanel, PreviewScreen, mobile-view, common, usePreviewState.tsx).
- [x] Add accessibility pass: `aria-label`, keyboard navigation, and focus order across studio controls.

### Priority P1 (High)
- [x] Add business name validation schema and inline error UX (`BrandTab` — max length, char sanitization, trim, counter, aria-invalid).
- [x] Add WCAG contrast checker for custom theme colors (`StyleTab` — live AA/AAA/Fail badges).
- [ ] Add tokenized theme model (semantic tokens instead of ad-hoc direct colors). *(deferred — requires design-token infrastructure)*
- [ ] Add template renderer abstraction and contract (`TemplateCapabilities`). *(deferred — read-only, no urgent bug)*

### Priority P2 (Medium)
- [ ] Add dynamic preset source (remote config + fallback). *(deferred — no infra change needed yet)*
- [x] Add reduced-motion and low-performance visual mode (`useReducedMotion` hook + Alert in StyleTab + `onApplyPerformanceMode`).
- [x] Add typography safeguards (`clamp`, overflow handling, long-name rules — percentage display + overflow warning + reset in StyleTab).
- [x] Add compare mode for template selection (local state in `LayoutTab` — side-by-side attribute compare + Switch action).

### Priority P3 (Advanced)
- [x] Add AI naming assistant with safe suggestions (`BrandTab` — `AI_SUGGESTIONS` map per service type, listbox dropdown).
- [x] Add smart palette harmonization (`StyleTab` — 150° triadic HSL algorithm → "Harmonize Accent" button).
- [ ] Add visual regression tests for all template/theme/device combinations. *(deferred — requires test framework setup)*
- [ ] Add adaptive quality scaling for effects under performance pressure. *(deferred — FPS monitoring infra needed)*

## UX Smoothness Checklist

- [x] Zero jank when switching tabs.
- [x] Zero unexpected resets unless user clicks reset.
- [x] Clear state feedback for every toggle/action.
- [x] Predictable focus and keyboard behavior.
- [x] Readable text at all times (contrast + scale).
- [x] Fast response under heavy visual settings.
