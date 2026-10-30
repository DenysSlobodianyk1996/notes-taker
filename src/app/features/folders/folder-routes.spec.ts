import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import {
  FakeAuthService,
  FakeFoldersService,
  aDefaultFolder,
  aFolder,
  provideFakeAuth,
  provideFakeFolders,
} from '../../../testing/fakes';
import { provideTestTranslations } from '../../../testing/translations';
import { routes } from '../../app.routes';

async function urlAfterVisiting(
  url: string,
  folders: FakeFoldersService,
  auth = signedIn(),
): Promise<string> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      provideTestTranslations(),
      provideFakeAuth(auth),
      provideFakeFolders(folders),
    ],
  });
  const router = TestBed.inject(Router);
  await router.navigateByUrl(url);
  return router.url;
}

function signedIn(): FakeAuthService {
  const auth = new FakeAuthService();
  auth.signInAs();
  return auth;
}

describe('folder routes', () => {
  it('create the Default folder on first sign-in and open it', async () => {
    const folders = new FakeFoldersService();

    expect(await urlAfterVisiting('/folders', folders)).toBe('/folders/default');
    expect(folders.ensureDefaultFolder).toHaveBeenCalled();
    expect(folders.folders()).toHaveLength(1);
  });

  it('open the first Folder when no Folder is chosen', async () => {
    const folders = new FakeFoldersService();
    folders.folders.set([aDefaultFolder({ id: 'g1' }), aFolder({ id: 'work' })]);

    expect(await urlAfterVisiting('/folders', folders)).toBe('/folders/g1');
  });

  it('keep the chosen Folder, so a refresh stays on it', async () => {
    const folders = new FakeFoldersService();
    folders.folders.set([aDefaultFolder(), aFolder({ id: 'work' })]);

    expect(await urlAfterVisiting('/folders/work', folders)).toBe('/folders/work');
  });

  it('send an unknown Folder id to the first Folder', async () => {
    const folders = new FakeFoldersService();
    folders.folders.set([aDefaultFolder(), aFolder({ id: 'work' })]);

    expect(await urlAfterVisiting('/folders/deleted-id', folders)).toBe('/folders/default');
  });

  it('send a user whose session ended to the login page when they pick a Folder', async () => {
    const folders = new FakeFoldersService();
    folders.folders.set([aDefaultFolder(), aFolder({ id: 'work' })]);
    const auth = signedIn();
    await urlAfterVisiting('/folders/default', folders, auth);

    auth.user.set(null);
    await TestBed.inject(Router).navigateByUrl('/folders/work');

    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
