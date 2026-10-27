# 07b: Due date on notes

**What to build:** A Note can have an optional Due date (a day, no time) that is set, changed or cleared in the inline new or edit form row. Notes with a Due date show it in the UI language's date format, and an Overdue Note (Due date before today, not Completed) shows it in red. The order stays newest first. Spec stories 74–77. Glossary: Due date, Overdue. Design: the `due-dates` state from 07a.

**Blocked by:** 07 (Edit, complete and delete notes), 07a (Design the Due date)

**Status:** ready-for-agent (once 07a is approved)

- [ ] Data: `dueDate: string | null` on `users/{uid}/notes/{noteId}`, a local day as `'YYYY-MM-DD'`. A missing field (older Notes) reads as `null`. Security rules don't change.
- [ ] Domain rule (pure, unit tested): `isOverdue(note, today)`: true only when `dueDate` is before `today` (local `'YYYY-MM-DD'`) and the Note isn't Completed.
- [ ] Notes service: `createNote` and `updateNote` take an optional `dueDate`; clearing stores `null`; `updatedAt` bumps as usual.
- [ ] Form row: an optional `<input type="date">` with a clear control, following the design from 07a; the Signal Form keeps the existing Save rules (Text still required).
- [ ] Note row: shows the Due date formatted for the current UI language (`Intl.DateTimeFormat`), with the Overdue style when `isOverdue`.
- [ ] Translations: copy the `notes.due*`/`overdue`/`clearDueDate` keys from `docs/design/i18n/*.json` to `public/i18n/*.json`.
- [ ] Tests: `isOverdue` (yesterday Overdue; today and tomorrow not; Completed never; no Due date never); the form saves, changes and clears the Due date (service replaced through DI); the row shows the date and the Overdue style; the service payload writes `dueDate` or `null` (Firebase SDK mocked).
