# 11: Installable app polish + offline check

**What to build:** The app installs cleanly as "Notes" on iPhone, Android and desktop, with a proper icon and theme colour, and opens from the service worker even with no network. Signed-in users can read and edit notes offline, and the changes sync when the connection returns. Signing out leaves no readable notes on the device. Spec stories 13, 15, 64–66.

**Blocked by:** 03 (Deploy to Firebase Hosting + iPhone sign-in check), 10 (Phone layout: drawer and compact header)

**Status:** ready-for-agent (with a human device check)

- [ ] Manifest: name "Notes Taker", short name "Notes", theme and background colours from the design, `display: standalone`, icons (maskable PNG set plus an Apple touch icon) based on the amber sticky-note mark.
- [ ] The service worker caches the app shell and the translation files; the hosted app opens offline after one visit.
- [ ] **Human check:** install on Android (Install app), and on iPhone (Add to Home Screen) once one is available (deferred, see ticket 03); go offline, add, edit and complete a note, reconnect, and see the changes on another device; sign out and confirm the notes are gone from the device until you sign in again.
- [ ] Record any device-specific findings in `docs/setup/firebase.md` (step 8) or a new ADR if behaviour differs from ADR-0003 or ADR-0009.
