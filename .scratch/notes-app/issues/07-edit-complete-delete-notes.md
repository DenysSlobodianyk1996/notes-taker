# 07: Edit, complete and delete notes, with Due dates

**What to build:** Tapping a Note turns its row into the same inline form, filled in, with ✓ and ✕ and no autosave. Only one form row (note or folder) is open at a time. A checkbox on the left marks a Note **Completed** or not. A Completed Note stays in place, crossed out and dimmed, and the header's "Completed: N" updates. A delete icon opens a native `<dialog>` ("Delete this note?", quoting the title or the start of the text) with Cancel and a red "Delete note" button. Notes also get an optional **Due date** (a day, no time), set, changed or cleared in the new or edit form row; a Note with one shows it in the UI language's date format, and an **Overdue** Note (Due date before today, not Completed) shows it in red. The order stays newest first. Spec stories 44–48, 67, 74–77. ADR-0004. Glossary: Due date, Overdue. Design: Desktop-Editing, Main, and the `due-dates` start state from 07a.

**Blocked by:** 06 (Notes list and creating notes), 07a (Design the Due date: approval)

**Status:** ready-for-agent

- [ ] Notes service: `updateNote(id, title, text)` (trims, bumps `updatedAt`), `toggleNote(id)`, `deleteNote(id)`.
- [ ] The note row opens the edit form on click (as a real button with an accessible "Edit note: …" label); ✓ and Ctrl/⌘+Enter save; ✕ and Esc cancel; opening another form discards the current one.
- [ ] Checkbox: a real `<input type="checkbox">` with an accessible label; the Completed style is crossed out and muted `#6B6B70`.
- [ ] A shared confirm-dialog component on native `<dialog>` (`showModal`, focus trapped, Esc closes): title, body and confirm/cancel labels as inputs, with a danger style for the confirm button.
- [ ] Due date data: `dueDate: string | null` on `users/{uid}/notes/{noteId}`, a local day as `'YYYY-MM-DD'`. A missing field (older Notes) reads as `null`. Security rules don't change.
- [ ] Domain rule (pure, unit tested): `isOverdue(note, today)`: true only when `dueDate` is before `today` (local `'YYYY-MM-DD'`) and the Note isn't Completed.
- [ ] Notes service: `createNote` and `updateNote` take an optional `dueDate`; clearing stores `null`.
- [ ] Form row: an optional `<input type="date">` with a clear control, as in the design; the Signal Form keeps the existing Save rules (Text still required).
- [ ] Note row: a Due date chip formatted for the current UI language (`Intl.DateTimeFormat`), red with "Overdue" when `isOverdue`; a Completed Note's chip stays plain.
- [ ] Translations: copy the `notes.dueDateLabel`/`clearDueDate`/`due`/`overdue` keys from `docs/design/i18n/*.json` to `public/i18n/*.json`.
- [ ] Tests (services replaced through DI): edit then save calls `updateNote` with trimmed values; Esc restores the row; the checkbox calls `toggleNote`; the delete flow only calls `deleteNote` after confirming; the one-form-open rule; `isOverdue` (yesterday Overdue; today and tomorrow not; Completed never; no Due date never); the form saves, changes and clears the Due date; the row shows the date and the Overdue style; the service payload writes `dueDate` or `null` (Firebase SDK mocked).
