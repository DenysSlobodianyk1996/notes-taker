import { DEFAULT_THEME, THEMES, parseTheme } from './theme';

describe('parseTheme', () => {
  it('accepts the three Themes', () => {
    expect(parseTheme('orange')).toBe('orange');
    expect(parseTheme('pink')).toBe('pink');
    expect(parseTheme('purple')).toBe('purple');
  });

  it('falls back to Orange for anything else, such as a missing setting', () => {
    expect(parseTheme(undefined)).toBe('orange');
    expect(parseTheme('teal')).toBe('orange');
    expect(parseTheme(42)).toBe('orange');
    expect(DEFAULT_THEME).toBe('orange');
  });
});

describe('THEMES', () => {
  it('lists Orange first, with the accent colours from the design', () => {
    expect(THEMES.map((t) => [t.id, t.accent])).toEqual([
      ['orange', '#F59E0B'],
      ['pink', '#F472B6'],
      ['purple', '#A78BFA'],
    ]);
  });
});
