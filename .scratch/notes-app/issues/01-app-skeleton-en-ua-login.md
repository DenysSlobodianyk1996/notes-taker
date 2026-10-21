# 01: App skeleton with EN/UA login screen

**What to build:** A runnable Angular 22 app that shows the static login card from the design (logo, "Notes", tagline, a "Sign in with Google" button that does nothing yet, and the sync hint), with a working **EN | UA** toggle. Opening the app with a Ukrainian browser shows Ukrainian; switching the toggle changes every label instantly, with no reload and no URL change; the choice survives a reload. All the project tooling is in place, so every later ticket starts from a green, linted, tested base. Spec: `.scratch/notes-app/spec.md` (stories 1–2, 55–58, 60, 70, 72). Design: `docs/design/` (Mobile-Login, Mobile-Login-UA).

**Blocked by:** None (can start immediately)

**Status:** done (implemented on `feature/01-app-skeleton`)

- [x] Angular 22 app (standalone, signals, zoneless, SCSS) at the repo root; `npm start`, `npm test`, `npm run lint` and `npm run build` all work.
- [x] Vitest through Angular's unit-test builder; angular-eslint; Prettier; Husky with lint-staged before each commit, and type-check plus tests before each push (use the `setup-pre-commit` skill).
- [x] `@angular/pwa` added (manifest name "Notes Taker", short name "Notes"; English only); Material Symbols Outlined loaded via a Google Fonts link; the system font stack and the design colours as SCSS variables.
- [x] ngx-translate with the HTTP loader, using the two JSON files copied from `docs/design/i18n/` into the app's public assets.
- [x] UI-language service: the saved choice wins, otherwise the browser language (`uk*` → `uk`, else `en`); `use(lang)` switches, saves the choice in localStorage and sets `<html lang>`. Unit tested.
- [x] Shared EN | UA toggle component (pressed state, accessible group label), shown in the corner of the login card.
- [x] A test asserts that `en.json` and `uk.json` have identical key sets.
- [x] A component test: the login card renders the translated texts in EN, and switching to UA changes them.
- [x] `ci.yml` runs lint, test and build on every pull request into `main`.

## Comments

**Implemented** (commits on `feature/01-app-skeleton`):
- All checks green: format check, lint, typecheck, 14 unit tests (5 files), production build. The pre-commit hook was exercised on the first commit.
- Review (standards + spec) fixes applied: toggle touch target raised to 36px, `UiLanguage` derived from one const list, unused router/input-binding and CSS helper removed, storage read through the injected document, Karma-era VS Code configs removed, design README token table and `docs/setup/deploy.md` CI steps updated.
- Left for later tickets:
  - `**` redirects to `/login` until ticket 02 adds `/folders`.
  - The CLI-generated PWA icons (`maskable any`) are replaced in ticket 11.
  - The browser fallback reads only `navigator.language` (as the spec says), not `navigator.languages`.
