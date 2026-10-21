import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { FakeAuthService, provideFakeAuth, provideFakeOnlineStatus } from '../testing/fakes';
import { provideTestTranslations } from '../testing/translations';
import { App } from './app';
import { routes } from './app.routes';
import { UiLanguageService } from './core/i18n/ui-language.service';

async function open(url: string, auth: FakeAuthService): Promise<HTMLElement> {
  return (await openFixture(url, auth)).nativeElement as HTMLElement;
}

async function openFixture(url: string, auth: FakeAuthService) {
  TestBed.configureTestingModule({
    imports: [App],
    providers: [
      provideRouter(routes),
      provideTestTranslations(),
      provideFakeAuth(auth),
      provideFakeOnlineStatus(),
    ],
  });
  await TestBed.inject(UiLanguageService).init();
  const fixture = TestBed.createComponent(App);
  await TestBed.inject(Router).navigateByUrl(url);
  await fixture.whenStable();
  return fixture;
}

describe('App', () => {
  beforeEach(() => localStorage.clear());

  it('shows the login page to a visitor who is not signed in', async () => {
    const root = await open('/folders', new FakeAuthService());
    expect(TestBed.inject(Router).url).toBe('/login');
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Notes');
  });

  it('shows the app shell at /folders to a signed-in user', async () => {
    const auth = new FakeAuthService();
    auth.signInAs();
    const root = await open('/folders', auth);
    expect(TestBed.inject(Router).url).toBe('/folders');
    expect(root.querySelector('header')?.textContent).toContain('Sign out');
  });

  it('moves to /folders as soon as sign-in completes on the login page (popup)', async () => {
    const auth = new FakeAuthService();
    const fixture = await openFixture('/login', auth);

    auth.signInAs();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/folders');
  });

  it('returns to /login when the session ends elsewhere (e.g. signed out in another tab)', async () => {
    const auth = new FakeAuthService();
    auth.signInAs();
    const fixture = await openFixture('/folders', auth);

    auth.user.set(null);
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
