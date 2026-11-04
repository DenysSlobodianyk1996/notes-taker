# 14: Edit a Note from an Edit button

**What to build:** Each Note row gets a ✎ Edit button left of its 🗑 Delete button, as Folder rows already have. The button opens the inline edit form; clicking the note body no longer does, so its Title and Text can be selected and copied. Spec stories 87–88. ADR-0012 (amends ADR-0004).

**Blocked by:** none

**Status:** ready-for-agent

- [ ] Design: add ✎ to the note row in `docs/design/notes-taker-design.html` and the canvas (`docs/design/project/Main.dc.html`, then republish); note it in `docs/design/README.md`.
- [ ] `notes-view.html`: the `.note-body` `<button>` becomes a plain element with no click handler (still `data-clarity-mask="true"`); text is selectable. Add an `icon-btn edit` (`edit` symbol) before `.delete`, aria-label and title from `notes.edit` ("Edit note: {{note}}"), calling `startEdit(note)`.
- [ ] Both buttons always visible on phones and desktop, sized like the Folder row's buttons; the row layout stays aligned (checkbox, body, ✎, 🗑).
- [ ] Focus returns to the Note's ✎ after Save or Cancel (it used to return to the row).
- [ ] Translations: reuse `notes.edit`; add a short `title` tooltip key only if the design needs one, in both `en.json` and `uk.json`.
- [ ] Tests (notes view): ✎ opens that Note's form; a click on the note body doesn't; ✎ has the "Edit note: <title>" name; focus is back on ✎ after Save and after Esc; only one form row open at a time still holds.
- [ ] `src/app/clarity-mask.spec.ts` still passes: the note body stays masked, the new button is not masked.
- [ ] `docs/plan.md`: the Notes rule says ✎ opens the edit form.
