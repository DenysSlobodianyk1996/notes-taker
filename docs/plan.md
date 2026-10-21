# Notes Taker PWA — Plan

## Context

A personal installable notes app (PWA) for iOS, Android and desktop: folders on the left, notes in the main area. You sign in with Google, and notes are stored in Firebase (Firestore), so they sync across browsers, the installed app and every device. They still work offline once you've signed in. There is no guest mode (ADR-0009). All decisions below came out of the interview and are final unless the design review changes them.

Workflow (from the `ask-matt` skill flow): seed docs → **Claude Design clickable prototype, approved first** → `/to-spec` → `/to-tickets` (local markdown) → `/implement` per ticket (test-first) → `/code-review` → PR from the feature branch into `main`; merging deploys.

## Settled decisions

**Stack**

- Angular 22 with standalone components, signals and zoneless change detection.
- Signal Forms (`@angular/forms/signals`).
- Plain SCSS, no UI library, no dark mode.
- Material Symbols icons through a Google Fonts `<link>` in `index.html` (`<span class="material-symbols-outlined">`).
- `@angular/pwa` service worker and manifest.
- The `firebase` SDK (modular, no AngularFire; see ADR-0009) for Auth and Firestore. No other storage library.
- Vitest (Angular's unit-test builder), angular-eslint, Prettier, Husky with lint-staged.
- `@ngx-translate/core` (with the HTTP loader) for the EN/UA interface. Translations live in `public/i18n/en.json` and `public/i18n/uk.json`, drafted in `docs/design/i18n/` (ADR-0008).

**UI language (EN/UA)**

- The interface is in English or Ukrainian; user content (folder names, titles, text) is never translated.
- On the first visit the browser language decides (`uk*` → `uk`, else `en`). The choice is then saved in `localStorage` on this device only.
- An "EN | UA" toggle sits in the header and in the corner of the login card. Switching is instant, with no reload and no language in the URL. It also sets `<html lang>`.
- Each key has exactly one translation (no plural rules), so counts are phrased like "Notes: 4".
- The PWA manifest stays in English.

**Auth (Google only, ADR-0009)**

- `/login` has one action, **Sign in with Google**, plus the EN | UA toggle and the hint "Your notes sync across all your devices."
- `authGuard` lets signed-in users through; anyone else goes to `/login`. `/login` redirects signed-in users to `/folders`. Firebase keeps the session across reloads.
- **Offline, never signed in on this device:** the login page shows "You're offline. Connect to sign in." and disables the button. It re-enables when the device is back online.
- Sign-in uses a popup on desktop and a redirect on mobile and in the installed PWA.
- Firebase Hosting with `authDomain = <project>.web.app`, so redirect sign-in stays on the same origin. This fixes the iOS standalone and third-party storage problems (ADR-0003).
- Sign-out clears the Firestore offline cache and returns to `/login`.
- When signed in, Firestore's `persistentLocalCache` keeps the app working offline; changes sync when the device reconnects.
- The app never sees or stores passwords; Google handles the sign-in. Firebase Auth stores only uid, email, name, photo and timestamps.

**Folders**

- One level only; every note belongs to a folder.
- Each Account has exactly one **Default folder**, created automatically on its first sign-in (when it has no folders). It is stored as `isDefault: true`, `name: ''` and always shown as the `folders.defaultName` translation ("General" / "Загальне"), so it follows the EN | UA toggle. It can't be renamed or deleted; its row shows a lock icon instead of edit and delete. So there is always at least one folder. Every other folder can be renamed and deleted.
- Both display names of the Default folder are reserved: creating or renaming a folder to "General" or "Загальне" (any case) shows the "already exists" error.
- Names are required, up to 50 characters, and unique per Account after `trim().toLowerCase()`.
- Sorted by creation date, oldest first.
- Created inline: an add icon puts a new row with a form at the top of the list.
- Each folder shows a note count. Rename is inline; delete asks in a `<dialog>` ("Delete folder and N notes?").

**Notes**

- Fields: optional title (≤200), required text (≤1000, not just spaces, with a live character count), `completed`, `createdAt`, `updatedAt`.
- Shown in full with no preview truncation, newest first. Completed notes stay in place, crossed out and dimmed.
- Each row has a checkbox on the left that toggles completion either way, and a delete icon that asks in a `<dialog>`.
- Clicking a row edits it inline with ✓ and ✕ buttons; no autosave. Only one row is edited at a time.
- An add icon puts a new row with a form at the top of the list.
- Keyboard: Enter adds a new line, Ctrl/Cmd+Enter submits, Esc cancels.
- A search box above the list filters as you type on title and text, ignoring case. It applies only to the current folder.
- No popups for create or edit. `<dialog>` is used only for delete confirmations.

**Layout and routing**

- A single page shell: a folders sidebar on the left and the notes list in the main area. Below 900px the sidebar becomes a drawer opened with ☰, which closes when a folder is picked.
- Routes:
  - `/login`
  - `/folders`: its resolver loads the folders, creates the Default folder if there are none, and redirects to the first folder.
  - `/folders/:folderId`, a nested child route. An unknown ID redirects to the first folder.
  - `**` goes to `/folders`.
- IDs are UUIDs (`crypto.randomUUID()`, also used as Firestore document IDs).

**Data model**

- Firestore: `users/{uid}/folders/{folderId}` holds `{name, nameKey, isDefault, createdAt}`.
- Firestore: `users/{uid}/notes/{noteId}` holds `{folderId, title, text, completed, createdAt, updatedAt}`.
- Security rules allow access only when `request.auth.uid == uid`.
- Name uniqueness is checked in the client against the loaded list, since Firestore can't enforce it offline.

**Git and CI**

- Feature branches (`feature/*`) merge straight into `main` through pull requests. There is no `develop` branch.
- `ci.yml` runs on every pull request into `main`: lint, test and build.
- `deploy.yml` runs on pushes to `main`: lint, test and build, then `FirebaseExtended/action-hosting-deploy` using the `FIREBASE_SERVICE_ACCOUNT` secret.
- Husky runs lint-staged (Prettier and ESLint) before each commit, and type-check plus tests before each push.

## Architecture

- No storage interface (ADR-0009): `core/data/folders.service.ts` and `core/data/notes.service.ts` use `firebase/firestore` directly and expose signals (from `onSnapshot`) plus `createFolder`, `renameFolder`, `deleteFolder` (with its notes, in a batch), `ensureDefaultFolder`, `createNote`, `updateNote`, `toggleNote` and `deleteNote`.
- `core/domain/` holds pure, fully unit-tested functions:
  - `folder-name.ts`: `normalizeFolderName`, `isNameTaken` (including the reserved Default-folder names) and `folderLabel` (the translation for the Default folder, otherwise the stored name)
  - `filter-notes.ts`
- `core/auth/auth.service.ts` exposes the current user as a signal, `signIn()` (popup or redirect choice), and `signOut()` (with cache clearing). `core/auth/guards.ts` holds `authGuard` and `loginPageGuard`. `features/folders/first-folder.resolver.ts` handles the `/folders` redirect.
- `core/network/online.ts`: an `isOnline` signal from `navigator.onLine` and the online/offline events, used by the login page.
- Features:
  - `features/login/`
  - `features/shell/` (layout and drawer)
  - `features/folders/` (sidebar list and folder row form)
  - `features/notes/` (list, note row, note form and search)
- `shared/confirm-dialog/` is a native `<dialog>` wrapper.
- `core/i18n/ui-language.service.ts` handles the initial choice (localStorage, then the browser language), `use(lang)`, persisting the choice and `<html lang>`. `shared/language-toggle/` is the EN | UA control.

## Steps

0. ✅ **Seed:** README, `CONTEXT.md`, ADRs, `docs/setup/firebase.md`, `docs/setup/deploy.md`, agent-skill config.
1. **Claude Design prototype, before any code.**
   - ✅ Canvas <https://claude.ai/artifact/TXP1WiDr5cb8hvjZvpV68G>, local `docs/design/project/` and the standalone `docs/design/notes-taker-design.html`.
   - ✅ EN/UA toggle and Ukrainian text added to both prototypes.
   - ✅ Guest mode removed; offline login state added (ADR-0009).
   - **Get user approval** before step 2.
2. `/to-spec` → `.scratch/notes-app/spec.md`; `/to-tickets` → `.scratch/notes-app/issues/NN-*.md` with blocking edges.
3. **Tickets, in rough order:**
   1. Scaffold: Angular 22, Vitest, ESLint, Prettier, Husky (use the `setup-pre-commit` skill), PWA, Material Symbols, `ci.yml`, plus ngx-translate with `public/i18n/{en,uk}.json`, the UI-language service and the toggle.
   2. Firebase wiring, `firebase.json` with an SPA rewrite to `/index.html`, `firestore.rules`, `deploy.yml`, plus an **early sign-in check on a real iPhone home-screen install**.
   3. Domain functions, test-first.
   4. Auth: the auth service, the login page (with the offline state), guards and the resolver.
   5. Firestore services for folders and notes.
   6. Shell, folders sidebar and folder CRUD.
   7. Notes list: CRUD, completion and search.
   8. Delete dialogs.
   9. Responsive drawer and PWA manifest and icon polish.

   Each ticket runs `/implement` (TDD), then `/code-review`, then a PR into `main`.

## Verification

- `npm run lint`, `npm test` and `npm run build` pass, and pre-commit and pre-push hooks run.
- Unit tests cover:
  - `normalizeFolderName`, uniqueness and `folderLabel`
  - reserved names: "General", " general ", "ЗАГАЛЬНЕ" are rejected for ordinary folders
  - note filtering
  - the UI-language service: browser fallback, localStorage persistence, `<html lang>`
  - `en.json` and `uk.json` have identical key sets
  - the guards and resolver redirects, and `ensureDefaultFolder` creating exactly one Default folder
  - the Firestore services, with the Firebase SDK mocked
- Manual check (`ng serve`, then a deploy to Firebase Hosting):
  1. Sign in with Google, create folders and notes, then refresh. Data persists and the app stays on `/folders/:id`.
  2. Try a duplicate folder name: an inline error appears.
  3. The Default folder shows a lock and can't be renamed or deleted. Its name switches General ↔ Загальне with the language toggle. Creating a folder named "general" or "Загальне" is rejected.
  4. Switch EN ↔ UA: the interface changes instantly, user content doesn't, and the choice survives a reload.
  5. Open the login page offline on a fresh browser profile: the offline note shows and the button is disabled.
  6. Go offline while signed in, edit, then come back online. The change syncs.
  7. Sign out: the cache is cleared and the app is back on `/login`.
  8. Sign in on iPhone Safari and in the installed home-screen app with the same account: both show the same notes.
- Deep-link refresh on a hosted `/folders/:id` returns no 404.
- Install the PWA on Android and on an iPhone home screen. Google sign-in works in the installed iPhone app.
