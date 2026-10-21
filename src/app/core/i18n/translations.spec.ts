import en from '../../../../public/i18n/en.json';
import uk from '../../../../public/i18n/uk.json';

function keyPaths(node: unknown, prefix = ''): string[] {
  if (typeof node !== 'object' || node === null) return [prefix];
  return Object.entries(node).flatMap(([key, value]) =>
    keyPaths(value, prefix ? `${prefix}.${key}` : key),
  );
}

describe('translation files', () => {
  it('EN and UA define exactly the same keys', () => {
    expect(keyPaths(uk).sort()).toEqual(keyPaths(en).sort());
  });

  it('every translation is a non-empty string', () => {
    for (const [lang, file] of Object.entries({ en, uk })) {
      for (const path of keyPaths(file)) {
        const value = path
          .split('.')
          .reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], file);
        expect(typeof value === 'string' && value.trim().length > 0, `${lang}: ${path}`).toBe(true);
      }
    }
  });

  it('the Default folder has a display name in both languages', () => {
    expect(en.folders.defaultName).toBe('General');
    expect(uk.folders.defaultName).toBe('Загальне');
  });
});
