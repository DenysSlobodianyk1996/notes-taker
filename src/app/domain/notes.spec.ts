import {
  NOTE_LINKS_MAX,
  NOTE_LINK_MAX_LENGTH,
  Note,
  filterNotes,
  isOverdue,
  normalizeLink,
  noteFormErrors,
  noteLinkError,
  noteSummary,
  shortLink,
  sortNotes,
  todayKey,
} from './notes';

function note(fields: Partial<Note>): Note {
  return {
    id: 'n',
    folderId: 'default',
    title: '',
    text: 'Text',
    completed: false,
    dueDate: null,
    links: [],
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

describe('filterNotes', () => {
  const notes = [
    note({ id: 'a', title: 'Groceries', text: 'Milk and bread' }),
    note({ id: 'b', title: '', text: 'Call the DENTIST' }),
    note({ id: 'c', title: 'Подорож', text: 'Паспорт, зарядка' }),
  ];
  const ids = (query: string) => filterNotes(notes, query).map((n) => n.id);

  it('returns every Note for an empty or blank query', () => {
    expect(ids('')).toEqual(['a', 'b', 'c']);
    expect(ids('   ')).toEqual(['a', 'b', 'c']);
  });

  it('matches the title or the text, ignoring case and surrounding spaces', () => {
    expect(ids('grocer')).toEqual(['a']);
    expect(ids(' BREAD ')).toEqual(['a']);
    expect(ids('dentist')).toEqual(['b']);
  });

  it('matches Cyrillic in any case', () => {
    expect(ids('подорож')).toEqual(['c']);
    expect(ids('ПАСПОРТ')).toEqual(['c']);
  });

  it('matches letters typed and pasted in different Unicode forms', () => {
    const pasted = note({ id: 'p', text: 'мі\u0438\u0306 план' }); // и + combining breve
    expect(filterNotes([pasted], 'мій').map((n) => n.id)).toEqual(['p']);
  });

  it('finds nothing when no Note matches', () => {
    expect(ids('holiday')).toEqual([]);
  });
});

describe('normalizeLink', () => {
  it('keeps an https address, as the browser writes it', () => {
    expect(normalizeLink('https://Example.com/a?b=1#c')).toBe('https://example.com/a?b=1#c');
    expect(normalizeLink('  https://example.com  ')).toBe('https://example.com/');
  });

  it('puts https:// in front of a bare address', () => {
    expect(normalizeLink('example.com')).toBe('https://example.com/');
    expect(normalizeLink('www.example.com/path')).toBe('https://www.example.com/path');
    expect(normalizeLink('example.com:8443/x')).toBe('https://example.com:8443/x');
  });

  it.each([
    'http://example.com',
    'HTTP://example.com',
    'javascript:alert(1)',
    'mailto:me@example.com',
    'data:text/html,<b>hi</b>',
    'ftp://example.com',
    'hello',
    'two words.com',
    'https://localhost',
    'https://user:pass@example.com',
    'https://.example.com',
    '',
  ])('refuses %j', (raw) => {
    expect(normalizeLink(raw)).toBeNull();
  });
});

describe('noteLinkError', () => {
  it('accepts a new https Link', () => {
    expect(noteLinkError('example.com', ['https://other.com/'])).toBeNull();
  });

  it("refuses what isn't an https address, http: included", () => {
    expect(noteLinkError('http://example.com', [])).toBe('https');
    expect(noteLinkError('not a link', [])).toBe('https');
  });

  it('refuses a Link the Note already has, however it was typed', () => {
    expect(noteLinkError('Example.com', ['https://example.com/'])).toBe('duplicate');
  });

  it('refuses a Link over the length limit', () => {
    const long = `https://example.com/${'a'.repeat(NOTE_LINK_MAX_LENGTH)}`;
    expect(noteLinkError(long, [])).toBe('maxLength');
    const fits = `https://example.com/${'a'.repeat(NOTE_LINK_MAX_LENGTH - 20)}`;
    expect(noteLinkError(fits, [])).toBeNull();
  });

  it('refuses a sixth Link', () => {
    const five = Array.from({ length: NOTE_LINKS_MAX }, (_, i) => `https://e${i}.com/`);
    expect(noteLinkError('example.com', five)).toBe('tooMany');
  });
});

describe('shortLink', () => {
  it('shows the host and path, without https:// and www.', () => {
    expect(shortLink('https://www.example.com/a/b/')).toBe('example.com/a/b');
    expect(shortLink('https://example.com/')).toBe('example.com');
    expect(shortLink('https://docs.example.com/x?y=1')).toBe('docs.example.com/x');
  });

  it('shows a non-Latin path as typed', () => {
    expect(shortLink('https://kyiv.example.ua/%D1%88%D0%BB%D1%8F%D1%85')).toBe(
      'kyiv.example.ua/шлях',
    );
  });
});

describe('filterNotes and Links', () => {
  it('does not search Links', () => {
    const withLink = note({ text: 'Trip', links: ['https://hotels.example.com/'] });
    expect(filterNotes([withLink], 'hotels')).toEqual([]);
  });
});
