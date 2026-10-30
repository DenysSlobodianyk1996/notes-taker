import { Folder, folderLabel, folderNameError, normalizeFolderName, sortFolders } from './folders';

function folder(fields: Partial<Folder>): Folder {
  return {
    id: 'f',
    name: 'Work',
    nameKey: 'work',
    isDefault: false,
    createdAt: new Date('2026-01-01'),
    ...fields,
  };
}

describe('sortFolders', () => {
  it('lists Folders oldest first', () => {
    const travel = folder({ id: 'travel', createdAt: new Date('2026-03-01') });
    const general = folder({ id: 'general', isDefault: true, createdAt: new Date('2026-01-01') });
    const work = folder({ id: 'work', createdAt: new Date('2026-02-01') });

    expect(sortFolders([travel, general, work]).map((f) => f.id)).toEqual([
      'general',
      'work',
      'travel',
    ]);
  });

  it('always lists the Default folder first', () => {
    const work = folder({ id: 'work', createdAt: new Date('2026-01-01') });
    const general = folder({ id: 'default', isDefault: true, createdAt: new Date('2026-05-01') });

    expect(sortFolders([work, general]).map((f) => f.id)).toEqual(['default', 'work']);
  });

  it('keeps a stable order for Folders created at the same moment', () => {
    const at = new Date('2026-01-01');
    const b = folder({ id: 'b', createdAt: at });
    const a = folder({ id: 'a', createdAt: at });

    expect(sortFolders([b, a]).map((f) => f.id)).toEqual(['a', 'b']);
  });

  it('does not change the list it was given', () => {
    const list = [folder({ id: 'b', createdAt: new Date('2026-02-01') }), folder({ id: 'a' })];

    sortFolders(list);

    expect(list.map((f) => f.id)).toEqual(['b', 'a']);
  });
});

describe('folderLabel', () => {
  it('shows the Default folder by its name in the current UI language', () => {
    const general = folder({ name: '', nameKey: '', isDefault: true });

    expect(folderLabel(general, 'General')).toBe('General');
    expect(folderLabel(general, 'Загальне')).toBe('Загальне');
  });

  it('shows any other Folder by its stored name, never translated', () => {
    expect(folderLabel(folder({ name: 'Робота' }), 'General')).toBe('Робота');
  });
});

describe('normalizeFolderName', () => {
  it('ignores surrounding spaces and letter case', () => {
    expect(normalizeFolderName('  Work ')).toBe('work');
    expect(normalizeFolderName('ЗАГАЛЬНЕ')).toBe('загальне');
  });

  it('treats the same letters typed or pasted in another Unicode form as equal', () => {
    expect(normalizeFolderName('Cafe\u0301')).toBe(normalizeFolderName('Caf\u00e9'));
  });
});

describe('folderNameError', () => {
  const reserved = ['General', 'Загальне'];
  const existing = [
    folder({ id: 'default', name: '', nameKey: '', isDefault: true }),
    folder({ id: 'work', name: 'Work', nameKey: 'work' }),
  ];
  const check = (name: string, renamingId?: string) =>
    folderNameError(name, existing, { reserved, renamingId });

  it('accepts a new, unique name', () => {
    expect(check('Travel')).toBeNull();
  });

  it('requires a name that is more than spaces', () => {
    expect(check('')).toBe('required');
    expect(check('   ')).toBe('required');
  });

  it('allows up to 50 characters after trimming', () => {
    expect(check(` ${'a'.repeat(50)} `)).toBeNull();
    expect(check('a'.repeat(51))).toBe('maxLength');
  });

  it('counts an emoji as one character', () => {
    expect(check('🍎'.repeat(50))).toBeNull();
    expect(check('🍎'.repeat(51))).toBe('maxLength');
  });

  it('rejects a name another Folder has, ignoring case and surrounding spaces', () => {
    expect(check('work')).toBe('taken');
    expect(check(' WORK ')).toBe('taken');
  });

  it("rejects the Default folder's name in every UI language, in any case", () => {
    expect(check('General')).toBe('taken');
    expect(check(' general ')).toBe('taken');
    expect(check('ЗАГАЛЬНЕ')).toBe('taken');
  });

  it('lets a Folder be renamed to its own name, in any case', () => {
    expect(check('Work', 'work')).toBeNull();
    expect(check('WORK', 'work')).toBeNull();
  });

  it('still rejects names of other Folders when renaming', () => {
    const withTravel = [...existing, folder({ id: 'travel', name: 'Travel', nameKey: 'travel' })];
    expect(folderNameError('travel', withTravel, { reserved, renamingId: 'work' })).toBe('taken');
  });
});
