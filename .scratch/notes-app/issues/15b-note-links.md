# 15b: Links on Notes

**What to build:** A Note can hold up to five Links: https addresses added in its new or edit form row and shown as clickable links under its Text, opening in a new tab. Built to the 15a design. Spec stories 89–97. Glossary: Link. ADR-0013.

**Blocked by:** 14, 15a

**Status:** done (implemented on `feature/15b-note-links`)

- [x] Domain (`@domain/notes`, test-first):
  - `NOTE_LINKS_MAX = 5`, `NOTE_LINK_MAX_LENGTH = 2048`.
  - `normalizeLink(raw)`: trims, puts `https://` in front of a bare address (no scheme), returns the URL's `href`, or null if it isn't a valid `https:` URL with a host. `http:`, `javascript:`, `mailto:`, `data:` give null.
  - `noteLinkError(raw, existing)`: `'https' | 'duplicate' | 'maxLength' | 'tooMany'` or none.
  - `shortLink(url)`: host plus path, without `https://` and `www.`, for display.
  - `Note.links: string[]` and `NoteInput.links: string[]`; `filterNotes` still ignores Links (add a test).
- [x] `NotesService`: `createNote` and `updateNote` store `links`. `toNote` reads `links`, keeping only entries that pass `normalizeLink` unchanged, at most 5; a missing field is `[]`.
- [x] Note form (`note-form`):
  - A Link field with + Add under the Due date, the added Links with ✕ (each a "Remove link" button), and the "N / 5 links" counter under it. The field and + Add are hidden at 5.
  - Enter in the field adds; Ctrl/⌘+Enter saves the Note; Esc cancels the form.
  - On Save, text left in the field is added if valid; if not, the save is blocked and the error shows.
  - The edit form starts with the Note's Links.
- [x] Note row (`notes-view`): Links under the Text and Due chip as `<a href target="_blank" rel="noopener noreferrer">` with the 🔗 icon and `shortLink`; the full address as `title`. Dimmed on Completed Notes, still clickable.
- [x] Clarity: `data-clarity-mask="true"` on the row's Link list and the form's Link field and list; add them to the MASKED list in `src/app/clarity-mask.spec.ts`.
- [x] Translations: the 15a keys in `public/i18n/en.json` and `uk.json` (identical key sets).
- [x] Tests:
  - domain rules (bare host, `http:` and other schemes rejected, duplicate, length, five at most, `shortLink`);
  - service payloads and reading bad or missing `links`;
  - form (add with + Add and Enter, remove, counter, hidden at 5, errors, the Save rule, Ctrl/⌘+Enter and Esc in the field, edit starts with existing Links);
  - row (anchors with `target` and `rel`, short text, none for a Note without Links).
- [x] Docs: `docs/plan.md` Notes fields mention `links`; `docs/design/README.md` if anything changed from 15a.
