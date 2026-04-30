# Issue: Dark Mode UI Controls

## Title

Add dark mode controls in header and Settings

## Goal

Let users switch between light mode and dark mode from both the header and the Settings page.

## Scope

- add a header toggle for theme switching
- add a theme option inside Settings
- ensure both controls stay synchronized
- ensure controls are accessible and reflect current theme

## Requirements

- header toggle must switch theme in one interaction
- Settings theme option must update the app theme immediately
- both controls must show the same current state
- controls must be keyboard accessible

## Acceptance Criteria

- header includes a visible theme toggle
- Settings includes a theme selection option
- changing theme from one place updates the other control
- selected theme persists after refresh
- dark mode uses grey background, white text, and white icons on dark surfaces

## Notes

This issue depends on the theme foundation being available first.
