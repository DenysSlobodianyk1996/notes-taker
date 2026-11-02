import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getButton } from '../../../../testing/dom';
import { FakeNotesService, aNote, provideFakeNotes } from '../../../../testing/fakes';
import { provideTestTranslations } from '../../../../testing/translations';
import { UiLanguageService } from '../../../core/i18n/ui-language.service';
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
    providers: [provideTestTranslations(), provideFakeNotes(notes)],
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

    const rows = [...root.querySelectorAll('.note')];
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

    expect(view.notes.createNote).toHaveBeenCalledWith('work', 'Groceries', 'Milk\nBread');
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

    expect(view.notes.createNote.mock.calls.map((call) => call[2])).toEqual([
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
});
