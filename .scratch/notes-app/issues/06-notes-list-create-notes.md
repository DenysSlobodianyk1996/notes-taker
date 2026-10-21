# 06: Notes list and creating notes

**What to build:** The main area shows the selected Folder's Notes, newest first and in full (optional title in bold, text with line breaks kept). The header shows the Folder name, "Notes: N" and "Completed: N". The sidebar shows each Folder's note count. Tapping "+" opens an inline form row at the top: an optional title, the text (with a live "N / 1000" counter), and Save, which is disabled while the text is empty. Ctrl/⌘+Enter saves, Enter in the title saves, Enter in the text adds a new line, and Esc cancels. An empty Folder shows "No notes in <Folder> yet". Spec stories 23, 37–43, 49–50. Design: Main, Mobile-NewNote, Mobile-Empty.

**Blocked by:** 04 (Folders sidebar with the Default folder)

**Status:** ready-for-agent

- [ ] Domain rules (pure, unit tested): note sort (newest first); validation (text required, max 1000 after trimming; title max 200); summary counts.
- [ ] Notes service: a live note list per folder; note counts per folder; `createNote(folderId, title, text)` stores the trimmed values, `completed: false`, `createdAt` and `updatedAt`, with a client-side UUID id.
- [ ] Notes view: the header (folder label, translated counts), the note rows (title optional, text with `white-space: pre-wrap`), the empty state, and the "+" button with an accessible label.
- [ ] Inline new-note row built with Signal Forms: focus on the text; the counter; Save disabled for blank text; the keyboard shortcuts as described; shortcut hint hidden on narrow screens.
- [ ] Sidebar rows show note counts.
- [ ] Tests: domain rules; notes view component tests (empty state, newest-first order, Save disabled, Ctrl/⌘+Enter calls `createNote`, Esc closes the row) with the services replaced through DI; notes service payload test with AngularFire mocked.
