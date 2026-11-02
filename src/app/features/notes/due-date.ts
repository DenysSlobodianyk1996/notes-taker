import { UiLanguage } from '@core/i18n/ui-language';

const LOCALES: Record<UiLanguage, string> = { en: 'en-GB', uk: 'uk-UA' };
const formatters = new Map<string, Intl.DateTimeFormat>();

/** One formatter per language and "with year", reused: building them is costly. */
function formatter(lang: UiLanguage, withYear: boolean): Intl.DateTimeFormat {
  const key = `${lang}:${withYear}`;
  let format = formatters.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(LOCALES[lang], {
      day: 'numeric',
      month: 'short',
      ...(withYear ? { year: 'numeric' } : {}),
    });
    formatters.set(key, format);
  }
  return format;
}

/**
 * A Due date (`'YYYY-MM-DD'`) for display: "5 Nov" / "5 лист.", with the year when it isn't this
 * year. Read as a local date, so it never shifts a day.
 */
export function formatDueDate(day: string, lang: UiLanguage, now: Date = new Date()): string {
  const [year, month, date] = day.split('-').map(Number);
  const local = new Date(year, month - 1, date);
  local.setFullYear(year); // years below 100 would otherwise mean 19xx
  return formatter(lang, year !== now.getFullYear()).format(local);
}
