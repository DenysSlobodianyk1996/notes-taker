import { ComponentFixture, TestBed } from '@angular/core/testing';
import { accessibleName, getButton } from '../../../testing/dom';
import {
  FakeAuthService,
  FakeOnlineStatus,
  provideFakeAuth,
  provideFakeOnlineStatus,
} from '../../../testing/fakes';
import { provideTestTranslations } from '../../../testing/translations';
import { UiLanguageService } from '../../core/i18n/ui-language.service';
import { LoginPage } from './login-page';

interface Rendered {
  fixture: ComponentFixture<LoginPage>;
  root: HTMLElement;
  auth: FakeAuthService;
  network: FakeOnlineStatus;
}

async function render({ online = true } = {}): Promise<Rendered> {
  const auth = new FakeAuthService();
  const network = new FakeOnlineStatus();
  network.online.set(online);
  TestBed.configureTestingModule({
    imports: [LoginPage],
    providers: [provideTestTranslations(), provideFakeAuth(auth), provideFakeOnlineStatus(network)],
  });
  await TestBed.inject(UiLanguageService).init();
  const fixture = TestBed.createComponent(LoginPage);
  await fixture.whenStable();
  return { fixture, root: fixture.nativeElement as HTMLElement, auth, network };
}

const OFFLINE_NOTE = "You're offline. Connect to sign in.";
const SYNC_HINT = 'Your notes sync across all your devices.';

describe('LoginPage', () => {
  beforeEach(() => localStorage.clear());

  it('shows the app name, the Google sign-in button and the sync hint in English', async () => {
    const { root } = await render();
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Notes');
    expect(getButton(root, 'Sign in with Google').disabled).toBe(false);
    expect(root.textContent).toContain(SYNC_HINT);
    expect(root.textContent).not.toContain(OFFLINE_NOTE);
  });

  it('offers no guest option', async () => {
    const { root } = await render();
    expect(root.textContent?.toLowerCase()).not.toContain('guest');
  });

  it('starts Google sign-in when the button is clicked', async () => {
    const { root, auth } = await render();
    getButton(root, 'Sign in with Google').click();
    expect(auth.signIn).toHaveBeenCalledTimes(1);
  });

  it('when offline, disables the button and shows the offline note instead of the sync hint', async () => {
    const { root } = await render({ online: false });
    expect(getButton(root, 'Sign in with Google').disabled).toBe(true);
    expect(accessibleName(root.querySelector('[role="status"]')!)).toBe(OFFLINE_NOTE);
    expect(root.textContent).not.toContain(SYNC_HINT);
  });

  it('enables the button again when the connection returns, without a reload', async () => {
    const { fixture, root, network } = await render({ online: false });
    network.online.set(true);
    await fixture.whenStable();
    expect(getButton(root, 'Sign in with Google').disabled).toBe(false);
    expect(root.textContent).toContain(SYNC_HINT);
  });

  it('switches the whole card to Ukrainian with the UA toggle, and marks UA as pressed', async () => {
    const { fixture, root } = await render();

    getButton(root, 'UA').click();
    await fixture.whenStable();

    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Нотатки');
    expect(getButton(root, 'Увійти через Google')).toBeTruthy();
    expect(getButton(root, 'UA').getAttribute('aria-pressed')).toBe('true');
    expect(getButton(root, 'EN').getAttribute('aria-pressed')).toBe('false');
  });
});
