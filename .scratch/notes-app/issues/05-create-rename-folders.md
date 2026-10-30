# 05: Create and rename folders inline

**What to build:** The user taps the "new folder" icon, and an inline form row appears at the top of the sidebar. They type a name and confirm with ✓ or Enter (or cancel with ✕ or Esc). The new Folder appears and is selected. On the selected non-default Folder, a rename icon turns the row into the same inline form. Invalid names show an inline error and aren't saved: empty, longer than 50 characters, already used (ignoring case and surrounding spaces), or a reserved Default-folder name ("General"/"Загальне" in any case). Spec stories 20, 25–31, 45. ADR-0004, ADR-0005. Design: Desktop-Editing (folder error row).

**Blocked by:** 04 (Folders sidebar with the Default folder)

**Status:** done (implemented on `feature/05-create-rename-folders`)

- [x] Domain rules (pure, unit tested): `normalizeFolderName`; validation of required and max 50 after trimming; "name taken" against the existing folders, excluding the folder being renamed, ignoring the Default folder, and rejecting every language's `folders.defaultName` in any case.
- [x] Folders service: `createFolder(name)` stores the trimmed `name`, `nameKey`, `isDefault: false` and `createdAt`; `renameFolder(id, name)` updates `name` and `nameKey` and refuses the Default folder.
- [x] Inline form row built with Signal Forms: focus on open; ✓/Enter submits; ✕/Esc cancels; errors shown with `role="alert"` using `folders.errors.*`; only one form row open at a time (opening another discards the current one).
- [x] A new folder becomes selected (navigates to its URL); no rename control on the Default folder.
- [x] Tests: domain rules (including "General", " general ", "ЗАГАЛЬНЕ" rejected and renaming to its own name allowed); sidebar component tests for each error message, the create and rename service calls, and Esc cancelling.
