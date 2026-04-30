# Issue: Dark Mode Foundation

## Title

Create dark mode theme foundation for frontend

## Goal

Build the base frontend theme system needed to support light mode and dark mode across the app.

## Scope

- define shared theme tokens or CSS variables
- add root theme state management
- persist theme choice across refresh/navigation
- avoid hard-coded one-off colors where shared tokens should be used

## Requirements

- support `light` and `dark`
- dark background must be grey, not fully black
- primary text in dark mode must be white or near-white
- icons in dark mode must be white or near-white
- theme must apply globally from a root class or attribute

## Acceptance Criteria

- frontend has a reusable theme foundation
- theme can switch between light and dark
- theme persists after reload
- no obvious flash of wrong theme on first paint if reasonably avoidable
- shared layout and common UI surfaces can consume the theme tokens

## Notes

This issue should prepare the system so feature teams can update components without inventing their own dark mode rules.

