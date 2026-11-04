# 15a: Design Links in the prototype

**What to build:** Add Links to the design prototype (the Claude Design canvas and `docs/design/notes-taker-design.html`) before any app code, so they can be approved like the rest of the UI, as was done for the Due date (07a). Built in ticket 15b. Spec stories 89–97. Glossary: Link. ADR-0013.

**Blocked by:** 14 (the row needs its Edit button before it can hold links)

**Status:** ready-for-agent

- [ ] New and edit note form rows: under the Due date, a Link field (placeholder e.g. "https://…") with a **+ Add** button; added Links listed one per line with a ✕ to remove each; a counter "N / 5 links" styled like the Text's "N / 1000" hint. At 5 Links the field and + Add are hidden.
- [ ] Error states under the Link field: "Only https links" (for `http://`, `mailto:`, text that isn't an address), "Already added", "Too long". Shown on + Add, Enter, or Save with text left in the field.
- [ ] Note row: Links under the Text and Due chip, one per line, 🔗 `link` icon plus a shortened address (host and path, ellipsis when long), in the accent ink colour. A Completed Note's Links are dimmed with the row but not crossed out.
- [ ] Placement works on desktop and on the phone frame (390 px), in EN and UA.
- [ ] Sample data: a Note with one Link, one with five, one Completed with a Link, and one long address that truncates.
- [ ] A new start state `links` (and a canvas artboard) showing these, plus an edit row with Links and an error.
- [ ] Translation keys in `docs/design/i18n/*.json` (e.g. `notes.linkLabel`, `notes.addLink`, `notes.removeLink`, `notes.linkCount`, `notes.linkErrors.https`, `.duplicate`, `.maxLength`), then `python3 docs/design/sync-i18n.py`.
- [ ] `docs/design/README.md`: list the new state and artboard, and describe the Link behaviour. Republish the canvas.
