# 13: Microsoft Clarity for UX analytics (user content masked)

**What to build:** The hosted app loads Microsoft Clarity (`@microsoft/clarity`) so the owner can watch session replays and heatmaps and see where people struggle. Private content never appears in recordings: note titles and text, Folder names, Due date chips and the search field are masked in code, and the Clarity project uses Strict masking. No cookies, no consent banner, no identity. Sessions are tagged with the UI language, the Theme and the layout. Clarity runs only in production. Spec stories 84–86. ADR-0011.

**Blocked by:** none (the Theme and layout tags use ticket 12's ThemeService and ticket 10's LayoutService, both done)

**Status:** done on `feature/clarity-plan` (project id `z7wvfu4416` in `environment.prod.ts`); the owner confirms Strict masking and Cookies off below

Human setup (owner, one-time):

- [x] Create a project at <https://clarity.microsoft.com> for `https://notes-taker-df334.web.app`.
- [ ] Settings → Masking: **Strict**.
- [ ] Settings → Setup: turn **Cookies** off (no-cookie mode).
- [x] Copy the project ID (Settings → Overview) for the build. It is public, like the Firebase config.

Build:

- [x] `npm install @microsoft/clarity`.
- [x] Environment: `clarityProjectId` in `environment.prod.ts` (swapped in by the production build's `fileReplacements`), empty in `environment.ts` for development and tests.
- [x] A small analytics service (e.g. `core/analytics`): when the project ID is set, `Clarity.init(id)` once at startup, then `Clarity.setTag` for `lang` (en/uk), `theme` (orange/pink/purple) and `layout` (phone/wide), updated when they change. It never calls `identify`, `consent`/`consentV2` or `event`, and does nothing when the ID is empty.
- [x] `data-clarity-mask="true"` on whole content areas (code review: single elements missed aria-labels, placeholders and "No notes match …" messages): the Notes area, the Folders sidebar, confirm dialogs and the Account avatar.
- [x] Docs: `docs/setup/clarity.md` with the human setup above.
- [x] Tests: the service initialises only with an ID and never calls `identify` or `consent` (Clarity module mocked); tags follow the UI language, Theme and layout signals; a template guard checks the masked elements carry `data-clarity-mask` (a spec in the style of `icon-font.spec.ts`).
