import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTestTranslations } from '../testing/translations';
import { App } from './app';
import { routes } from './app.routes';
import { UiLanguageService } from './core/i18n/ui-language.service';

describe('App', () => {
  it('opens the login page for any URL', async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideTestTranslations()],
    });
    await TestBed.inject(UiLanguageService).init();
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/anything');
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/login');
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent?.trim()).toBe(
      'Notes',
    );
  });
});
