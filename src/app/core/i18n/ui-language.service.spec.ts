import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { provideTestTranslations } from '../../../testing/translations';
import { UI_LANGUAGE_STORAGE_KEY, UiLanguageService } from './ui-language.service';

function setup(): { service: UiLanguageService; translate: TranslateService } {
  TestBed.configureTestingModule({ providers: [provideTestTranslations()] });
  const service = TestBed.inject(UiLanguageService);
  return { service, translate: TestBed.inject(TranslateService) };
}

describe('UiLanguageService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });

  it('starts with the UI language saved on this device', () => {
    localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, 'uk');
    const { service } = setup();
    service.init();
    expect(service.current()).toBe('uk');
    expect(document.documentElement.lang).toBe('uk');
  });

  it('switching to UA translates the interface, remembers the choice and sets <html lang>', async () => {
    const { service, translate } = setup();
    service.init();
    await service.use('uk');

    expect(service.current()).toBe('uk');
    expect(translate.instant('login.signInGoogle')).toBe('Увійти через Google');
    expect(localStorage.getItem(UI_LANGUAGE_STORAGE_KEY)).toBe('uk');
    expect(document.documentElement.lang).toBe('uk');
  });

  it('switching back to EN restores English labels', async () => {
    const { service, translate } = setup();
    service.init();
    await service.use('uk');
    await service.use('en');

    expect(translate.instant('login.signInGoogle')).toBe('Sign in with Google');
    expect(localStorage.getItem(UI_LANGUAGE_STORAGE_KEY)).toBe('en');
  });
});
