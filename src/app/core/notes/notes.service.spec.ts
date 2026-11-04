import { TestBed } from '@angular/core/testing';
import { FakeTimestamp, fakeDb, flushSnapshots } from '@testing/fake-firestore';
import { FakeAuthService, provideFakeAuth } from '@testing/fakes';
import { FIRESTORE } from '@core/firebase/firebase';
import { NotesService } from './notes.service';

// Uses the global `vi` (no import): see folders.service.spec.ts.
vi.mock(
  'firebase/firestore',
  async () => (await import('@testing/fake-firestore')).fakeFirestoreModule,
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

    const id = notes.createNote('work', {
      title: '  Groceries ',
      text: '\n Milk\nBread  \n',
      dueDate: null,
      links: [],
    });
    await flushSnapshots();

    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    const { path, data } = fakeDb.writes[0];
    expect(path).toBe(`${NOTES}/${id}`);
    expect(data).toMatchObject({
      folderId: 'work',
      title: 'Groceries',
      text: 'Milk\nBread',
      completed: false,
      dueDate: null,
      links: [],
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

    expect(() =>
      notes.createNote('', { title: '', text: 'Text', dueDate: null, links: [] }),
    ).toThrow();
    expect(fakeDb.writes).toHaveLength(0);
  });

  it('stores a Due date as a local day, and reads a missing one as none', async () => {
    seedNote('old', {});
    seedNote('dated', { dueDate: '2026-11-05' });
    const notes = await setup();

    notes.createNote('default', { title: '', text: 'Pay rent', dueDate: '2026-12-01', links: [] });
    await flushSnapshots();

    expect(fakeDb.writes[0].data).toMatchObject({ dueDate: '2026-12-01' });
    const byId = new Map(notes.notesIn('default').map((n) => [n.text, n.dueDate]));
    expect(byId.get('old')).toBeNull();
    expect(byId.get('dated')).toBe('2026-11-05');
  });

  it('edits a Note: trimmed values, Due date changed or cleared, updatedAt bumped', async () => {
    seedNote('n1', { title: 'Old', dueDate: '2026-11-05' });
    const notes = await setup();

    notes.updateNote('n1', { title: ' New ', text: ' Text ', dueDate: null, links: [] });
    await flushSnapshots();

    const { path, data } = fakeDb.writes[0];
    expect(path).toBe(`${NOTES}/n1`);
    expect(data).toMatchObject({ title: 'New', text: 'Text', dueDate: null });
    expect((data['updatedAt'] as FakeTimestamp).toDate().getTime()).toBeGreaterThan(
      new Date('2026-01-01').getTime(),
    );
    expect(data['createdAt']).toEqual(FakeTimestamp.fromDate(new Date('2026-01-01')));
  });

  it('toggles a Note Completed and back', async () => {
    seedNote('n1', {});
    const notes = await setup();

    notes.toggleNote('n1');
    await flushSnapshots();
    expect(notes.notesIn('default')[0].completed).toBe(true);

    notes.toggleNote('n1');
    await flushSnapshots();
    expect(notes.notesIn('default')[0].completed).toBe(false);
  });

  it('deletes a Note', async () => {
    seedNote('n1', {});
    seedNote('n2', {});
    const notes = await setup();

    notes.deleteNote('n1');
    await flushSnapshots();

    expect(notes.notesIn('default').map((n) => n.id)).toEqual(['n2']);
  });

  it('reads an impossible Due date as none', async () => {
    seedNote('bad', { dueDate: '2026-02-31' });
    const notes = await setup();

    expect(notes.notesIn('default')[0].dueDate).toBeNull();
  });

  it("stores a Note's Links when creating and editing it", async () => {
    seedNote('n1', {});
    const notes = await setup();
    const links = ['https://example.com/', 'https://docs.example.com/a'];

    notes.createNote('default', { title: '', text: 'Trip', dueDate: null, links });
    notes.updateNote('n1', { title: '', text: 'n1', dueDate: null, links: [] });
    await flushSnapshots();

    expect(fakeDb.writes[0].data).toMatchObject({ links });
    expect(fakeDb.writes[1].data).toMatchObject({ links: [] });
    expect(notes.notesIn('default').find((n) => n.text === 'Trip')?.links).toEqual(links);
  });

  it('reads missing Links as none, and drops any that are not safe https Links', async () => {
    seedNote('old', {});
    seedNote('mixed', {
      links: [
        'https://ok.example.com/',
        'http://plain.example.com/',
        'javascript:alert(1)',
        'example.com',
        42,
        'https://ok.example.com/',
        'https://two.example.com/',
        `https://long.example.com/${'a'.repeat(2048)}`,
      ],
    });
    seedNote('many', { links: [1, 2, 3, 4, 5, 6].map((n) => `https://e${n}.example.com/`) });
    seedNote('notAList', { links: 'https://example.com/' });
    const notes = await setup();

    const byText = new Map(notes.notesIn('default').map((n) => [n.text, n.links]));
    expect(byText.get('old')).toEqual([]);
    expect(byText.get('mixed')).toEqual(['https://ok.example.com/', 'https://two.example.com/']);
    expect(byText.get('many')).toHaveLength(5);
    expect(byText.get('notAList')).toEqual([]);
  });
});
