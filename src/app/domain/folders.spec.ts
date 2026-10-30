import { Folder, folderLabel, sortFolders } from './folders';

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
