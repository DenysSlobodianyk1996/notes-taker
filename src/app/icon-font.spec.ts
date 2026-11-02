import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * index.html loads only the Material Symbols the app uses (`icon_names=`), so the font is small
 * enough for the service worker to keep for offline use. Every icon in a template must be listed.
 */
const SRC = join(process.cwd(), 'src');

/** Every template: .html files, plus inline `template:` strings in components. */
function templates(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return templates(path);
    if (entry.name.endsWith('.html')) return [readFileSync(path, 'utf8')];
    if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
      return [readFileSync(path, 'utf8')];
    }
    return [];
  });
}

/** The icon spans: any element whose class list includes material-symbols-outlined. */
const ICON_SPAN = /class="[^"]*\bmaterial-symbols-outlined\b[^"]*"[^>]*>([\s\S]*?)<\//g;

function iconsIn(contents: readonly string[]): { names: string[]; unresolved: string[] } {
  const names = new Set<string>();
  const unresolved: string[] = [];
  for (const html of contents) {
    for (const [, raw] of html.matchAll(ICON_SPAN)) {
      const inner = raw.trim();
      const quoted = [...inner.matchAll(/'([a-z0-9_]+)'/g)].map(([, name]) => name);
      if (/^[a-z0-9_]+$/.test(inner)) names.add(inner);
      else if (quoted.length) quoted.forEach((name) => names.add(name));
      else unresolved.push(inner);
    }
  }
  return { names: [...names].sort(), unresolved };
}

function loadedIcons(): string[] {
  const index = readFileSync(join(SRC, 'index.html'), 'utf8');
  const list = index.match(/icon_names=([a-z0-9_,]+)/)?.[1] ?? '';
  return list.split(',').filter(Boolean);
}

describe('icon font', () => {
  it('loads every Material Symbol the templates use', () => {
    const loaded = new Set(loadedIcons());
    const { names } = iconsIn(templates(join(SRC, 'app')));

    expect(names.filter((name) => !loaded.has(name))).toEqual([]);
  });

  it('can tell which icon every icon span shows (names come from the template, not code)', () => {
    expect(iconsIn(templates(join(SRC, 'app'))).unresolved).toEqual([]);
  });

  it('lists the icon names in alphabetical order, as Google Fonts requires', () => {
    const loaded = loadedIcons();
    expect(loaded.length).toBeGreaterThan(0);
    expect(loaded).toEqual([...loaded].sort());
  });

  it('notices icons on spans with extra classes and in inline templates', () => {
    const found = iconsIn([
      '<span class="material-symbols-outlined filled" aria-hidden="true">star</span>',
      'template: \'<span class="small material-symbols-outlined">translate</span>\'',
      '<span class="material-symbols-outlined">{{ icon() }}</span>',
    ]);
    expect(found.names).toEqual(['star', 'translate']);
    expect(found.unresolved).toEqual(['{{ icon() }}']);
  });
});
