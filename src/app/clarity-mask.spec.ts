import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * ADR-0011: Microsoft Clarity (Balanced masking) records the screen. What the user typed is masked
 * in code; the app's own labels, buttons, layout and Folder names stay visible for UX review.
 */
const APP = join(process.cwd(), 'src/app');
const read = (template: string): string => readFileSync(join(APP, template), 'utf8');
const NOTES = 'features/notes/notes-view/notes-view.html';
const FORM = 'features/notes/note-form/note-form.html';

/** What must be masked: what, template, the opening tag of the masked element. */
const MASKED: [what: string, template: string, element: RegExp][] = [
  [
    'the note body (title, text, due chip, its "Edit note: …" label)',
    NOTES,
    /<button\b[^>]*class="note-body"[^>]*>/,
  ],
  [
    'the completion checkbox label ("Mark as completed: …")',
    NOTES,
    /<label\b[^>]*class="check"[^>]*>/,
  ],
  ['the search field', NOTES, /<input\b[^>]*type="search"[^>]*>/],
  [
    'the no-match message (repeats the search)',
    NOTES,
    /<p\b[^>]*>(?=\s*\{\{\s*'notes\.noMatchTitle')/,
  ],
  ['the note title field', FORM, /<input\b[^>]*class="title"[^>]*>/],
  ['the note text field', FORM, /<textarea\b[^>]*>/],
  ['the due date field', FORM, /<input\b[^>]*type="date"[^>]*>/],
  [
    'the confirm dialog body (quotes a Note)',
    'shared/confirm-dialog/confirm-dialog.html',
    /<p\b[^>]*>/,
  ],
  [
    'the Account avatar (Google photo and name)',
    'features/shell/app-shell.html',
    /<span\b[^>]*class="avatar"[^>]*>/,
  ],
];

/** What must stay visible: the app's own UI around the user content. */
const VISIBLE: [what: string, template: string, element: RegExp][] = [
  ['the Notes area', NOTES, /<div\b[^>]*class="col"[^>]*>/],
  ['the Folder name heading', NOTES, /<h1\b[^>]*>/],
  ['the Folders sidebar', 'features/folders/folders-sidebar/folders-sidebar.html', /<nav\b[^>]*>/],
  [
    'the confirm dialog (heading, buttons)',
    'shared/confirm-dialog/confirm-dialog.html',
    /<dialog\b[^>]*>/,
  ],
];

describe('Clarity masking (ADR-0011)', () => {
  it.each(MASKED)('masks %s', (what, template, element) => {
    const tag = read(template).match(element)?.[0];
    expect(tag, `${what}: not found in ${template}`).toBeDefined();
    expect(tag, `${what} in ${template}`).toContain('data-clarity-mask="true"');
  });

  it.each(VISIBLE)('keeps %s visible', (what, template, element) => {
    const tag = read(template).match(element)?.[0];
    expect(tag, `${what}: not found in ${template}`).toBeDefined();
    expect(tag, `${what} in ${template}`).not.toContain('data-clarity-mask');
  });
});
