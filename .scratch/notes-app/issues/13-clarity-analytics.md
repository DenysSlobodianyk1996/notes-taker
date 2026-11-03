# 13: Microsoft Clarity for UX analytics (user content masked)

**What to build:** The hosted app loads Microsoft Clarity (`@microsoft/clarity`) so the owner can watch session replays and heatmaps and see where people struggle. What the user writes never appears in recordings: note titles and text, Due dates, searches, dialog bodies and the avatar are masked in code, and the Clarity project uses Balanced masking. Labels, buttons and Folder names stay visible. No cookies, no consent banner, no identity. Sessions are tagged with the UI language, the Theme and the layout. Clarity runs only in production. Spec stories 84–86. ADR-0011.

**Blocked by:** none (the Theme and layout tags use ticket 12's ThemeService and ticket 10's LayoutService, both done)

**Status:** done (project id `z7wvfu4416` in `environment.prod.ts`; PR #28 merged, masking narrowed on `feature/clarity-masking`). The owner's setup is done, including the switch to Balanced.

Human setup (owner, one-time):

- [x] Create a project at <https://clarity.microsoft.com> for `https://notes-taker-df334.web.app`.
- [x] Settings → Masking: set (owner check done).
- [x] Settings → Masking: switch to **Balanced** (Strict hides every label; see ADR-0011). Done by the owner.
- [x] Settings → Setup: turn **Cookies** off (no-cookie mode).
- [x] Copy the project ID (Settings → Overview) for the build. It is public, like the Firebase config.

Build:

- [x] `npm install @microsoft/clarity`.
- [x] Environment: `clarityProjectId` in `environment.prod.ts` (swapped in by the production build's `fileReplacements`), empty in `environment.ts` for development and tests.
- [x] A small analytics service (e.g. `core/analytics`): when the project ID is set, `Clarity.init(id)` once at startup, then `Clarity.setTag` for `lang` (en/uk), `theme` (orange/pink/purple) and `layout` (phone/wide), updated when they change. It never calls `identify`, `consent`/`consentV2` or `event`, and does nothing when the ID is empty.
- [x] `data-clarity-mask="true"` on what the user writes: the note body (title, text, Due chip, its aria-label), the completion checkbox label, the note form fields, the search field and no-match message, the dialog body, the avatar. First built as whole masked areas (PR #28); narrowed at the owner's request so labels, buttons and Folder names stay visible.
- [x] Docs: `docs/setup/clarity.md` with the human setup above.
- [x] Tests: the service initialises only with an ID and never calls `identify` or `consent` (Clarity module mocked); tags follow the UI language, Theme and layout signals; a template guard (`src/app/clarity-mask.spec.ts`) checks each masked element carries `data-clarity-mask` and that the Notes area, Folder heading, sidebar and dialog stay unmasked.
