# Spec: Notes Taker PWA (v1)

Status: ready-for-agent

Sources: `docs/plan.md`, `CONTEXT.md` (glossary), `docs/adr/0001`–`0009`, design in `docs/design/` (canvas <https://claude.ai/artifact/TXP1WiDr5cb8hvjZvpV68G>, standalone `docs/design/notes-taker-design.html`, translations `docs/design/i18n/*.json`). Where this spec and the design disagree, the design prototype wins for UI and this spec wins for behaviour and data.

## Problem Statement

I want to jot down short notes, grouped into folders, and find them again quickly on whatever device I have: my iPhone, an Android phone, or a desktop browser. Existing notes apps are heavy, and a plain browser page loses my notes, or keeps them on one device only. On iPhone in particular, notes saved in Safari don't show up in an app added to the home screen. I also want the interface in Ukrainian or English, without my own text ever being touched.

## Solution

A small installable web app (PWA) called **Notes**:

- I sign in once with my Google account. The app never sees my password.
- My **Folders** and **Notes** are stored in my **Account** in the cloud and sync across every browser, the installed app and every device. Edits made offline sync later.
- On the left is a sidebar of Folders. One of them is the locked **Default folder**, shown as "General" or "Загальне". On the right is the Note list of the selected Folder, which works like a to-do list: tick a Note **Completed**, edit it in place, delete it after confirming.
- Each Folder has its own search box.
- An **EN | UA** toggle switches the interface language instantly. Folder names, Titles and Text are never translated.
- On phones the sidebar becomes a drawer, and the app can be installed to the home screen.

## User Stories

### Signing in and session
1. As a new visitor, I want a login page with a single "Sign in with Google" button, so that I know exactly how to start.
2. As a visitor, I want the login page to say my notes sync across all my devices, so that I understand why sign-in is required.
3. As a visitor, I want to sign in with my existing Google account, so that I don't have to create another password.
4. As a security-conscious user, I want the app to never see or store my password, so that my Google account stays safe.
5. As a desktop user, I want sign-in to open in a popup, so that I stay on the app page.
6. As a phone user or a user of the installed app, I want sign-in to work by redirecting to Google and back, so that it works where popups are unreliable (iOS home-screen apps).
7. As a signed-in user, I want to stay signed in after reloading or reopening the app, so that I don't sign in every time.
8. As a visitor who isn't signed in, I want every app URL to send me to the login page, so that I can't reach a broken empty screen.
9. As a signed-in user, I want opening `/login` to take me straight to my folders, so that I don't see the login page again.
10. As a visitor on a device that's offline and has never been signed in, I want the login page to say "You're offline. Connect to sign in." and disable the button, so that I understand why I can't sign in.
11. As that visitor, I want the button to become active again when the connection returns, so that I don't have to reload.
12. As a signed-in user, I want a "Sign out" button in the header, so that I can leave the app on a shared device.
13. As a user who signs out, I want the app's cached copy of my data removed from the device, so that the next person can't read my notes.
14. As a user who signs out, I want to land on the login page, so that it's clear I'm signed out.
15. As a user, I want the same Account on Safari and on the iPhone home-screen app to show the same notes, so that installing the app doesn't split my data.

### Default folder
16. As a new Account, I want a Default folder created automatically on my first sign-in, so that I can start writing notes immediately.
17. As a user, I want the Default folder shown as "General" in English and "Загальне" in Ukrainian, following the language toggle, so that it always reads naturally.
18. As a user, I want the Default folder to show a lock instead of rename and delete, so that I know it's permanent.
19. As a user, I want the Default folder to be impossible to rename or delete, so that I always have at least one folder.
20. As a user, I want to be prevented from creating another folder called "General" or "Загальне" (in any letter case), so that I never see two identical-looking folders.
21. As a user signing in on a second device, I want no second Default folder created, so that I keep exactly one.

### Folders
22. As a user, I want to see all my Folders in a sidebar, oldest first, so that the Default folder stays on top and the order is stable.
23. As a user, I want each Folder to show how many Notes it contains, so that I can see where my notes are.
24. As a user, I want the selected Folder highlighted, so that I know where I am.
25. As a user, I want to create a Folder by tapping a "new folder" icon that opens an inline form row at the top of the list, so that I don't deal with popups.
26. As a user, I want to confirm a new Folder with ✓ or Enter and cancel with ✕ or Esc, so that it's quick with a mouse or a keyboard.
27. As a user, I want an inline error when the Folder name is empty, so that I don't create blank Folders.
28. As a user, I want an inline error when the name is longer than 50 characters, so that names stay readable.
29. As a user, I want an inline error "A folder with this name already exists" when the name matches another Folder ignoring case and surrounding spaces, so that I don't end up with duplicates like "Work" and " work ".
30. As a user, I want a newly created Folder selected automatically, so that I can add Notes to it right away.
31. As a user, I want to rename a non-default Folder inline from its row, with the same validation, so that I can fix names.
32. As a user, I want to delete a non-default Folder after a confirmation dialog that names the Folder and how many Notes will be deleted, so that I don't lose notes by accident.
33. As a user, I want the dialog to say plainly when the Folder is empty, so that I know nothing else is lost.
34. As a user, I want to land in the Default folder after deleting the Folder I was in, so that I'm never on a missing page.
35. As a user, I want the URL to contain the selected Folder's id (`/folders/<id>`), so that refreshing or bookmarking keeps me in that Folder.
36. As a user, I want `/folders`, and any unknown Folder id, to send me to my first Folder, so that I never see an error page.

### Notes
37. As a user, I want the Notes of the selected Folder listed newest first, shown in full, so that I can read them without opening each one.
38. As a user, I want each Note to have an optional Title and a required Text, so that quick notes need no title.
39. As a user, I want to add a Note by tapping "+", which opens an inline form row at the top of the list, so that writing a note is one tap away.
40. As a user, I want a live character counter "N / 1000" while typing the Text, so that I know the limit.
41. As a user, I want the Save button disabled while the Text is empty or only spaces, so that I can't save empty Notes.
42. As a user, I want Enter to add a new line in the Text, and Ctrl/⌘+Enter to save, so that I can write multi-line notes and save from the keyboard.
43. As a user, I want Enter in the Title field to save and Esc to cancel, so that the form is fast to use.
44. As a user, I want to tap a Note to edit it in place, with ✓ and ✕, and no autosave, so that I decide when changes are kept.
45. As a user, I want only one Note or Folder form open at a time, so that I don't lose track of unsaved edits.
46. As a user, I want a checkbox on the left of each Note to mark it Completed or not, so that I can use a Folder as a to-do list.
47. As a user, I want Completed Notes to stay in place but appear crossed out and dimmed, so that I can still see what's done.
48. As a user, I want to delete a Note after a confirmation dialog that quotes its Title or the start of its Text, so that I don't delete the wrong Note.
49. As a user, I want the Folder header to show the Folder name, the number of Notes and the number Completed, so that I can see progress.
50. As a user, I want a friendly empty state ("No notes in <Folder> yet") when a Folder has no Notes, so that I know what to do next.

### Search
51. As a user, I want a search box above the Note list that filters as I type, so that I can find a Note quickly.
52. As a user, I want search to match the Title and Text, ignoring case, within the current Folder only, so that results are predictable.
53. As a user, I want a "No notes match '<query>'" state when nothing matches, so that I know the search worked.
54. As a user, I want the search cleared when I switch Folders or start a new Note, so that I don't get confused by a stale filter.

### Language
55. As a Ukrainian speaker, I want the interface in Ukrainian, so that the app feels native.
56. As a first-time visitor, I want the language picked from my browser (Ukrainian if it's `uk*`, otherwise English), so that it's right without setup.
57. As a user, I want an "EN | UA" toggle on the login card and in the header that switches instantly without reloading or changing the URL, so that switching is painless.
58. As a user, I want my language choice remembered on this device, so that it survives reloads.
59. As a user, I want my Folder names, Titles and Text never translated, so that my content stays exactly as I typed it.
60. As a screen-reader user, I want the page language (`<html lang>`) updated when I switch, so that text is read with the right pronunciation.

### Layout, offline and installation
61. As a desktop user, I want the sidebar and the Note list side by side (900px and wider), so that I can see everything at once.
62. As a phone user, I want the sidebar to become a drawer opened with ☰ that closes when I pick a Folder, so that the Note list gets the full width.
63. As a phone user, I want touch targets of at least 36–44px, so that I can tap accurately.
64. As a signed-in user, I want to read, add, edit and delete Notes while offline, with changes syncing when I reconnect, so that a bad connection doesn't stop me.
65. As a user, I want to install the app to my home screen on iOS, Android and desktop, so that it opens like a native app.
66. As a user, I want the app shell to load from the service worker when offline, so that the installed app opens without a network.
67. As a keyboard user, I want every action reachable with Tab and the dialogs to trap focus, so that I can use the app without a mouse.
68. As a user, I want the app to open quickly, with hosting that refreshes any deep link without a 404, so that bookmarks always work.

### Owner and operations
69. As the owner, I want each user's data readable and writable only by that signed-in user (Firestore security rules), so that accounts are isolated.
70. As the owner, I want every pull request into `main` to run lint, tests and build, so that broken code doesn't merge.
71. As the owner, I want every merge to `main` to deploy to Firebase Hosting automatically, so that releases need no manual steps.
72. As the owner, I want pre-commit formatting and linting, and pre-push type-check and tests, so that problems are caught locally.
73. As the owner, I want everything to run on Firebase's free Spark plan, so that the app costs nothing.

## Implementation Decisions

### Stack (ADR-0001, ADR-0008, ADR-0009)
- Angular 22: standalone components, signals, zoneless change detection, Signal Forms for every form, plain SCSS, no UI library, no dark mode. Material Symbols Outlined icons via a Google Fonts link.
- `@angular/fire` for Auth and Firestore; `@angular/pwa` for the service worker and manifest; `@ngx-translate/core` with the HTTP loader for translations. No other storage library (no Dexie, no IndexedDB code of our own).
- Tooling: Vitest through Angular's unit-test builder, angular-eslint, Prettier, Husky with lint-staged.

### Modules (deep modules, small interfaces)
- **Domain rules** (pure functions, no Angular): folder-name normalisation; the "name taken" check (against existing names, excluding the folder being renamed, ignoring the Default folder, and rejecting every language's Default-folder display name); the folder label (translated name for the Default folder, otherwise the stored name); note filtering by query; folder and note validation (required, max lengths, trimming); sorting (folders oldest first, notes newest first).
- **Auth service:** the current user as a signal; `signIn()` chooses popup on desktop and redirect on mobile or standalone display mode, and completes a pending redirect result on startup; `signOut()` signs out, then terminates Firestore and clears its persistent cache.
- **Online status:** a signal driven by `navigator.onLine` and the online/offline events.
- **Folders service:** a live, sorted folder list signal for the current user; `createFolder(name)`, `renameFolder(id, name)`, `deleteFolder(id)` (deletes the folder and all its notes in one batched write; refuses the Default folder), and `ensureDefaultFolder()` (creates the Default folder only if the Account has no folder marked default; idempotent).
- **Notes service:** a live note list per folder; `createNote`, `updateNote`, `toggleNote`, `deleteNote`; it also provides note counts per folder for the sidebar.
- The services talk to Firestore directly; there is no store interface (ADR-0009). Validation runs in the UI through the domain rules, and the services assume valid input apart from the Default-folder guard.
- **UI-language service:** picks the initial language (saved choice, then the browser language), `use(lang)` (switches ngx-translate, saves the choice, sets `<html lang>`), and exposes the current language as a signal.
- **Features:** a login page; a shell (header with brand, language toggle, avatar and sign-out; responsive sidebar or drawer; outlet); a folders sidebar (list, inline new/rename form row, lock on the Default folder); a notes view (header with counts, search, inline new/edit form row, note rows, empty and no-match states); a shared confirm dialog built on native `<dialog>`; a shared language toggle.

### Routing
- `/login`: guarded so that signed-in users are redirected to `/folders`.
- The app shell (guarded by `authGuard`) contains `/folders`, whose resolver runs `ensureDefaultFolder()`, waits for the folder list and redirects to the first folder, and the child route `/folders/:folderId`, where an unknown id redirects to the first folder.
- `**` redirects to `/folders`.

### Data model (Firestore)
- `users/{uid}/folders/{folderId}`: `{ name: string, nameKey: string, isDefault: boolean, createdAt: Timestamp }`. The Default folder stores `name: ''`, `nameKey: ''`, `isDefault: true`. `nameKey = name.trim().toLowerCase()`.
- `users/{uid}/notes/{noteId}`: `{ folderId: string, title: string, text: string, completed: boolean, createdAt: Timestamp, updatedAt: Timestamp }`.
- IDs come from `crypto.randomUUID()`, set on the client, so writes work offline.
- Limits: folder name 1–50 characters after trimming; title 0–200; text 1–1000 after trimming (stored trimmed).
- Security rules: read and write on `users/{uid}/**` only when `request.auth.uid == uid`.
- Firestore uses `persistentLocalCache` with multi-tab support.

### Sign-in and hosting (ADR-0003)
- Firebase Hosting serves the app. `authDomain` is the app's own `<project>.web.app` (with the OAuth redirect URI added), so redirect sign-in stays on the same origin, including in iOS home-screen apps.
- `firebase.json` rewrites `**` to `/index.html`.
- Fallback, if redirect sign-in fails on a real iPhone install: Google Identity Services, then `signInWithCredential` (decided during the Firebase ticket).

### UI rules (from the design prototype)
- Creating and editing happen inline. `<dialog>` is used only for delete confirmations (ADR-0004).
- Only one form row is open at a time: opening another closes the current one without saving.
- Breakpoint 900px: below it, the sidebar is a drawer with a backdrop and closes on folder pick; the header hides the avatar.
- Colours: accent `#F59E0B`, accent-soft `#FEF3C7`/`#92400E`, text `#1C1C1E`, muted `#5F5F64`, sidebar `#F7F6F3`, borders `#E5E4E0`/`#ECEBE7`, danger `#B91C1C`. System font stack.
- Translations: the two JSON files drafted in `docs/design/i18n/` (49 keys, identical key sets, ngx-translate `{{param}}` format, one translation per key with no plural rules) move into the app's public assets and remain the single source for both languages. The design's sync script is not used by the app.

### Delivery (ADR-0007)
- Feature branches merge into `main` through PRs.
- CI runs lint, test and build on PRs.
- Deploy on push to `main` with `FirebaseExtended/action-hosting-deploy` and the `FIREBASE_SERVICE_ACCOUNT_<PROJECT>` secret.
- The manual Firebase console steps are in `docs/setup/firebase.md`, and the CI and deploy steps are in `docs/setup/deploy.md`.

## Testing Decisions

- **What a good test is:** it exercises behaviour through the public surface (a function's inputs and outputs, or what a page renders and does when the user acts) and never internal state or private methods. Tests use the glossary's words in their names (Folder, Default folder, Note, Completed, Account, UI language).
- **Seam 1, domain rules (unit, the most tests):**
  - folder-name normalisation and "name taken", including reserved "General"/"Загальне" in any case and with spaces, and renaming a folder to its own name
  - the folder label for the Default folder in EN and UA
  - note filtering (title and text, case-insensitive, current folder only)
  - validation limits
  - sort orders
- **Seam 2, pages and components through Angular TestBed:** render the login page, the shell, the folders sidebar and the notes view with the Auth, Folders, Notes and online-status services replaced through Angular DI by simple test doubles (plain objects with signals and spy methods; no extra interface in app code). Assert on what the user sees and on which service method is called. Cover:
  - the login button disabled with the offline note when offline
  - the lock on the Default folder
  - inline errors (empty, too long, taken, reserved)
  - only one form row open at a time
  - Save disabled for empty Text; Ctrl/⌘+Enter saves; Esc cancels
  - the checkbox calling `toggleNote`
  - the confirm dialog before `deleteFolder` and `deleteNote`
  - search and its no-match state
  - the EN ↔ UA switch changing the labels but not the user content
  - the drawer below 900px
- **Seam 3, Firestore services with AngularFire mocked:** check that the right document paths and payloads are written (trimming, `nameKey`, `isDefault`, timestamps), that `deleteFolder` batches the folder and its notes, refuses the Default folder, and that `ensureDefaultFolder` is idempotent.
- **Routing:** guard and resolver tests (signed out → `/login`; signed in on `/login` → `/folders`; `/folders` → first folder; unknown id → first folder).
- **UI-language service:** browser fallback, saved choice wins, `<html lang>` updated.
- **Translations:** a test asserts that `en.json` and `uk.json` have identical key sets.
- **Not automated in v1:** the Firebase emulator and end-to-end browser tests. Real-device checks are done by hand: sign-in in Safari and in the iPhone home-screen app shows the same notes, Android install, offline edit then sync, deep-link refresh on hosting.
- **Prior art:** none in the repo yet. The behaviour to match is pinned down by the design prototype, whose `?state=` presets list the states the tests should cover.

## Out of Scope

- Guest or anonymous use, local-only storage, and moving guest data (dropped, ADR-0009).
- Sign-in methods other than Google (email/password, Apple, etc.).
- Nested folders, folder reordering, notes outside a folder, moving notes between folders.
- Rich text or Markdown, images, attachments, checklists inside a Note, reminders, push notifications.
- Global search across folders, tags, pinning, trash or undo, archive.
- Sharing or collaboration between Accounts.
- Dark mode, more languages, plural-aware translations, a translated PWA manifest, date display.
- End-to-end encryption (the project owner can read data in the Firebase console).
- A Firebase emulator and end-to-end test suites (may come later).

## Further Notes

- The first ticket that touches Firebase must include a **real iPhone home-screen sign-in check**, because ADR-0003's redirect approach is the main risk.
- Firebase setup is manual and owner-only. The Firebase ticket needs the web config values from the owner (`docs/setup/firebase.md`), so the scaffolding and domain tickets can go first.
- Folder-name uniqueness is enforced on the client only. A clash from two devices editing offline at the same moment is accepted (ADR-0005).
- Keep the design prototype as the visual reference during implementation; don't copy its throwaway code (Vue / Design Components) into the app.
