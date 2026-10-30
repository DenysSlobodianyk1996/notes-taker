import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import {
  FakeAuthService,
  provideFakeAuth,
  provideFakeFolders,
  provideFakeOnlineStatus,
} from '../../../testing/fakes';
import { provideTestTranslations } from '../../../testing/translations';
import { routes } from '../../app.routes';

async function urlAfterVisiting(url: string, auth: FakeAuthService): Promise<string> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      provideTestTranslations(),
      provideFakeAuth(auth),
      provideFakeOnlineStatus(),
      provideFakeFolders(),
    ],
  });
  const router = TestBed.inject(Router);
  await router.navigateByUrl(url);
  return router.url;
}

describe('auth guards', () => {
  it.each(['/folders', '/', '/anything'])(
    'send a visitor who is not signed in from %s to /login',
    async (url) => {
      expect(await urlAfterVisiting(url, new FakeAuthService())).toBe('/login');
    },
  );

  it.each(['/login', '/', '/anything'])(
    'send a signed-in user from %s to their folders',
    async (url) => {
      const auth = new FakeAuthService();
      auth.signInAs();
      expect(await urlAfterVisiting(url, auth)).toBe('/folders/default');
    },
  );
});
