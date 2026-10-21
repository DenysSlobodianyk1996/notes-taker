import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { getButton } from '../../../testing/dom';
import { FakeAuthService, provideFakeAuth } from '../../../testing/fakes';
import { provideTestTranslations } from '../../../testing/translations';
import { UiLanguageService } from '../../core/i18n/ui-language.service';
import { AppShell } from './app-shell';

async function render(auth: FakeAuthService): Promise<ComponentFixture<AppShell>> {
  TestBed.configureTestingModule({
    imports: [AppShell],
    providers: [provideRouter([]), provideTestTranslations(), provideFakeAuth(auth)],
  });
  await TestBed.inject(UiLanguageService).init();
  const fixture = TestBed.createComponent(AppShell);
  await fixture.whenStable();
  return fixture;
}

describe('AppShell', () => {
  beforeEach(() => localStorage.clear());

  it('shows a header with the app name, the EN | UA toggle and Sign out', async () => {
    const auth = new FakeAuthService();
    auth.signInAs();
    const header = (await render(auth)).nativeElement.querySelector('header') as HTMLElement;

    expect(header.textContent).toContain('Notes');
    expect(getButton(header, 'EN')).toBeTruthy();
    expect(getButton(header, 'UA')).toBeTruthy();
    expect(getButton(header, 'Sign out')).toBeTruthy();
  });

  it('signs out through the auth service', async () => {
    const auth = new FakeAuthService();
    auth.signInAs();
    const root = (await render(auth)).nativeElement as HTMLElement;

    getButton(root, 'Sign out').click();

    expect(auth.signOut).toHaveBeenCalledTimes(1);
  });

  it('shows the Google photo as the avatar', async () => {
    const auth = new FakeAuthService();
    auth.signInAs({ photoURL: 'https://example.com/ada.png' });
    const root = (await render(auth)).nativeElement as HTMLElement;

    const img = root.querySelector<HTMLImageElement>('.avatar img');
    expect(img?.getAttribute('src')).toBe('https://example.com/ada.png');
    expect(img?.getAttribute('alt')).toBe('Ada Lovelace');
  });

  it('falls back to a person icon when there is no photo, or it fails to load', async () => {
    const auth = new FakeAuthService();
    auth.signInAs({ photoURL: 'https://example.com/broken.png' });
    const fixture = await render(auth);
    const root = fixture.nativeElement as HTMLElement;

    root.querySelector('.avatar img')?.dispatchEvent(new Event('error'));
    await fixture.whenStable();

    expect(root.querySelector('.avatar img')).toBeNull();
    expect(root.querySelector('.avatar')?.textContent?.trim()).toBe('person');
  });
});
