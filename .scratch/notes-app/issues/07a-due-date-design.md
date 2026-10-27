# 07a: Design the Due date in the prototype

**What to build:** Add the Due date to the design prototype (the Claude Design canvas and `docs/design/notes-taker-design.html`) before any app code, so it can be approved like the rest of the UI. Spec stories 74–77. Glossary: Due date, Overdue.

**Blocked by:** none

**Status:** ready-for-human (approval of the design)

- [ ] New and edit note form rows: an optional Due date field (native `<input type="date">`, label from `notes.dueDateLabel`) with a clear control (`notes.clearDueDate`). Works with the existing keyboard rules (Ctrl/⌘+Enter saves, Esc cancels).
- [ ] Note row: a Note with a Due date shows it (`notes.due`, date formatted in the UI language). An Overdue Note shows it in red (`notes.overdue`, Danger `#B91C1C`). A Completed Note never looks Overdue.
- [ ] Placement works on desktop and on the phone frame (390 px), in EN and UA (Ukrainian strings are longer).
- [ ] Sample data: give a few Notes a Due date, including one Overdue, one due today and one Completed with a past Due date.
- [ ] A new start state `due-dates` (and a canvas artboard) that shows these, plus an edit row with a Due date set.
- [ ] `docs/design/README.md`: list the new artboard and state, and describe the Due date behaviour.
- [ ] Translation keys already drafted in `docs/design/i18n/*.json` (`notes.dueDateLabel`, `clearDueDate`, `due`, `overdue`); adjust them if the design needs different wording, then run `python3 docs/design/sync-i18n.py`.
