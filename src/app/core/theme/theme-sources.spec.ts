import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { THEMES } from '@domain/theme';
import { FAVICON_GLYPH_PATH } from './theme.service';

/** Theme colours and the tab icon live in two places each; these keep them in step. */
const read = (path: string): string => readFileSync(join(process.cwd(), path), 'utf8');

describe('Theme sources', () => {
  it('uses the same accent per Theme in TypeScript and in styles.scss', () => {
    const scss = read('src/styles.scss');
    const accentOf = (selector: RegExp): string | undefined =>
      scss.match(selector)?.[1]?.toLowerCase();

    for (const { id, accent } of THEMES) {
      const block =
        id === 'orange'
          ? /:root \{[^}]*--accent: (#[0-9a-f]{6});/i
          : new RegExp(`:root\\[data-theme='${id}'\\] \\{[^}]*--accent: (#[0-9a-f]{6});`, 'i');
      expect(accentOf(block), id).toBe(accent.toLowerCase());
    }
  });

  it('draws the tab icon with the same glyph as public/icons/icon.svg', () => {
    expect(read('public/icons/icon.svg')).toContain(`d="${FAVICON_GLYPH_PATH}"`);
  });
});
