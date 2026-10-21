# 01: App skeleton with EN/UA login screen

**What to build:** A runnable Angular 22 app that shows the static login card from the design (logo, "Notes", tagline, a "Sign in with Google" button that does nothing yet, and the sync hint), with a working **EN | UA** toggle. Opening the app with a Ukrainian browser shows Ukrainian; switching the toggle changes every label instantly, with no reload and no URL change; the choice survives a reload. All the project tooling is in place, so every later ticket starts from a green, linted, tested base. Spec: `.scratch/notes-app/spec.md` (stories 1–2, 55–58, 60, 70, 72). Design: `docs/design/` (Mobile-Login, Mobile-Login-UA).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Angular 22 app (standalone, signals, zoneless, SCSS) at the repo root; `npm start`, `npm test`, `npm run lint` and `npm run build` all work.
- [ ] Vitest through Angular's unit-test builder; angular-eslint; Prettier; Husky with lint-staged before each commit, and type-check plus tests before each push (use the `setup-pre-commit` skill).
- [ ] `@angular/pwa` added (manifest name "Notes Taker", short name "Notes"; English only); Material Symbols Outlined loaded via a Google Fonts link; the system font stack and the design colours as SCSS variables.
- [ ] ngx-translate with the HTTP loader, using the two JSON files copied from `docs/design/i18n/` into the app's public assets.
- [ ] UI-language service: the saved choice wins, otherwise the browser language (`uk*` → `uk`, else `en`); `use(lang)` switches, saves the choice in localStorage and sets `<html lang>`. Unit tested.
- [ ] Shared EN | UA toggle component (pressed state, accessible group label), shown in the corner of the login card.
- [ ] A test asserts that `en.json` and `uk.json` have identical key sets.
- [ ] A component test: the login card renders the translated texts in EN, and switching to UA changes them.
- [ ] `ci.yml` runs lint, test and build on every pull request into `main`.
