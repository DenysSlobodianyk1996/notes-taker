import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
  FakeFoldersService,
  aDefaultFolder,
  aFolder,
  provideFakeFolders,
  FakeNotesService,
  aNote,
  provideFakeNotes,
  provideFakeAuth,
  FakeLayoutService,
  provideFakeLayout,
} from '@testing/fakes';
import { NotesService } from '@core/notes/notes.service';
import { getButton } from '@testing/dom';
import { provideTestTranslations } from '@testing/translations';
import { UiLanguageService } from '@core/i18n/ui-language.service';
import { FolderPage } from './folder-page';

async function open(
  folderId: string,
  layout?: FakeLayoutService,
): Promise<{ harness: RouterTestingHarness; root: HTMLElement; folders: FakeFoldersService }> {
  const folders = new FakeFoldersService();
  const notes = new FakeNotesService();
  notes.notes.set([
    aNote({ id: 'a', folderId: 'work' }),
    aNote({ id: 'b', folderId: 'work' }),
    aNote({ id: 'c', folderId: 'default' }),
  ]);
  folders.folders.set([
    aDefaultFolder(),
    aFolder({ id: 'work', name: 'Work', createdAt: new Date('2026-02-01') }),
    aFolder({ id: 'travel', name: 'Подорожі', createdAt: new Date('2026-03-01') }),
  ]);
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: 'folders/:folderId', component: FolderPage }]),
      provideTestTranslations(),
      provideFakeAuth(),
      provideFakeFolders(folders),
      provideFakeNotes(notes),
      ...(layout ? [provideFakeLayout(layout)] : []),
    ],
  });
  await TestBed.inject(UiLanguageService).init();
  const harness = await RouterTestingHarness.create(`/folders/${folderId}`);
  return { harness, root: harness.routeNativeElement as HTMLElement, folders };
}

function rows(root: HTMLElement): string[] {
  return [...root.querySelectorAll('nav .folder-name')].map((el) => el.textContent!.trim());
}

describe('FolderPage', () => {
  beforeEach(() => localStorage.clear());

  it('lists the Folders oldest first under a "Folders" heading', async () => {
    const { root } = await open('work');

    expect(root.querySelector('nav h2')?.textContent).toContain('Folders');
    expect(rows(root)).toEqual(['General', 'Work', 'Подорожі']);
  });

  it('highlights the selected Folder and shows its name as the page title', async () => {
    const { root } = await open('work');

    const current = root.querySelector('nav [aria-current="page"]');
    expect(current?.textContent).toContain('Work');
    expect(current?.closest('.folder')?.classList).toContain('selected');
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Work');
  });

  it('locks the Default folder against rename and delete', async () => {
    const { root } = await open('default');

    const [general, work] = [...root.querySelectorAll('nav .folder')];
    expect(general.querySelector('.lock')?.textContent).toContain(
      "The default folder can't be renamed or deleted",
    );
    expect(work.querySelector('.lock')).toBeNull();
  });

  it('shows the Default folder in the current UI language, but never translates other names', async () => {
    const { harness, root } = await open('default');

    await TestBed.inject(UiLanguageService).use('uk');
    await harness.fixture.whenStable();

    expect(rows(root)).toEqual(['Загальне', 'Work', 'Подорожі']);
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Загальне');
    expect(root.querySelector('nav h2')?.textContent).toContain('Папки');
  });

  it('opens a Folder when its row is clicked', async () => {
    const { harness, root } = await open('default');

    root.querySelector<HTMLAnchorElement>('nav a[href="/folders/travel"]')!.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/folders/travel');
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Подорожі');
  });

  it('moves to the first Folder when the open one disappears (deleted, or its save failed)', async () => {
    const { harness, folders } = await open('travel');

    folders.folders.update((list) => list.filter((f) => f.id !== 'travel'));
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/folders/default');
  });

  it('shows how many Notes each Folder holds, in brackets right after its name', async () => {
    const { root } = await open('work');

    const counts = [...root.querySelectorAll('nav .folder')].map((row) => {
      const count = row.querySelector('.count');
      expect(count?.previousElementSibling?.classList).toContain('folder-name');
      return count?.textContent?.trim();
    });
    expect(counts).toEqual(['(1)', '(2)', '(0)']);
  });

  it("shows the selected Folder's Notes", async () => {
    const { root } = await open('work');

    expect(root.querySelectorAll('.note')).toHaveLength(2);
  });

  describe('deleting a Folder', () => {
    function deleteButtons(root: HTMLElement): HTMLButtonElement[] {
      return [...root.querySelectorAll<HTMLButtonElement>('nav button')].filter(
        (b) => b.getAttribute('aria-label') === 'Delete folder',
      );
    }

    it('offers delete only on the selected Folder, never on the Default folder', async () => {
      const onDefault = await open('default');
      expect(deleteButtons(onDefault.root)).toHaveLength(0);

      TestBed.resetTestingModule();
      const onWork = await open('work');
      const buttons = deleteButtons(onWork.root);
      expect(buttons).toHaveLength(1);
      expect(buttons[0].closest('.folder')?.textContent).toContain('Work');
    });

    it('names the Folder and its note count, and deletes only after confirming', async () => {
      const { harness, root, folders } = await open('work');
      const dialog = root.querySelector<HTMLDialogElement>('app-folders-sidebar dialog')!;

      deleteButtons(root)[0].click();
      await harness.fixture.whenStable();
      expect(dialog.open).toBe(true);
      expect(dialog.textContent).toContain('Delete “Work”?');
      expect(dialog.textContent).toContain(
        'The folder and all its notes (notes: 2) will be deleted.',
      );

      getButton(dialog, 'Cancel').click();
      await harness.fixture.whenStable();
      expect(folders.deleteFolder).not.toHaveBeenCalled();

      deleteButtons(root)[0].click();
      await harness.fixture.whenStable();
      getButton(dialog, 'Delete folder').click();
      await harness.fixture.whenStable();

      expect(folders.deleteFolder).toHaveBeenCalledWith('work');
      expect(TestBed.inject(Router).url).toBe('/folders/default');
    });

    it('says plainly when the Folder is empty', async () => {
      const { harness, root } = await open('travel');

      deleteButtons(root)[0].click();
      await harness.fixture.whenStable();

      expect(root.querySelector('app-folders-sidebar dialog')?.textContent).toContain(
        'This empty folder will be deleted.',
      );
    });

    it('waits for the Notes to load before offering delete, so the count is right', async () => {
      const { harness, root } = await open('work');
      const notes = TestBed.inject(NotesService) as unknown as FakeNotesService;

      notes.loaded.set(false);
      await harness.fixture.whenStable();
      expect(deleteButtons(root)[0].disabled).toBe(true);

      notes.loaded.set(true);
      await harness.fixture.whenStable();
      expect(deleteButtons(root)[0].disabled).toBe(false);
    });
  });

  describe('on a phone-sized screen', () => {
    async function openNarrow(folderId = 'work') {
      const layout = new FakeLayoutService();
      layout.narrow.set(true);
      return { ...(await open(folderId, layout)), layout };
    }

    async function settle(harness: RouterTestingHarness): Promise<void> {
      await harness.fixture.whenStable();
    }

    function escape(target: Element): void {
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    }

    it('hides the Folders until the drawer is opened, then makes the Notes inert', async () => {
      const { harness, root, layout } = await openNarrow();
      expect(root.querySelector('nav')).toBeNull();
      expect(root.querySelector<HTMLElement>('section.notes')?.inert).toBe(false);

      layout.openDrawer();
      await settle(harness);

      expect(root.querySelector('app-folders-sidebar')?.classList).toContain('drawer');
      expect(root.querySelector<HTMLElement>('section.notes')?.inert).toBe(true);
      expect(document.activeElement).toBe(root.querySelector('nav'));
    });

    it('closes the drawer from the backdrop and with Esc, sending focus back to ☰', async () => {
      const { harness, root, layout } = await openNarrow();

      layout.openDrawer();
      await settle(harness);
      root.querySelector<HTMLElement>('.backdrop')!.click();
      await settle(harness);
      expect(root.querySelector('nav')).toBeNull();
      expect(layout.closeDrawer).toHaveBeenLastCalledWith();

      layout.openDrawer();
      await settle(harness);
      escape(root.querySelector('nav a')!);
      await settle(harness);
      expect(layout.drawerOpen()).toBe(false);
      expect(layout.returnFocus()).toBe(2);
    });

    it('closes the drawer on tapping the open Folder, without pulling focus to ☰', async () => {
      const { harness, root, layout } = await openNarrow('work');
      layout.openDrawer();
      await settle(harness);

      root.querySelector<HTMLAnchorElement>('nav a[aria-current="page"]')!.click();
      await settle(harness);

      expect(layout.drawerOpen()).toBe(false);
      expect(layout.returnFocus()).toBe(0);
    });

    it('lets Esc cancel a folder form inside the drawer without closing the drawer', async () => {
      const { harness, root, layout } = await openNarrow();
      layout.openDrawer();
      await settle(harness);
      getButton(root.querySelector('nav')!, 'New folder').click();
      await settle(harness);

      escape(root.querySelector('nav form input')!);
      await settle(harness);

      expect(root.querySelector('nav form')).toBeNull();
      expect(layout.drawerOpen()).toBe(true);
    });
  });

  it('keeps the sidebar beside the Notes on a wide screen', async () => {
    const { root } = await open('work');

    expect(root.querySelector('nav')).not.toBeNull();
    expect(root.querySelector('app-folders-sidebar')?.classList).not.toContain('drawer');
    expect(root.querySelector('.backdrop')).toBeNull();
  });
});
