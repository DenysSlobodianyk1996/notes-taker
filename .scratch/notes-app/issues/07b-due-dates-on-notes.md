# 07b: Due dates on Notes

**What to build:** Notes get an optional **Due date** (a day, no time), set, changed or cleared in the new or edit form row. A Note with one shows it in the UI language's date format, and an **Overdue** Note (Due date before today, not Completed) shows it in red. The order stays newest first. Built to the 07a design. Spec stories 74–77. Glossary: Due date, Overdue. Design: the `due-dates` start state from 07a.

**Blocked by:** 06 (Notes list and creating notes), 07a (Design the Due date: approval)

**Status:** done (built with ticket 07 on `feature/07-edit-complete-delete-notes`, in commit `feat(07)`)

Split out of ticket 07 afterwards, so the Due date has its own design → build pair (07a → 07b), like Links (15a → 15b).

- [x] Due date data: `dueDate: string | null` on `users/{uid}/notes/{noteId}`, a local day as `'YYYY-MM-DD'`. A missing field (older Notes) reads as `null`. Security rules don't change.
- [x] Domain rule (pure, unit tested): `isOverdue(note, today)`: true only when `dueDate` is before `today` (local `'YYYY-MM-DD'`) and the Note isn't Completed.
- [x] Notes service: `createNote` and `updateNote` take an optional `dueDate`; clearing stores `null`.
- [x] Form row: an optional `<input type="date">` with a clear control, as in the design; the Signal Form keeps the existing Save rules (Text still required).
- [x] Note row: a Due date chip formatted for the current UI language (`Intl.DateTimeFormat`), red with "Overdue" when `isOverdue`; a Completed Note's chip stays plain.
- [x] Translations: copy the `notes.dueDateLabel`/`clearDueDate`/`due`/`overdue` keys from `docs/design/i18n/*.json` to `public/i18n/*.json`.
- [x] Tests: `isOverdue` (yesterday Overdue; today and tomorrow not; Completed never; no Due date never); the form saves, changes and clears the Due date; the row shows the date and the Overdue style; the service payload writes `dueDate` or `null` (Firebase SDK mocked).
