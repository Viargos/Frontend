# Dark Mode Requirements

## Summary

Add a dark mode feature to the frontend so users can switch between light mode and dark mode from:

- the main header toggle
- the Settings page theme option

The dark theme should feel soft and premium, not pure black.

## Business Goal

Provide a more comfortable viewing experience in low-light conditions and give users control over the visual theme across the app.

## Problem Statement

The frontend currently appears to use a light-first visual system. Users who prefer darker interfaces do not have a way to reduce brightness or personalize the experience.

## Feature Objective

Users must be able to:

- switch to dark mode from the header
- switch theme from Settings
- keep the selected theme across navigation and page reloads
- see the same theme consistently across the major frontend screens

## Scope

### In Scope

- dark mode visual treatment for frontend pages
- theme toggle in the header
- theme selection option in Settings
- persistent theme selection
- update shared background, text, icon, border, surface, and interactive states
- support for both light mode and dark mode

### Out of Scope

- redesign of page layouts
- new branding system
- backend preference sync unless already supported or explicitly added later
- email templates
- admin or storybook-only styling work unless needed for shared components

## User Stories

### Primary User Story

As a user, I want to switch between light mode and dark mode so I can use the app comfortably in different environments.

### Supporting User Stories

As a user, I want the header toggle to change theme quickly from anywhere in the app.

As a user, I want to manage my theme in Settings so the preference feels like part of my profile experience.

As a user, I want the selected theme to remain active after refresh or navigation.

## UX Requirements

### Dark Theme Direction

- Background should be dark grey, not fully black.
- Primary text should be white or near-white.
- Icons should be white or near-white when placed on dark surfaces.
- Surfaces should use layered greys to preserve depth.
- Borders and dividers should remain visible but subtle.
- Hover, active, and focus states must remain clear in both themes.

### Visual Guidance

- `bg`: little grey, soft charcoal, not total black
- `text`: white
- `icons`: white

Recommended baseline direction:

- app background: charcoal or slate dark grey
- cards/modals/panels: slightly lighter than page background
- primary text: white or off-white
- secondary text: muted grey
- icons on dark surfaces: white or off-white

### Header Toggle

- Add a visible theme toggle in the header.
- User can switch between light mode and dark mode in one interaction.
- Toggle should clearly communicate current state.
- Toggle should be keyboard accessible.

### Settings Theme Control

- Add a theme option in Settings.
- Settings control should allow at least:
  - Light
  - Dark
- If the team wants better future flexibility, it may also support:
  - System

## Functional Requirements

### Theme Switching

1. User can switch theme from the header toggle.
2. User can switch theme from Settings.
3. Both controls must stay in sync.
4. Theme change should apply across the app without requiring a manual refresh.

### Persistence

1. Selected theme must persist across page refresh.
2. Selected theme must persist across route changes.
3. If Settings changes theme, the header toggle must immediately reflect it.

### Theme Application

1. Shared layout, navigation, content surfaces, and common UI components must support dark mode.
2. Text must remain readable with sufficient contrast.
3. Icons must remain visible in dark mode.
4. Inputs, buttons, dropdowns, modals, cards, tabs, and overlays must have valid dark variants.

### Accessibility

1. Toggle and Settings control must be accessible by keyboard.
2. Focus states must be visible in dark mode.
3. Text contrast must remain readable.
4. Theme state must not rely on color alone.

## Non-Functional Requirements

- No flash of incorrect theme during initial load if reasonably avoidable.
- Theme implementation should be scalable to future components.
- Shared tokens or CSS variables should be preferred over one-off per-page overrides.
- Dark mode should not break current responsive behavior.

## Suggested Frontend Approach

### Theme Architecture

Use a shared frontend theme system based on:

- root theme class or data attribute on `html` or `body`
- shared CSS variables or semantic design tokens
- component styles consuming semantic tokens instead of hard-coded colors where possible

### Preferred Theme States

- `light`
- `dark`
- optional future-ready `system`

### Storage

Persist the selected theme in frontend storage such as local storage unless the team decides to extend this to server-side user preferences later.

## Affected Areas

Likely affected frontend areas:

- app layout shell
- header
- Settings page
- shared common UI components
- cards
- modals
- form controls
- icons
- dashboard and content surfaces

## Acceptance Criteria

### Header Toggle

- A theme toggle is present in the header.
- Clicking the toggle changes between light and dark mode.
- Toggle state matches the active theme.

### Settings

- A theme option is present in Settings.
- Changing the theme in Settings updates the live app theme immediately.
- Header toggle reflects the new state after a Settings change.

### Visual Quality

- Dark mode background is dark grey and not pure black.
- Main text is white or near-white.
- Icons are white or near-white on dark surfaces.
- Core pages remain readable and visually consistent.

### Persistence

- Refreshing the page keeps the selected theme.
- Navigating to another page keeps the selected theme.

### Accessibility

- Theme controls are keyboard accessible.
- Focus states remain visible.
- Text and icons remain legible.

## Open Questions

1. Should theme preference be local-only or saved per logged-in user in backend later?
2. Should the first release support only `light` and `dark`, or also include `system`?
3. Which screens are mandatory for release one: full app coverage or priority pages first?

## Recommended Release Split

### Phase 1

- theme foundation
- root theme state and persistence
- shared semantic color tokens
- header toggle
- Settings theme option

### Phase 2

- full pass on shared components and feature screens
- visual polish and accessibility review

