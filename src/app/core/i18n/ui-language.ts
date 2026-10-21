/** The app's own interface languages (CONTEXT.md "UI language"). Never applied to user content. */
export const UI_LANGUAGES = ['en', 'uk'] as const;

export type UiLanguage = (typeof UI_LANGUAGES)[number];

export function isUiLanguage(value: unknown): value is UiLanguage {
  return UI_LANGUAGES.includes(value as UiLanguage);
}

/** Saved choice on this device wins; otherwise Ukrainian browsers get UA, everyone else EN. */
export function initialUiLanguage(saved: string | null, browserLanguage: string): UiLanguage {
  if (isUiLanguage(saved)) return saved;
  return browserLanguage.toLowerCase().startsWith('uk') ? 'uk' : 'en';
}
