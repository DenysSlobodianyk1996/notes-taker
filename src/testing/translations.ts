import { EnvironmentProviders, Provider } from '@angular/core';
import {
  TranslateLoader,
  TranslationObject,
  provideTranslateLoader,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import en from '../../public/i18n/en.json';
import uk from '../../public/i18n/uk.json';

/** Serves the real translation files from memory, so tests see the app's actual texts. */
class InMemoryTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    return of((lang === 'uk' ? uk : en) as TranslationObject);
  }
}

export function provideTestTranslations(): (Provider | EnvironmentProviders)[] {
  return provideTranslateService({
    fallbackLang: 'en',
    loader: provideTranslateLoader(InMemoryTranslateLoader),
  });
}
