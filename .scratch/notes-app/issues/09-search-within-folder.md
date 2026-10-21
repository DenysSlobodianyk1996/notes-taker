# 09: Search within a folder

**What to build:** A search box above the Note list ("Search in <Folder>") filters the current Folder's Notes as the user types, matching the title and text and ignoring case. When nothing matches, it shows "No notes match '<query>'" with a hint that search covers this folder only. Switching Folders or starting a new Note clears the search. Spec stories 51–54. Design: Main (search field).

**Blocked by:** 06 (Notes list and creating notes)

**Status:** ready-for-agent

- [ ] Domain rule (pure, unit tested): `filterNotes(notes, query)`, trimmed and case-insensitive, matching on title or text; an empty query returns everything.
- [ ] A search input with a visually hidden label and a translated placeholder that uses the folder label; results update as the user types.
- [ ] A no-match state distinct from the empty-folder state.
- [ ] The search is cleared on folder change and when the new-note row opens.
- [ ] Tests: domain filter cases (Cyrillic included); a component test for filtering, no-match, and clearing on folder switch.
