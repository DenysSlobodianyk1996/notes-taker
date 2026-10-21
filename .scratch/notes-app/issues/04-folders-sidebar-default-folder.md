# 04: Folders sidebar with the Default folder and folder routes

**What to build:** After signing in, the user sees a sidebar of their Folders, oldest first, with the selected Folder highlighted and its name as the page title. On an Account's first sign-in a single **Default folder** is created; it shows as "General" in EN and "Загальне" in UA (following the toggle) and has a lock icon instead of rename and delete. The URL is `/folders/<id>`: `/folders`, or an unknown id, goes to the first Folder, and refreshing keeps the selection. Spec stories 16–19, 21–24, 35–36. CONTEXT.md "Default folder". ADR-0008, ADR-0009. Design: Main, Mobile-List.

**Blocked by:** 02 (Sign in and out with Google)

**Status:** ready-for-agent

- [ ] Domain rules (pure, unit tested): folder sort (oldest first); folder label (`folders.defaultName` translation for the Default folder in the current language, otherwise the stored name).
- [ ] Folders service: a live, sorted folder list signal for the current user; `ensureDefaultFolder()` creates `{ name: '', nameKey: '', isDefault: true, createdAt }` only if no folder is marked default (idempotent, client-side UUID id, works offline).
- [ ] `/folders` resolver runs `ensureDefaultFolder()`, waits for the list and redirects to the first folder; `/folders/:folderId` with an unknown id redirects to the first folder.
- [ ] Sidebar: a "Folders" heading, the folder rows (folder icon, label, highlight on the selected one), and a lock icon with an accessible "can't be renamed or deleted" label on the Default folder; clicking a row navigates.
- [ ] Tests: domain rules; `ensureDefaultFolder` creates exactly one Default folder and is idempotent (AngularFire mocked); the resolver and unknown-id redirects; the sidebar shows the lock and switches General ↔ Загальне on the language toggle (folders service replaced through DI).
