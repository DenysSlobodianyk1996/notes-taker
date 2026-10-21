# 07: Edit, complete and delete notes

**What to build:** Tapping a Note turns its row into the same inline form, filled in, with ✓ and ✕ and no autosave. Only one form row (note or folder) is open at a time. A checkbox on the left marks a Note **Completed** or not. A Completed Note stays in place, crossed out and dimmed, and the header's "Completed: N" updates. A delete icon opens a native `<dialog>` ("Delete this note?", quoting the title or the start of the text) with Cancel and a red "Delete note" button. Spec stories 44–48, 67. ADR-0004. Design: Desktop-Editing, Main.

**Blocked by:** 06 (Notes list and creating notes)

**Status:** ready-for-agent

- [ ] Notes service: `updateNote(id, title, text)` (trims, bumps `updatedAt`), `toggleNote(id)`, `deleteNote(id)`.
- [ ] The note row opens the edit form on click (as a real button with an accessible "Edit note: …" label); ✓ and Ctrl/⌘+Enter save; ✕ and Esc cancel; opening another form discards the current one.
- [ ] Checkbox: a real `<input type="checkbox">` with an accessible label; the Completed style is crossed out and muted `#6B6B70`.
- [ ] A shared confirm-dialog component on native `<dialog>` (`showModal`, focus trapped, Esc closes): title, body and confirm/cancel labels as inputs, with a danger style for the confirm button.
- [ ] Tests (services replaced through DI): edit then save calls `updateNote` with trimmed values; Esc restores the row; the checkbox calls `toggleNote`; the delete flow only calls `deleteNote` after confirming; the one-form-open rule.
