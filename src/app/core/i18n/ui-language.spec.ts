import { initialUiLanguage } from './ui-language';

describe('initialUiLanguage', () => {
  it('uses the UI language saved on this device', () => {
    expect(initialUiLanguage('uk', 'en-US')).toBe('uk');
    expect(initialUiLanguage('en', 'uk-UA')).toBe('en');
  });

  it('falls back to Ukrainian when the browser language is Ukrainian', () => {
    expect(initialUiLanguage(null, 'uk')).toBe('uk');
    expect(initialUiLanguage(null, 'uk-UA')).toBe('uk');
  });

  it('falls back to English for any other browser language', () => {
    expect(initialUiLanguage(null, 'de-DE')).toBe('en');
    expect(initialUiLanguage(null, 'ru')).toBe('en');
    expect(initialUiLanguage(null, '')).toBe('en');
  });

  it('ignores a saved value that is not a supported UI language', () => {
    expect(initialUiLanguage('fr', 'uk-UA')).toBe('uk');
  });
});
