# Notes are edited from an Edit button, not by clicking the row

Amends ADR-0004. Editing stays inline (the row turns into a form with Save and Cancel, no autosave, dialogs only for confirmation), but what opens the form changes: each Note row has a ✎ Edit button left of its 🗑 Delete button, as Folder rows already do. The note body (Title, Text, Due date, Links) is plain content with no click handler.

Clicking the whole row made it hard to select or copy a Note's text, since every click opened the form. It also ruled out Links: the row was a `<button>`, and an `<a>` can't sit inside one. The Edit button's accessible name is "Edit note: <title>", the label the row used to carry, and focus returns to it after Save or Cancel.

## Considered options

- **Keep the row click and add text selection tricks** (open the form only on a click without a selection). Rejected: fragile on touch screens, and it still forbids links inside the row.
- **Double-click to edit.** Rejected: not discoverable, and there is no double-click on phones.
