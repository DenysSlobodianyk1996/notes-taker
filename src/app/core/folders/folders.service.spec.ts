import { TestBed } from '@angular/core/testing';
import { FakeTimestamp, fakeDb, flushSnapshots } from '../../../testing/fake-firestore';
import { FakeAuthService, provideFakeAuth } from '../../../testing/fakes';
import { FIRESTORE } from '../firebase/firebase';
import { FoldersService } from './folders.service';

// Uses the global `vi` (no import): another file in this bundle imports `vi` too, so an imported
// one gets renamed and Vitest no longer finds `vi.mock` to hoist it.
vi.mock(
  'firebase/firestore',
  async () => (await import('../../../testing/fake-firestore')).fakeFirestoreModule,
);

const FOLDERS = 'users/u1/folders';

let auth: FakeAuthService;

function setup(): FoldersService {
  auth = new FakeAuthService();
  auth.signInAs({ uid: 'u1' });
  TestBed.configureTestingModule({
    providers: [provideFakeAuth(auth), { provide: FIRESTORE, useValue: {} }],
  });
  return TestBed.inject(FoldersService);
}

function seedFolder(id: string, fields: Record<string, unknown>): void {
  fakeDb.seed(FOLDERS, id, {
    name: id,
    nameKey: id,
    isDefault: false,
    createdAt: FakeTimestamp.fromDate(new Date('2026-01-01')),
    ...fields,
  });
}

describe('FoldersService', () => {
  beforeEach(() => fakeDb.reset());

  it("lists the signed-in Account's Folders, Default folder first, then oldest first", async () => {
    seedFolder('travel', {
      name: 'Travel',
      createdAt: FakeTimestamp.fromDate(new Date('2026-03-01')),
    });
    seedFolder('default', { name: '', nameKey: '', isDefault: true });
    seedFolder('work', { name: 'Work', createdAt: FakeTimestamp.fromDate(new Date('2026-02-01')) });
    const folders = setup();

    const list = await folders.whenLoaded();

    expect(list.map((f) => f.id)).toEqual(['default', 'work', 'travel']);
    expect(folders.folders()[0]).toMatchObject({ name: '', isDefault: true });
    expect(folders.folders()[1].createdAt).toEqual(new Date('2026-02-01'));
  });

  it('creates the Default folder for an Account with no folders', async () => {
    const folders = setup();

    await folders.ensureDefaultFolder();
    const list = await folders.whenLoaded();

    expect(fakeDb.writes).toHaveLength(1);
    const { path, data } = fakeDb.writes[0];
    expect(path).toBe('users/u1/folders/default');
    expect(data).toMatchObject({ name: '', nameKey: '', isDefault: true });
    expect(data['createdAt']).toBeInstanceOf(FakeTimestamp);
    expect(list).toEqual([expect.objectContaining({ id: 'default', isDefault: true })]);
  });

  it('creates only one Default folder however often it is asked', async () => {
    const folders = setup();

    await Promise.all([folders.ensureDefaultFolder(), folders.ensureDefaultFolder()]);
    await flushSnapshots();
    await folders.ensureDefaultFolder();

    expect(fakeDb.writes).toHaveLength(1);
  });

  it('gives two devices creating it at once a single Default folder', async () => {
    const folders = setup();
    await folders.ensureDefaultFolder();
    // Another device wrote it too, before this one's write reached the server.
    fakeDb.set('users/u1/folders/default', { name: '', nameKey: '', isDefault: true });
    await flushSnapshots();

    expect(folders.folders()).toHaveLength(1);
  });

  it('leaves an Account that already has a Default folder unchanged', async () => {
    seedFolder('default', { name: '', nameKey: '', isDefault: true });
    seedFolder('work', { name: 'Work' });
    const folders = setup();

    await folders.ensureDefaultFolder();

    expect(fakeDb.writes).toHaveLength(0);
  });

  it('waits until the Account has a Folder before reporting the list as loaded', async () => {
    const folders = setup();
    let loaded = false;
    void folders.whenLoaded().then(() => (loaded = true));

    await flushSnapshots();
    expect(loaded).toBe(false);

    await folders.ensureDefaultFolder();
    await flushSnapshots();
    expect(loaded).toBe(true);
  });

  it('reports a Folder list that cannot be loaded instead of waiting forever', async () => {
    const folders = setup();
    const loading = folders.whenLoaded();

    fakeDb.failListeners(new Error('permission-denied'));

    await expect(loading).rejects.toThrow('permission-denied');
  });

  it('forgets the Folders on sign-out and loads them afresh on the next sign-in', async () => {
    seedFolder('default', { name: '', nameKey: '', isDefault: true });
    const folders = setup();
    await folders.whenLoaded();

    auth.user.set(null);
    TestBed.tick();
    expect(folders.folders()).toEqual([]);

    seedFolder('work', { name: 'Work' });
    auth.signInAs({ uid: 'u1' });
    expect((await folders.whenLoaded()).map((f) => f.id)).toEqual(['default', 'work']);
  });
});
