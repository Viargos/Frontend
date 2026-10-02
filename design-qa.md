# Theme Background Selector — Design QA

## Evidence

- Source visual truth: latest user-provided dashboard screenshot in the conversation.
- Source dimensions: 1918 × 924 pixels.
- Implementation route: `http://localhost:3001/settings`.
- Implementation screenshot: `.codex-screenshots/theme-background-auth-blocked.png`.
- Browser viewport: 1647 × 995 CSS pixels at device scale factor 1.
- State: unauthenticated redirect to the Viargos welcome screen.
- Density normalization: source and browser viewport were both evaluated at the same 1647 × 995 target size.

## Full-view comparison

Blocked. The reference shows the authenticated dashboard with a full-height themed right rail, but the available browser session is signed out. Opening `/settings` or `/dashboard` redirects to `/`, so the Settings selector and authenticated dashboard right rail cannot be captured at the required matching state.

## Focused-region comparison

Blocked. The theme selector, live preview, selected/loading states, adaptive card treatment, and dashboard background action are all behind the protected layout and were not browser-rendered in the available session.

## Findings

- [P1] Authenticated implementation state is unavailable
  - Location: `/settings` and `/dashboard`.
  - Evidence: the browser redirects `/settings` to the unauthenticated welcome screen.
  - Impact: visual fidelity, responsive layout, keyboard interaction, persistence after refresh, light/dark behavior, crossfade quality, and image-loading states cannot receive the required browser validation.
  - Fix: sign in to the local Viargos app in the available browser, then repeat the visual and interaction pass at the reference viewport.

## Required fidelity surfaces

- Fonts and typography: blocked by authentication.
- Spacing and layout rhythm: blocked by authentication.
- Colors and visual tokens: blocked by authentication.
- Image quality and asset fidelity: source assets were reused from `public/assets/images/background`, but browser rendering is blocked by authentication.
- Copy and content: code-level review completed; browser comparison is blocked by authentication.

## Primary interactions tested

- Direct navigation to `/settings`: tested; redirected to `/`.
- Theme selection: not tested because the protected route is unavailable.
- Remove custom background: not tested because the protected route is unavailable.
- Change Background action: not tested because the protected route is unavailable.
- Persistence after refresh: not tested because the protected route is unavailable.
- Light/dark switching with custom and default backgrounds: not tested because the protected route is unavailable.

## Console check

No application-specific error was identified on the unauthenticated page. The visible console errors came from installed browser extensions, including Grammarly and Angular DevTools.

## Comparison history

- Initial pass: blocked because the available browser session is unauthenticated.
- Fixes made: none; authentication state is external to the implementation.
- Post-fix evidence: unavailable.

## Implementation checklist

- Sign in to the local app in the available browser.
- Capture `/settings#theme-background-selector` at 1647 × 995.
- Test automatic, custom, loading, selected, reset, light, dark, persistence, keyboard, and dashboard action states.
- Capture `/dashboard` with a custom background at the same viewport.
- Compare the authenticated implementation with the source dashboard screenshot and resolve any P0/P1/P2 differences.

## Follow-up polish

- Reassess overlay opacity per image after the authenticated visual pass.

final result: blocked
