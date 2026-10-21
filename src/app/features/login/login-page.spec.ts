import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getButton as button } from '../../../testing/dom';
import { provideTestTranslations } from '../../../testing/translations';
import { UiLanguageService } from '../../core/i18n/ui-language.service';
import { LoginPage } from './login-page';

async function render(): Promise<ComponentFixture<LoginPage>> {
  TestBed.configureTestingModule({
    imports: [LoginPage],
    providers: [provideTestTranslations()],
  });
  await TestBed.inject(UiLanguageService).init();
  const fixture = TestBed.createComponent(LoginPage);
  await fixture.whenStable();
  return fixture;
}

describe('LoginPage', () => {
  beforeEach(() => localStorage.clear());

  it('shows the app name, the Google sign-in button and the sync hint in English', async () => {
    const root = (await render()).nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Notes');
    expect(button(root, 'Sign in with Google')).toBeTruthy();
    expect(root.textContent).toContain('Your notes sync across all your devices.');
  });

  it('offers no guest option', async () => {
    const root = (await render()).nativeElement as HTMLElement;
    expect(root.textContent?.toLowerCase()).not.toContain('guest');
  });

  it('switches the whole card to Ukrainian with the UA toggle, and marks UA as pressed', async () => {
    const fixture = await render();
    const root = fixture.nativeElement as HTMLElement;

    button(root, 'UA').click();
    await fixture.whenStable();

    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Нотатки');
    expect(button(root, 'Увійти через Google')).toBeTruthy();
    expect(button(root, 'UA').getAttribute('aria-pressed')).toBe('true');
    expect(button(root, 'EN').getAttribute('aria-pressed')).toBe('false');
  });
});
