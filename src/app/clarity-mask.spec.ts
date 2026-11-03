import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * ADR-0011: Microsoft Clarity records the screen. Whole content areas are masked, not single
 * elements, so nothing that shows user content (Note titles and text, Folder names, Due dates,
 * searches, names quoted in messages, aria-labels, the Account's photo and name) can slip through.
 */
const APP = join(process.cwd(), 'src/app');
const read = (template: string): string => readFileSync(join(APP, template), 'utf8');

/** The masked areas: template, the opening tag of the masked container, and what it covers. */
const MASKED_AREAS: [what: string, template: string, container: RegExp][] = [
  [
    'the Notes area (header, search, list, forms, empty states)',
    'features/notes/notes-view/notes-view.html',
    /^<div\b[^>]*class="col"[^>]*>/,
  ],
  [
    'the Folders sidebar (names, counts, folder form)',
    'features/folders/folders-sidebar/folders-sidebar.html',
    /^<nav\b[^>]*>/,
  ],
  [
    'confirm dialogs (quoted names)',
    'shared/confirm-dialog/confirm-dialog.html',
    /^<dialog\b[^>]*>/,
  ],
  [
    'the Account avatar (Google photo and name)',
    'features/shell/app-shell.html',
    /<span\b[^>]*class="avatar"[^>]*>/,
  ],
];

/** Templates that render Notes or Folders; each must sit inside a masked area. */
function contentTemplates(dir = APP): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return contentTemplates(path);
    return entry.name.endsWith('.html') ? [path.slice(APP.length + 1)] : [];
  });
}

describe('Clarity masking (ADR-0011)', () => {
  it.each(MASKED_AREAS)('masks %s', (what, template, container) => {
    const tag = read(template).match(container)?.[0];

    expect(tag, `${what}: container not found in ${template}`).toBeDefined();
    expect(tag, `${what} in ${template}`).toContain('data-clarity-mask="true"');
  });

  it('masks the whole template from its root wherever Notes or Folders are rendered', () => {
    const rendersContent = /note\.(title|text)|folder(Name|\.name)|label\(folder\)|query\(\)/;
    const covered = new Set(MASKED_AREAS.map(([, template]) => template));
    // Rendered only inside a masked area: the note form (Notes area), folder form (sidebar).
    covered.add('features/notes/note-form/note-form.html');
    covered.add('features/folders/folder-name-form/folder-name-form.html');
    // Only passes the Folder name on to the (masked) Notes area; shows nothing itself.
    covered.add('features/folders/folder-page/folder-page.html');

    const uncovered = contentTemplates().filter(
      (template) => rendersContent.test(read(template)) && !covered.has(template),
    );
    expect(uncovered).toEqual([]);
  });
});
