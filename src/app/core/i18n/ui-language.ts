/** The app's own interface language (CONTEXT.md "UI language"). Never applied to user content. */
export type UiLanguage = 'en' | 'uk';

export const UI_LANGUAGES: readonly UiLanguage[] = ['en', 'uk'];

export function isUiLanguage(value: unknown): value is UiLanguage {
  return value === 'en' || value === 'uk';
}

/** Saved choice on this device wins; otherwise Ukrainian browsers get UA, everyone else EN. */
export function initialUiLanguage(saved: string | null, browserLanguage: string): UiLanguage {
  if (isUiLanguage(saved)) return saved;
  return browserLanguage.toLowerCase().startsWith('uk') ? 'uk' : 'en';
}
