import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getButton } from '@testing/dom';
import { FakeNotesService, aNote, provideFakeNotes, provideFakeAuth } from '@testing/fakes';
import { FormRowService } from '@core/ui/form-row.service';
import { todayKey } from '@domain/notes';
import { provideTestTranslations } from '@testing/translations';
import { UiLanguageService } from '@core/i18n/ui-language.service';
import { NotesView } from './notes-view';

@Component({
  imports: [NotesView],
  template: '<app-notes-view [folderId]="folderId()" folderName="Work" />',
})
class Host {
  readonly folderId = signal('work');
}

interface View {
  fixture: ComponentFixture<Host>;
  root: HTMLElement;
  notes: FakeNotesService;
}

async function render(notes = new FakeNotesService()): Promise<View> {
  TestBed.configureTestingModule({
    providers: [provideTestTranslations(), provideFakeAuth(), provideFakeNotes(notes)],
  });
  await TestBed.inject(UiLanguageService).init();
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  return { fixture, root: fixture.nativeElement as HTMLElement, notes };
}

async function openNewNote(view: View): Promise<void> {
  getButton(view.root, 'New note').click();
  await view.fixture.whenStable();
}

function field<T extends HTMLElement>(view: View, selector: string): T {
  const element = view.root.querySelector<T>(`form ${selector}`);
  if (!element) throw new Error(`No ${selector} in the note form`);
  return element;
}

async function type(view: View, selector: string, value: string): Promise<void> {
  const element = field<HTMLInputElement | HTMLTextAreaElement>(view, selector);
  element.value = value;
  element.dispatchEvent(new Event('input'));
  await view.fixture.whenStable();
}

async function press(view: View, selector: string, init: KeyboardEventInit): Promise<void> {
  field(view, selector).dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...init }));
  await view.fixture.whenStable();
}

function saveButton(view: View): HTMLButtonElement {
  return getButton(view.root, 'Save note');
}

describe('NotesView', () => {
  beforeEach(() => localStorage.clear());

  it('shows a friendly empty state for a Folder with no Notes', async () => {
    const { root } = await render();

    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Work');
    expect(root.textContent).toContain('No notes in Work yet');
    expect(root.textContent).toContain('Notes: 0');
  });

  it("lists the Folder's Notes newest first, in full, with counts", async () => {
    const notes = new FakeNotesService();
    notes.notes.set([
      aNote({ id: 'old', folderId: 'work', text: 'Old', createdAt: new Date('2026-01-01') }),
      aNote({
        id: 'new',
        folderId: 'work',
        title: 'Plan',
        text: 'Line one\nLine two',
        completed: true,
        createdAt: new Date('2026-03-01'),
      }),
      aNote({ id: 'other', folderId: 'travel', text: 'Elsewhere' }),
    ]);
    const { root } = await render(notes);

    const rows = [...root.querySelectorAll('article.note')];
    expect(rows.map((r) => r.querySelector('.note-text')?.textContent)).toEqual([
      'Line one\nLine two',
      'Old',
    ]);
    expect(rows[0].querySelector('.note-title')?.textContent).toBe('Plan');
    expect(rows[1].querySelector('.note-title')).toBeNull();
    expect(root.querySelector('.title p')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'Notes: 2 · Completed: 1',
    );
  });

  it('opens an empty new-note row at the top, focused on the text', async () => {
    const notes = new FakeNotesService();
    notes.notes.set([aNote({ folderId: 'work' })]);
    const view = await render(notes);

    await openNewNote(view);

    const list = view.root.querySelector('.list')!;
    expect(list.firstElementChild?.tagName).toBe('APP-NOTE-FORM');
    expect(document.activeElement).toBe(field(view, 'textarea'));
    expect(view.root.textContent).toContain('0 / 1000');
    expect(field<HTMLTextAreaElement>(view, 'textarea').maxLength).toBe(1000);
    expect(field<HTMLInputElement>(view, 'input').maxLength).toBe(200);
  });

  it('keeps Save disabled while the text is blank, and counts characters as you type', async () => {
    const view = await render();
    await openNewNote(view);
    expect(saveButton(view).disabled).toBe(true);

    await type(view, 'textarea', '   ');
    expect(saveButton(view).disabled).toBe(true);

    await type(view, 'textarea', 'Buy milk');
    expect(saveButton(view).disabled).toBe(false);
    expect(view.root.textContent).toContain('8 / 1000');
  });

  it('saves with ✓, trimmed, and closes the row', async () => {
    const view = await render();
    await openNewNote(view);
    await type(view, 'input', ' Groceries ');
    await type(view, 'textarea', ' Milk\nBread ');

    saveButton(view).click();
    await view.fixture.whenStable();

    expect(view.notes.createNote).toHaveBeenCalledWith('work', {
      title: 'Groceries',
      text: 'Milk\nBread',
      dueDate: null,
    });
    expect(view.root.querySelector('form')).toBeNull();
    expect(view.root.querySelector('.note-title')?.textContent).toBe('Groceries');
  });

  it('saves with Ctrl+Enter or ⌘+Enter in the text, and with Enter in the title', async () => {
    const view = await render();

    await openNewNote(view);
    await type(view, 'textarea', 'First');
    await press(view, 'textarea', { key: 'Enter', ctrlKey: true });

    await openNewNote(view);
    await type(view, 'textarea', 'Second');
    await press(view, 'textarea', { key: 'Enter', metaKey: true });

    await openNewNote(view);
    await type(view, 'textarea', 'Third');
    await press(view, 'input', { key: 'Enter' });

    expect(view.notes.createNote.mock.calls.map((call) => call[1].text)).toEqual([
      'First',
      'Second',
      'Third',
    ]);
  });

  it('does not save a blank Note from the keyboard', async () => {
    const view = await render();
    await openNewNote(view);

    await press(view, 'textarea', { key: 'Enter', ctrlKey: true });

    expect(view.notes.createNote).not.toHaveBeenCalled();
    expect(view.root.querySelector('form')).not.toBeNull();
  });

  it('cancels with Esc or ✕, saving nothing', async () => {
    const view = await render();
    await openNewNote(view);
    await type(view, 'textarea', 'Draft');

    await press(view, 'textarea', { key: 'Escape' });
    expect(view.root.querySelector('form')).toBeNull();

    await openNewNote(view);
    getButton(view.root, 'Cancel').click();
    await view.fixture.whenStable();
    expect(view.root.querySelector('form')).toBeNull();
    expect(view.notes.createNote).not.toHaveBeenCalled();
  });

  it('closes an unsaved new Note when another Folder is opened', async () => {
    const view = await render();
    await openNewNote(view);
    await type(view, 'textarea', 'Draft for Work');

    view.fixture.componentInstance.folderId.set('travel');
    await view.fixture.whenStable();

    expect(view.root.querySelector('form')).toBeNull();
    expect(view.notes.createNote).not.toHaveBeenCalled();
  });

  it('shows no empty state until the Notes have loaded', async () => {
    const notes = new FakeNotesService();
    notes.loaded.set(false);
    const view = await render(notes);
    expect(view.root.textContent).not.toContain('No notes in Work yet');

    notes.loaded.set(true);
    await view.fixture.whenStable();
    expect(view.root.textContent).toContain('No notes in Work yet');
  });

  describe('editing, completing and deleting', () => {
    function withNotes(...notes: Parameters<typeof aNote>[0][]): FakeNotesService {
      const service = new FakeNotesService();
      service.notes.set(notes.map((fields) => aNote({ folderId: 'work', ...fields })));
      return service;
    }

    async function click(view: View, name: string): Promise<void> {
      getButton(view.root, name).click();
      await view.fixture.whenStable();
    }

    function day(offset: number): string {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      return todayKey(date);
    }

    it('edits a Note inline, filled in, and saves it trimmed with ✓', async () => {
      const view = await render(withNotes({ id: 'n1', title: 'Call', text: 'Dentist' }));

      await click(view, 'Edit note: Call');
      expect(field<HTMLInputElement>(view, 'input').value).toBe('Call');
      expect(field<HTMLTextAreaElement>(view, 'textarea').value).toBe('Dentist');

      await type(view, 'textarea', ' Dentist at 9 ');
      saveButton(view).click();
      await view.fixture.whenStable();

      expect(view.notes.updateNote).toHaveBeenCalledWith('n1', {
        title: 'Call',
        text: 'Dentist at 9',
        dueDate: null,
      });
      expect(view.root.querySelector('form')).toBeNull();
    });

    it("opens a Note's form from its ✎ button, not from a click on its text", async () => {
      const view = await render(
        withNotes(
          { id: 'n1', title: 'Call', text: 'Dentist', createdAt: new Date('2026-02-01') },
          { id: 'n2', title: 'Rent', text: 'Pay', createdAt: new Date('2026-01-01') },
        ),
      );

      const body = view.root.querySelector<HTMLElement>('.note-body')!;
      expect(body.tagName).not.toBe('BUTTON');
      body.click();
      await view.fixture.whenStable();
      expect(view.root.querySelector('form')).toBeNull();

      const edit = getButton(view.root, 'Edit note: Rent');
      expect(edit.title).toBe('Edit note: Rent');
      await click(view, 'Edit note: Rent');
      expect(view.root.querySelectorAll('form')).toHaveLength(1);
      expect(field<HTMLTextAreaElement>(view, 'textarea').value).toBe('Pay');
    });

    it('puts ✎ before 🗑 in each Note row', async () => {
      const view = await render(withNotes({ id: 'n1', title: 'Call' }));

      const buttons = [...view.root.querySelectorAll('article.note button')];
      expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
        'Edit note: Call',
        'Delete note',
      ]);
    });

    it("sends focus back to the Note's ✎ after Save and after Esc", async () => {
      const view = await render(withNotes({ id: 'n1', title: 'Call', text: 'Dentist' }));

      await click(view, 'Edit note: Call');
      await type(view, 'textarea', 'Dentist at 9');
      saveButton(view).click();
      await view.fixture.whenStable();
      expect(document.activeElement).toBe(getButton(view.root, 'Edit note: Call'));

      await click(view, 'Edit note: Call');
      await press(view, 'textarea', { key: 'Escape' });
      expect(document.activeElement).toBe(getButton(view.root, 'Edit note: Call'));
    });

    it('cancels an edit with Esc and shows the Note unchanged', async () => {
      const view = await render(withNotes({ id: 'n1', title: 'Call', text: 'Dentist' }));
      await click(view, 'Edit note: Call');
      await type(view, 'textarea', 'Changed');

      await press(view, 'textarea', { key: 'Escape' });

      expect(view.notes.updateNote).not.toHaveBeenCalled();
      expect(view.root.querySelector('.note-text')?.textContent).toBe('Dentist');
    });

    it('marks a Note Completed with its checkbox, crossed out, and counts it', async () => {
      const view = await render(withNotes({ id: 'n1', title: 'Call' }));
      const checkbox = view.root.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
      expect(checkbox.getAttribute('aria-label')).toBe('Mark as completed: Call');

      checkbox.click();
      await view.fixture.whenStable();

      expect(view.notes.toggleNote).toHaveBeenCalledWith('n1');
      expect(view.root.querySelector('article.note')?.classList).toContain('completed');
      expect(view.root.textContent).toContain('Completed: 1');
    });

    it('deletes a Note only after confirming in the dialog', async () => {
      const view = await render(withNotes({ id: 'n1', title: 'Call' }));
      const dialog = view.root.querySelector('dialog')!;

      await click(view, 'Delete note');
      expect(dialog.open).toBe(true);
      expect(dialog.textContent).toContain('Delete this note?');
      expect(dialog.textContent).toContain('“Call” will be deleted.');

      getButton(dialog, 'Cancel').click();
      await view.fixture.whenStable();
      expect(dialog.open).toBe(false);
      expect(view.notes.deleteNote).not.toHaveBeenCalled();

      await click(view, 'Delete note');
      getButton(dialog, 'Delete note').click();
      await view.fixture.whenStable();
      expect(view.notes.deleteNote).toHaveBeenCalledWith('n1');
      expect(dialog.open).toBe(false);
    });

    it('keeps only one form row open: a new Note replaces an edit, a Folder form replaces both', async () => {
      const view = await render(withNotes({ id: 'n1', title: 'Call' }));
      await click(view, 'Edit note: Call');
      await type(view, 'textarea', 'Unsaved');

      await click(view, 'New note');
      expect(view.root.querySelectorAll('form')).toHaveLength(1);
      expect(field<HTMLTextAreaElement>(view, 'textarea').value).toBe('');

      TestBed.inject(FormRowService).open.set({ kind: 'new-folder' });
      await view.fixture.whenStable();
      expect(view.root.querySelector('form')).toBeNull();
      expect(view.notes.updateNote).not.toHaveBeenCalled();
    });

    it('saves a Due date with a new Note', async () => {
      const view = await render();
      await openNewNote(view);
      await type(view, 'textarea', 'Pay rent');
      await type(view, 'input[type="date"]', '2026-12-01');

      saveButton(view).click();
      await view.fixture.whenStable();

      expect(view.notes.createNote).toHaveBeenCalledWith('work', {
        title: '',
        text: 'Pay rent',
        dueDate: '2026-12-01',
      });
    });

    it('clears a Due date while editing', async () => {
      const view = await render(withNotes({ id: 'n1', title: 'Rent', dueDate: day(3) }));
      await click(view, 'Edit note: Rent');
      expect(field<HTMLInputElement>(view, 'input[type="date"]').value).toBe(day(3));

      await click(view, 'Clear due date');
      saveButton(view).click();
      await view.fixture.whenStable();

      expect(view.notes.updateNote).toHaveBeenCalledWith('n1', {
        title: 'Rent',
        text: 'Buy milk',
        dueDate: null,
      });
    });

    it('shows Due dates, red when Overdue, plain once Completed', async () => {
      const view = await render(
        withNotes(
          { id: 'soon', title: 'Soon', dueDate: day(2), createdAt: new Date(3) },
          { id: 'late', title: 'Late', dueDate: day(-1), createdAt: new Date(2) },
          { id: 'done', title: 'Done', dueDate: day(-1), completed: true, createdAt: new Date(1) },
          { id: 'none', title: 'None', createdAt: new Date(0) },
        ),
      );

      const chips = [...view.root.querySelectorAll('article.note')].map((row) => {
        const chip = row.querySelector('.due');
        return chip
          ? `${chip.classList.contains('overdue') ? 'red' : 'plain'}: ${chip.textContent?.replace(/event_busy|event/, '').trim()}`
          : null;
      });
      expect(chips[0]).toMatch(/^plain: Due \d+ \w+/);
      expect(chips[1]).toMatch(/^red: Overdue · \d+ \w+/);
      expect(chips[2]).toMatch(/^plain: Due /);
      expect(chips[3]).toBeNull();
    });

    it('does not save a Note whose fields did not change', async () => {
      const view = await render(withNotes({ id: 'n1', title: 'Call', text: 'Dentist' }));
      await click(view, 'Edit note: Call');

      saveButton(view).click();
      await view.fixture.whenStable();

      expect(view.notes.updateNote).not.toHaveBeenCalled();
      expect(view.root.querySelector('form')).toBeNull();
    });

    it('closes a pending delete when another Folder opens', async () => {
      const view = await render(withNotes({ id: 'n1', title: 'Call' }));
      await click(view, 'Delete note');
      const dialog = view.root.querySelector('dialog')!;
      expect(dialog.open).toBe(true);

      view.fixture.componentInstance.folderId.set('travel');
      await view.fixture.whenStable();

      expect(dialog.open).toBe(false);
      expect(view.notes.deleteNote).not.toHaveBeenCalled();
    });
  });

  describe('search', () => {
    function searchBox(view: View): HTMLInputElement {
      return view.root.querySelector<HTMLInputElement>('input[type="search"]')!;
    }

    async function search(view: View, query: string): Promise<void> {
      searchBox(view).value = query;
      searchBox(view).dispatchEvent(new Event('input'));
      await view.fixture.whenStable();
    }

    function shown(view: View): string[] {
      return [...view.root.querySelectorAll('article.note .note-text')].map((n) => n.textContent!);
    }

    async function withThreeNotes(): Promise<View> {
      const notes = new FakeNotesService();
      notes.notes.set([
        aNote({
          id: 'a',
          folderId: 'work',
          title: 'Groceries',
          text: 'Milk',
          createdAt: new Date(3),
        }),
        aNote({ id: 'b', folderId: 'work', text: 'Call the dentist', createdAt: new Date(2) }),
        aNote({ id: 'c', folderId: 'work', text: 'Паспорт', createdAt: new Date(1) }),
      ]);
      return render(notes);
    }

    it('has a labelled search box naming the Folder', async () => {
      const view = await render();

      expect(searchBox(view).placeholder).toBe('Search in Work');
      expect(searchBox(view).closest('label')?.textContent).toContain(
        'Search notes in this folder',
      );
    });

    it('filters the Notes by title or text as you type, ignoring case', async () => {
      const view = await withThreeNotes();

      await search(view, 'GROC');
      expect(shown(view)).toEqual(['Milk']);

      await search(view, 'паспорт');
      expect(shown(view)).toEqual(['Паспорт']);

      await search(view, '');
      expect(shown(view)).toHaveLength(3);
    });

    it('says when nothing matches, not that the Folder is empty', async () => {
      const view = await withThreeNotes();

      await search(view, ' holiday ');

      expect(view.root.textContent).toContain('No notes match “holiday”');
      expect(view.root.textContent).toContain(
        'Search looks at titles and text in this folder only.',
      );
      expect(view.root.textContent).not.toContain('No notes in Work yet');
      expect(view.root.textContent).toContain('Notes: 3');
    });

    it('clears the search when another Folder opens, or a new Note starts', async () => {
      const view = await withThreeNotes();

      await search(view, 'milk');
      view.fixture.componentInstance.folderId.set('travel');
      await view.fixture.whenStable();
      expect(searchBox(view).value).toBe('');

      view.fixture.componentInstance.folderId.set('work');
      await view.fixture.whenStable();
      await search(view, 'milk');
      await openNewNote(view);
      expect(searchBox(view).value).toBe('');
      expect(shown(view)).toHaveLength(3);
    });

    it('keeps an open edit visible while searching, so the draft survives', async () => {
      const view = await withThreeNotes();
      getButton(view.root, 'Edit note: Groceries').click();
      await view.fixture.whenStable();
      await type(view, 'textarea', 'Milk and eggs');

      await search(view, 'dentist');

      expect(field<HTMLTextAreaElement>(view, 'textarea').value).toBe('Milk and eggs');
      expect(shown(view)).toEqual(['Call the dentist']);
    });

    it('clears the search when a saved edit no longer matches it', async () => {
      const view = await withThreeNotes();
      await search(view, 'milk');
      getButton(view.root, 'Edit note: Groceries').click();
      await view.fixture.whenStable();

      await type(view, 'textarea', 'Oat drink');
      saveButton(view).click();
      await view.fixture.whenStable();

      expect(searchBox(view).value).toBe('');
      expect(shown(view)).toContain('Oat drink');
    });

    it('does not show "no match" next to the new-note form', async () => {
      const view = await withThreeNotes();
      await openNewNote(view);

      await search(view, 'zzz');

      expect(view.root.textContent).not.toContain('No notes match');
    });
  });

  it('gives new and edited Notes the same tall text area; the note icon marks a new Note', async () => {
    const notes = new FakeNotesService();
    notes.notes.set([aNote({ id: 'n1', folderId: 'work', title: 'Call' })]);
    const view = await render(notes);

    await openNewNote(view);
    expect(field<HTMLTextAreaElement>(view, 'textarea').rows).toBe(9);
    const icon = view.root.querySelector('form .note-icon');
    expect(icon?.textContent?.trim()).toBe('sticky_note_2');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');

    getButton(view.root, 'Cancel').click();
    await view.fixture.whenStable();
    getButton(view.root, 'Edit note: Call').click();
    await view.fixture.whenStable();
    expect(field<HTMLTextAreaElement>(view, 'textarea').rows).toBe(9);
    expect(view.root.querySelector('form .note-icon')).toBeNull();
  });

  it('marks the note text as required: a "*" in its placeholder and aria-required', async () => {
    const view = await render();
    await openNewNote(view);

    const text = field<HTMLTextAreaElement>(view, 'textarea');
    expect(text.placeholder).toBe('Write a note… *');
    expect(text.getAttribute('aria-required')).toBe('true');
    expect(field<HTMLInputElement>(view, 'input').placeholder).toBe('Title (optional)');
  });

  it('puts the New note button first in the Folder header, left of the title', async () => {
    const view = await render();

    const head = view.root.querySelector('.head')!;
    expect(head.firstElementChild).toBe(getButton(view.root, 'New note'));
    expect(head.querySelector('h1')?.textContent?.trim()).toBe('Work');
  });

  it('shows the character count and the shortcuts right below the text area', async () => {
    const view = await render();
    await openNewNote(view);

    const textLabel = field<HTMLTextAreaElement>(view, 'textarea').closest('label')!;
    const hint = textLabel.nextElementSibling!;
    expect(hint.classList).toContain('text-hint');
    expect([...hint.children].map((part) => part.textContent?.trim())).toEqual([
      '0 / 1000',
      '· Ctrl/⌘+Enter to save · Esc to cancel',
    ]);
    expect(view.root.querySelector('form .foot')?.textContent).not.toContain('1000');
  });

  it('labels the form buttons with words, not icons', async () => {
    const view = await render();
    await openNewNote(view);

    for (const name of ['Cancel', 'Save note']) {
      const button = getButton(view.root.querySelector('form')!, name);
      expect(button.textContent?.trim()).toBe(name);
      expect(button.getAttribute('aria-label')).toBeNull();
      expect(button.querySelector('.material-symbols-outlined')).toBeNull();
    }
  });
});
