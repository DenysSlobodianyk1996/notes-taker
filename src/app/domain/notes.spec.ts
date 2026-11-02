import { Note, isOverdue, noteFormErrors, noteSummary, sortNotes, todayKey } from './notes';

function note(fields: Partial<Note>): Note {
  return {
    id: 'n',
    folderId: 'default',
    title: '',
    text: 'Text',
    completed: false,
    dueDate: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...fields,
  };
}

describe('sortNotes', () => {
  it('lists Notes newest first', () => {
    const old = note({ id: 'old', createdAt: new Date('2026-01-01') });
    const fresh = note({ id: 'fresh', createdAt: new Date('2026-03-01') });
    const mid = note({ id: 'mid', createdAt: new Date('2026-02-01') });

    expect(sortNotes([old, fresh, mid]).map((n) => n.id)).toEqual(['fresh', 'mid', 'old']);
  });

  it('keeps Completed Notes in place', () => {
    const done = note({ id: 'done', completed: true, createdAt: new Date('2026-03-01') });
    const open = note({ id: 'open', createdAt: new Date('2026-02-01') });

    expect(sortNotes([open, done]).map((n) => n.id)).toEqual(['done', 'open']);
  });

  it('keeps a stable order for Notes created at the same moment', () => {
    expect(sortNotes([note({ id: 'b' }), note({ id: 'a' })]).map((n) => n.id)).toEqual(['a', 'b']);
  });
});

describe('noteFormErrors', () => {
  it('accepts a Text with no Title', () => {
    expect(noteFormErrors({ title: '', text: 'Buy milk' })).toEqual({});
  });

  it('requires a Text that is more than spaces', () => {
    expect(noteFormErrors({ title: 'Title', text: '' })).toEqual({ text: 'required' });
    expect(noteFormErrors({ title: '', text: ' \n ' })).toEqual({ text: 'required' });
  });

  it('allows up to 1000 characters of Text after trimming', () => {
    expect(noteFormErrors({ title: '', text: ` ${'a'.repeat(1000)} ` })).toEqual({});
    expect(noteFormErrors({ title: '', text: 'a'.repeat(1001) })).toEqual({ text: 'maxLength' });
  });

  it('allows up to 200 characters of Title after trimming', () => {
    expect(noteFormErrors({ title: 'a'.repeat(200), text: 'x' })).toEqual({});
    expect(noteFormErrors({ title: 'a'.repeat(201), text: 'x' })).toEqual({ title: 'maxLength' });
  });
});

describe('noteSummary', () => {
  it('counts the Notes and the Completed ones', () => {
    const notes = [note({ completed: true }), note({}), note({ completed: true })];

    expect(noteSummary(notes)).toEqual({ count: 3, completed: 2 });
    expect(noteSummary([])).toEqual({ count: 0, completed: 0 });
  });
});

describe('todayKey', () => {
  it('gives the local calendar day as YYYY-MM-DD', () => {
    expect(todayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(todayKey(new Date(2026, 10, 30, 0, 1))).toBe('2026-11-30');
  });
});

describe('isOverdue', () => {
  const today = '2026-11-02';

  it('marks a Note whose Due date has passed as Overdue', () => {
    expect(isOverdue(note({ dueDate: '2026-11-01' }), today)).toBe(true);
    expect(isOverdue(note({ dueDate: '2025-12-31' }), today)).toBe(true);
  });

  it('does not mark a Note due today or later', () => {
    expect(isOverdue(note({ dueDate: '2026-11-02' }), today)).toBe(false);
    expect(isOverdue(note({ dueDate: '2026-11-03' }), today)).toBe(false);
  });

  it('never marks a Completed Note, or one with no Due date', () => {
    expect(isOverdue(note({ dueDate: '2026-11-01', completed: true }), today)).toBe(false);
    expect(isOverdue(note({ dueDate: null }), today)).toBe(false);
  });
});
