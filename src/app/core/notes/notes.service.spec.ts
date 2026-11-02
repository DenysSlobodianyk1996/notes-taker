import { TestBed } from '@angular/core/testing';
import { FakeTimestamp, fakeDb, flushSnapshots } from '../../../testing/fake-firestore';
import { FakeAuthService, provideFakeAuth } from '../../../testing/fakes';
import { FIRESTORE } from '../firebase/firebase';
import { NotesService } from './notes.service';

// Uses the global `vi` (no import): see folders.service.spec.ts.
vi.mock(
  'firebase/firestore',
  async () => (await import('../../../testing/fake-firestore')).fakeFirestoreModule,
);

const NOTES = 'users/u1/notes';
let auth: FakeAuthService;

async function setup(): Promise<NotesService> {
  auth = new FakeAuthService();
  auth.signInAs({ uid: 'u1' });
  TestBed.configureTestingModule({
    providers: [provideFakeAuth(auth), { provide: FIRESTORE, useValue: {} }],
  });
  const notes = TestBed.inject(NotesService);
  TestBed.tick();
  await flushSnapshots();
  return notes;
}

function seedNote(id: string, fields: Record<string, unknown>): void {
  const at = FakeTimestamp.fromDate(new Date('2026-01-01'));
  fakeDb.seed(NOTES, id, {
    folderId: 'default',
    title: '',
    text: id,
    completed: false,
    createdAt: at,
    updatedAt: at,
    ...fields,
  });
}

describe('NotesService', () => {
  beforeEach(() => fakeDb.reset());

  it("lists a Folder's Notes newest first", async () => {
    seedNote('old', { createdAt: FakeTimestamp.fromDate(new Date('2026-01-01')) });
    seedNote('new', { createdAt: FakeTimestamp.fromDate(new Date('2026-03-01')) });
    seedNote('elsewhere', { folderId: 'work' });
    const notes = await setup();

    expect(notes.notesIn('default').map((n) => n.id)).toEqual(['new', 'old']);
    expect(notes.notesIn('default')[0]).toMatchObject({
      folderId: 'default',
      text: 'new',
      completed: false,
      createdAt: new Date('2026-03-01'),
    });
  });

  it('counts the Notes in each Folder', async () => {
    seedNote('a', {});
    seedNote('b', {});
    seedNote('c', { folderId: 'work' });
    const notes = await setup();

    expect(notes.countIn('default')).toBe(2);
    expect(notes.countIn('work')).toBe(1);
    expect(notes.countIn('travel')).toBe(0);
  });

  it('creates a Note with trimmed values, not Completed, and lists it', async () => {
    const notes = await setup();

    const id = notes.createNote('work', '  Groceries ', '\n Milk\nBread  \n');
    await flushSnapshots();

    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    const { path, data } = fakeDb.writes[0];
    expect(path).toBe(`${NOTES}/${id}`);
    expect(data).toMatchObject({
      folderId: 'work',
      title: 'Groceries',
      text: 'Milk\nBread',
      completed: false,
    });
    expect(data['createdAt']).toBeInstanceOf(FakeTimestamp);
    expect(data['updatedAt']).toEqual(data['createdAt']);
    expect(notes.notesIn('work').map((n) => n.id)).toEqual([id]);
  });

  it('forgets the Notes on sign-out', async () => {
    seedNote('a', {});
    const notes = await setup();

    auth.user.set(null);
    TestBed.tick();

    expect(notes.notesIn('default')).toEqual([]);
  });

  it('reports the Notes as loaded only once Firestore has answered', async () => {
    auth = new FakeAuthService();
    auth.signInAs({ uid: 'u1' });
    TestBed.configureTestingModule({
      providers: [provideFakeAuth(auth), { provide: FIRESTORE, useValue: {} }],
    });
    const notes = TestBed.inject(NotesService);
    TestBed.tick();
    expect(notes.loaded()).toBe(false);

    await flushSnapshots();
    expect(notes.loaded()).toBe(true);
  });

  it('refuses a Note without a Folder', async () => {
    const notes = await setup();

    expect(() => notes.createNote('', '', 'Text')).toThrow();
    expect(fakeDb.writes).toHaveLength(0);
  });
});
