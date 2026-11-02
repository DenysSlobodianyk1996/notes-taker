import { TestBed } from '@angular/core/testing';
import { fakeDb, flushSnapshots } from '@testing/fake-firestore';
import { FakeAuthService, provideFakeAuth } from '@testing/fakes';
import { FIRESTORE } from '@core/firebase/firebase';
import { ThemeService } from './theme.service';

// Uses the global `vi` (no import): see folders.service.spec.ts.
vi.mock(
  'firebase/firestore',
  async () => (await import('@testing/fake-firestore')).fakeFirestoreModule,
);

let auth: FakeAuthService;

async function setup(signedIn = true): Promise<ThemeService> {
  auth = new FakeAuthService();
  if (signedIn) auth.signInAs({ uid: 'u1' });
  TestBed.configureTestingModule({
    providers: [provideFakeAuth(auth), { provide: FIRESTORE, useValue: {} }],
  });
  const theme = TestBed.inject(ThemeService);
  TestBed.tick();
  await flushSnapshots();
  TestBed.tick();
  return theme;
}

const html = (): HTMLElement => document.documentElement;
const themeColor = (): string | null =>
  document.querySelector('meta[name="theme-color"]')?.getAttribute('content') ?? null;
const favicon = (): string =>
  document.querySelector('link[rel="icon"][type="image/svg+xml"]')?.getAttribute('href') ?? '';

describe('ThemeService', () => {
  beforeEach(() => {
    fakeDb.reset();
    delete html().dataset['theme'];
    document.head.innerHTML =
      '<meta name="theme-color" content="#F59E0B"><link rel="icon" type="image/svg+xml" href="icons/icon.svg">';
  });

  it('uses Orange for an Account that never chose a Theme', async () => {
    const theme = await setup();

    expect(theme.theme()).toBe('orange');
    expect(html().dataset['theme']).toBe('orange');
  });

  it("applies the Account's saved Theme: accent, browser bar colour and tab icon", async () => {
    fakeDb.seed('users', 'u1', { theme: 'purple' });
    const theme = await setup();

    expect(theme.theme()).toBe('purple');
    expect(html().dataset['theme']).toBe('purple');
    expect(themeColor()).toBe('#A78BFA');
    expect(decodeURIComponent(favicon())).toContain('fill="#A78BFA"');
  });

  it('saves a new Theme in the Account, merged with other settings, and applies it at once', async () => {
    fakeDb.seed('users', 'u1', { other: 'kept' });
    const theme = await setup();

    theme.setTheme('pink');
    TestBed.tick();

    expect(html().dataset['theme']).toBe('pink');
    await flushSnapshots();
    expect(fakeDb.writes[0]).toEqual({ path: 'users/u1', data: { other: 'kept', theme: 'pink' } });
  });

  it('follows a Theme chosen on another device', async () => {
    const theme = await setup();

    fakeDb.set('users/u1', { theme: 'pink' });
    await flushSnapshots();
    TestBed.tick();

    expect(theme.theme()).toBe('pink');
  });

  it('goes back to Orange when signed out (the login page is always Orange)', async () => {
    fakeDb.seed('users', 'u1', { theme: 'purple' });
    const theme = await setup();

    auth.user.set(null);
    TestBed.tick();

    expect(theme.theme()).toBe('orange');
    expect(html().dataset['theme']).toBeUndefined();
    expect(themeColor()).toBe('#F59E0B');
  });
});
