/** The Account's colour Theme (CONTEXT.md, ADR-0010). */
export type Theme = 'orange' | 'pink' | 'purple';

export const DEFAULT_THEME: Theme = 'orange';

/** The Themes in picker order, with each one's accent colour (design README, "Theme"). */
export const THEMES: readonly { id: Theme; accent: string }[] = [
  { id: 'orange', accent: '#F59E0B' },
  { id: 'pink', accent: '#F472B6' },
  { id: 'purple', accent: '#A78BFA' },
];

/** A stored Theme value; anything unknown or missing means the default, Orange. */
export function parseTheme(value: unknown): Theme {
  return THEMES.some((t) => t.id === value) ? (value as Theme) : DEFAULT_THEME;
}
