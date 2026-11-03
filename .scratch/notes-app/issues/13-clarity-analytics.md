# 13: Microsoft Clarity for UX analytics (user content masked)

**What to build:** The hosted app loads Microsoft Clarity (`@microsoft/clarity`) so the owner can watch session replays and heatmaps and see where people struggle. Private content never appears in recordings: note titles and text, Folder names, Due date chips and the search field are masked in code, and the Clarity project uses Strict masking. No cookies, no consent banner, no identity. Sessions are tagged with the UI language, the Theme and the layout. Clarity runs only in production. Spec stories 84–86. ADR-0011.

**Blocked by:** none (the Theme and layout tags use ticket 12's ThemeService and ticket 10's LayoutService, both done)

**Status:** ready-for-human (Clarity project setup below), then ready-for-agent

Human setup (owner, one-time):

- [ ] Create a project at <https://clarity.microsoft.com> for `https://notes-taker-df334.web.app`.
- [ ] Settings → Masking: **Strict**.
- [ ] Settings → Setup: turn **Cookies** off (no-cookie mode).
- [ ] Copy the project ID (Settings → Overview) for the build. It is public, like the Firebase config.

Build:

- [ ] `npm install @microsoft/clarity`.
- [ ] Environment: `clarityProjectId` set for production only (empty in development), via a production `fileReplacements` file or a build-time setting.
- [ ] A small analytics service (e.g. `core/analytics`): when the project ID is set, `Clarity.init(id)` once at startup, then `Clarity.setTag` for `lang` (en/uk), `theme` (orange/pink/purple) and `layout` (phone/wide), updated when they change. It never calls `identify`, `consent`/`consentV2` or `event`, and does nothing when the ID is empty.
- [ ] `data-clarity-mask="true"` on user content: note title and text (rows and form fields), Folder names (sidebar rows, the Folder header title, the folder name form), the Due date chip and date field, the search field, and the delete dialogs' quoted names.
- [ ] Docs: `docs/setup/firebase.md` (or a new `docs/setup/clarity.md`) with the human setup above.
- [ ] Tests: the service initialises only with an ID and never calls `identify` or `consent` (Clarity module mocked); tags follow the UI language, Theme and layout signals; a template guard checks the masked elements carry `data-clarity-mask` (a spec in the style of `icon-font.spec.ts`).
