# Notes Taker PWA — Plan

## Context
The repo (`git@github.com:DenysSlobodianyk1996/notes-taker.git`) is an empty clone. The goal is a personal installable notes app (PWA) for iOS, Android and desktop: folders on the left, notes in the main area. Notes can be used as a guest, with data kept on the device, or after signing in with Google, with data synced through Firebase. All decisions below came out of the interview and are final unless the design review changes them.

Workflow (from the `ask-matt` skill flow): seed docs → **Claude Design clickable prototype, approved first** → `/to-spec` → `/to-tickets` (local markdown) → `/implement` per ticket (test-first) → `/code-review` → PR from the feature branch into `main`; merging deploys.

## Settled decisions
**Stack**
- Angular 22 with standalone components, signals and zoneless change detection.
- Signal Forms (`@angular/forms/signals`).
- Plain SCSS, no UI library, no dark mode.
- Material Symbols icons through a Google Fonts `<link>` in `index.html` (`<span class="material-symbols-outlined">`).
- `@angular/pwa` service worker and manifest.
- Dexie for guest IndexedDB storage; `@angular/fire` for Auth and Firestore.
- Vitest (Angular's unit-test builder), angular-eslint, Prettier, Husky with lint-staged.

**Auth and modes**
- `/login` page offers "Sign in with Google" and "Continue as guest". The chosen mode is persisted.
- A guard redirects to `/login` until a mode is chosen; `/login` redirects to `/folders` once one is chosen.
- Sign-in uses popup on desktop and redirect on mobile and in the installed PWA.
- Firebase Hosting with `authDomain = <project>.web.app`, so redirect sign-in stays on the same origin. This fixes the iOS standalone and third-party storage problems.
- Sign-out clears the Firestore offline cache and returns to `/login`.
- When signed in, Firestore's `persistentLocalCache` keeps the app working offline.

**Moving guest data to the account**
- After a Google sign-in, if the guest IndexedDB holds data beyond an empty default "General" folder, a `<dialog>` asks "Move N folders / M notes to your account?" with Move and Skip.
- **Move:**
  - Folders whose names match (after trimming and lowercasing) merge into one folder.
  - A note is a duplicate when both its trimmed title and trimmed text match, ignoring case. For duplicates the account copy is kept, and the result is completed if either copy was completed.
  - The other notes are added.
  - The guest store is then cleared.
- **Skip:** guest data stays on the device, and the dialog appears again on the next sign-in.

**Folders**
- One level only; every note belongs to a folder.
- A "General" folder is auto-created whenever the user has none, so there is always at least one folder. The last folder cannot be deleted.
- Names are required, up to 50 characters, and unique per user after `trim().toLowerCase()`.
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
- No popups for create or edit. `<dialog>` is used only for delete confirmations and the guest-data move.

**Layout and routing**
- A single page shell: a folders sidebar on the left and the notes list in the main area. Below 900px the sidebar becomes a drawer opened with ☰, which closes when a folder is picked.
- Routes:
  - `/login`
  - `/folders`: its resolver or guard loads the folders, creates "General" if there are none, and redirects to the first folder.
  - `/folders/:folderId`, a nested child route. An unknown ID redirects to the first folder.
  - `**` goes to `/folders`.
- IDs are UUIDs (`crypto.randomUUID()`, also used as Firestore document IDs).

**Data model**
- Firestore: `users/{uid}/folders/{folderId}` holds `{name, nameKey, createdAt}`.
- Firestore: `users/{uid}/notes/{noteId}` holds `{folderId, title, text, completed, createdAt, updatedAt}`.
- Dexie mirrors this with `folders` and `notes` tables.
- Security rules allow access only when `request.auth.uid == uid`.
- Name uniqueness is checked in the client against the loaded list, since Firestore can't enforce it offline.

**Git and CI**
- Feature branches (`feature/*`) merge straight into `main` through pull requests. There is no `develop` branch.
- `ci.yml` runs on every pull request into `main`: lint, test and build.
- `deploy.yml` runs on pushes to `main`: lint, test and build, then `FirebaseExtended/action-hosting-deploy` using the `FIREBASE_SERVICE_ACCOUNT` secret.
- Husky runs lint-staged (Prettier and ESLint) before each commit, and type-check plus tests before each push.

## Architecture (deep modules)
- `core/storage/notes-store.ts` defines the `NotesStore` interface: `folders()` and `notes(folderId)` signals or observables, plus `createFolder`, `renameFolder`, `deleteFolder` (with its notes), `createNote`, `updateNote`, `toggleNote`, `deleteNote` and `ensureDefaultFolder`. It has two adapters:
  - `dexie-notes-store.ts` for guests
  - `firestore-notes-store.ts` for signed-in users

  A `NOTES_STORE` token resolves to the active adapter based on the session mode.
- `core/domain/` holds pure, fully unit-tested functions:
  - `folder-name.ts`: `normalizeFolderName` and `isNameTaken`
  - `merge-guest-data.ts`: `mergeGuestData(guest, account) → {foldersToCreate, notesToCreate, notesToUpdate}`
  - `filter-notes.ts`
- `core/auth/session.service.ts` tracks the mode (`none | guest | google`), user, sign-in (popup or redirect choice), sign-out and cache clearing.
- `core/auth/guards.ts` holds `modeChosenGuard` and `loginPageGuard`. `features/folders/first-folder.resolver.ts` handles the `/folders` redirect.
- Features:
  - `features/login/`
  - `features/shell/` (layout and drawer)
  - `features/folders/` (sidebar list and folder row form)
  - `features/notes/` (list, note row, note form and search)
  - `features/move-guest-data/` (dialog and orchestration)
- `shared/confirm-dialog/` is a native `<dialog>` wrapper.

## Steps
0. **Seed (on `main`, local commit only).**
   - Write `.gitignore` and `README.md`.
   - Write `CONTEXT.md`, the glossary: Folder, Note, Guest, Account, Session mode, Move guest data, Duplicate note.
   - Write ADRs in `docs/adr/`:
     1. Angular + Signal Forms + SCSS
     2. `NotesStore` with Dexie and Firestore adapters
     3. Firebase Hosting and the sign-in strategy
     4. Inline editing, dialogs only for confirmation
     5. Folder name uniqueness
     6. Moving and merging guest data
     7. Branching and CI
   - Write `docs/setup/firebase.md`, the console step-by-step: create the project, enable Google sign-in, Firestore, Hosting, authorized domains, web config into `environment.ts`, and deploying rules. Also covers Spark plan free limits.
   - Write `docs/setup/deploy.md`: the service account secret and the workflows.
   - Commit. **The user runs `! git push -u origin main`.** All later work happens on `feature/*` branches off `main`.
1. **Claude Design prototype, before any code.**
   - Create it from the Design type (`type_url` from quickstart, no design system): a clickable prototype of every flow, in a minimal Apple-Notes style with amber `#F59E0B` and the system font.
   - Screens:
     - login
     - desktop shell
     - inline folder create and rename
     - note rows (normal, completed, editing, new)
     - search
     - delete-folder and delete-note dialogs
     - mobile list and open drawer
     - empty states
     - the move-guest-data dialog with a merge example
   - Save the link and a local export to `docs/design/` (`README.md` plus the HTML).
   - **Get user approval** before step 2.
2. `/to-spec` → `.scratch/notes-app/spec.md`; `/to-tickets` → `.scratch/notes-app/issues/NN-*.md` with blocking edges.
3. **Tickets, in rough order:**
   1. Scaffold: Angular 22, Vitest, ESLint, Prettier, Husky (use the `setup-pre-commit` skill), PWA, Material Symbols, `ci.yml`.
   2. Firebase wiring, `firebase.json` with an SPA rewrite to `/index.html`, `firestore.rules`, `deploy.yml`, plus an **early sign-in check on a real iPhone home-screen install**.
   3. Domain functions, test-first.
   4. The `NotesStore` interface and the Dexie adapter.
   5. The Firestore adapter.
   6. Session, the login page, guards and the resolver.
   7. Shell, folders sidebar and folder CRUD.
   8. Notes list: CRUD, completion and search.
   9. Delete dialogs.
   10. Moving guest data.
   11. Responsive drawer and PWA manifest and icon polish.

   Each ticket runs `/implement` (TDD), then `/code-review`, then a PR into `main`.

## Verification
- `npm run lint`, `npm test` and `npm run build` pass, and pre-commit and pre-push hooks run.
- Unit tests cover:
  - `normalizeFolderName` and uniqueness
  - `mergeGuestData`: same-name folders, case and space variants, duplicate notes with completion merging, a brand-new account, and empty default "General" only
  - note filtering
  - the guards and resolver redirects
- Manual check (`ng serve`, then a deploy to Firebase Hosting):
  1. As a guest, create folders and notes, then refresh. Data persists and the app stays on `/folders/:id`.
  2. Try a duplicate folder name: an inline error appears.
  3. Delete the last folder: it is blocked.
  4. Sign in with Google; the move dialog appears. Moving merges the data and clears the guest store.
  5. Go offline, edit, then come back online. The change syncs.
  6. Sign out: the cache is cleared and the app is back on `/login`.
- Deep-link refresh on a hosted `/folders/:id` returns no 404.
- Install the PWA on Android and on an iPhone home screen. Google sign-in works in the installed iPhone app.
