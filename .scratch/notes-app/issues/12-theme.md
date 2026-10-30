# 12: Theme switch (Orange, Pink, Purple)

**What to build:** A palette button in the header opens a popover with three colour circles: Orange (the default), Pink and Purple. Picking one recolours the app's accent instantly (buttons, checkboxes, the selected Folder, form borders) and saves the choice in the Account, so it follows the user to every device, live. The browser tab icon follows the Theme; the installed app icon stays Orange. The login page is always Orange. Spec stories 78–83, "Theme (ADR-0010)". Glossary: Theme. ADR-0010. Design: the `theme` start state and `?theme=pink|purple` in `docs/design/notes-taker-design.html`.

**Blocked by:** 11 (Installable app polish + offline check); design approval below

**Status:** ready-for-agent once the design is approved

Design (done in the standalone prototype; needs your approval):

- [x] Palette button ("Theme" / "Тема") left of EN | UA on every screen size; popover with three circles as a radio group, ring and ✓ on the current one; closes on pick, Esc or a click outside.
- [x] The three Themes recolour only the accent family; the login page stays Orange; the tab icon follows the Theme.
- [x] Start state `theme`, `?theme=` deep links, and the `theme.*` translations in `docs/design/i18n/*.json`.
- [ ] The Claude Design canvas gets the same (the `Main` artboard's `accent` prop already exists).

Build:

- [ ] Styles: the accent SCSS tokens become CSS custom properties (`--accent`, `--accent-soft`, `--accent-ink`, `--accent-tint`), with `:root[data-theme="pink"|"purple"]` overrides; components use the properties.
- [ ] Domain (pure, unit tested): `parseTheme(value)` returns a known Theme or `'orange'`.
- [ ] Theme service: follows `users/{uid}` live (`theme` field) while signed in; `setTheme(theme)` writes it with `setDoc(..., { merge: true })` (not awaited, works offline); applies `data-theme` on `<html>`, the `theme-color` meta and the SVG favicon; Orange when signed out.
- [ ] Theme picker component in the header: button with `aria-haspopup`/`aria-expanded`, popover with `role="radiogroup"` and `role="radio"` circles labelled by `theme.*`; Esc and outside click close it.
- [ ] Translations: copy `theme.*` from `docs/design/i18n/*.json` to `public/i18n/*.json`.
- [ ] Tests: `parseTheme`; the service writes `{ theme }` with merge and applies a Theme arriving from another device (Firebase SDK mocked); signed out gives Orange; the picker shows the current Theme as checked, saves a pick and closes, and closes on Esc (service replaced through DI).
