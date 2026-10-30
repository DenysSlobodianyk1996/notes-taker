import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { accessibleName, getButton } from '../../../../testing/dom';
import {
  FakeFoldersService,
  aDefaultFolder,
  aFolder,
  provideFakeFolders,
} from '../../../../testing/fakes';
import { provideTestTranslations } from '../../../../testing/translations';
import { UiLanguageService } from '../../../core/i18n/ui-language.service';
import { FolderPage } from '../folder-page/folder-page';

interface Page {
  harness: RouterTestingHarness;
  root: HTMLElement;
  folders: FakeFoldersService;
}

async function open(folderId = 'default'): Promise<Page> {
  const folders = new FakeFoldersService();
  folders.folders.set([
    aDefaultFolder(),
    aFolder({ id: 'work', name: 'Work', createdAt: new Date('2026-02-01') }),
    aFolder({ id: 'travel', name: 'Travel', createdAt: new Date('2026-03-01') }),
  ]);
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: 'folders/:folderId', component: FolderPage }]),
      provideTestTranslations(),
      provideFakeFolders(folders),
    ],
  });
  await TestBed.inject(UiLanguageService).init();
  const harness = await RouterTestingHarness.create(`/folders/${folderId}`);
  return { harness, root: harness.routeNativeElement as HTMLElement, folders };
}

function nav(page: Page): HTMLElement {
  return page.root.querySelector('nav')!;
}

function nameInput(page: Page): HTMLInputElement {
  const input = nav(page).querySelector<HTMLInputElement>('form input');
  if (!input) throw new Error('No folder name form is open');
  return input;
}

async function type(page: Page, text: string): Promise<void> {
  const input = nameInput(page);
  input.value = text;
  input.dispatchEvent(new Event('input'));
  await page.harness.fixture.whenStable();
}

async function click(page: Page, name: string): Promise<void> {
  getButton(nav(page), name).click();
  await page.harness.fixture.whenStable();
}

function errorText(page: Page): string | undefined {
  return nav(page).querySelector('[role="alert"]')?.textContent?.trim();
}

describe('FoldersSidebar: create and rename', () => {
  beforeEach(() => localStorage.clear());

  it('opens a focused, empty form row at the top for a new Folder', async () => {
    const page = await open();

    await click(page, 'New folder');

    const form = nav(page).querySelector('form')!;
    expect(form.compareDocumentPosition(nav(page).querySelector('.folder')!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(nameInput(page).value).toBe('');
    expect(document.activeElement).toBe(nameInput(page));
  });

  it('creates the Folder with ✓ and opens it', async () => {
    const page = await open();
    await click(page, 'New folder');

    await type(page, '  Recipes ');
    await click(page, 'Create folder');

    expect(page.folders.createFolder).toHaveBeenCalledWith('Recipes');
    expect(nav(page).querySelector('form')).toBeNull();
    expect(TestBed.inject(Router).url).toBe('/folders/new-folder');
  });

  it.each([
    ['', 'Enter a folder name'],
    ['   ', 'Enter a folder name'],
    ['x'.repeat(51), 'Use 50 characters or fewer'],
    [' work ', 'A folder with this name already exists'],
    ['GENERAL', 'A folder with this name already exists'],
    ['загальне', 'A folder with this name already exists'],
  ])('shows an error for %j and saves nothing', async (name, message) => {
    const page = await open();
    await click(page, 'New folder');

    await type(page, name);
    await click(page, 'Create folder');

    expect(errorText(page)).toBe(message);
    expect(nameInput(page).getAttribute('aria-invalid')).toBe('true');
    expect(page.folders.createFolder).not.toHaveBeenCalled();
  });

  it('clears the error once the name is fixed', async () => {
    const page = await open();
    await click(page, 'New folder');
    await click(page, 'Create folder');
    expect(errorText(page)).toBe('Enter a folder name');

    await type(page, 'Recipes');

    expect(errorText(page)).toBeUndefined();
  });

  it('cancels with Esc, and with ✕, saving nothing', async () => {
    const page = await open();
    await click(page, 'New folder');
    await type(page, 'Recipes');

    nameInput(page).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await page.harness.fixture.whenStable();
    expect(nav(page).querySelector('form')).toBeNull();

    await click(page, 'New folder');
    await click(page, 'Cancel');
    expect(nav(page).querySelector('form')).toBeNull();
    expect(page.folders.createFolder).not.toHaveBeenCalled();
  });

  it('renames the selected Folder inline, filled in with its name', async () => {
    const page = await open('work');

    await click(page, 'Rename folder');
    expect(nameInput(page).value).toBe('Work');

    await type(page, 'Office');
    await click(page, 'Save folder name');

    expect(page.folders.renameFolder).toHaveBeenCalledWith('work', 'Office');
    expect(nav(page).querySelector('form')).toBeNull();
  });

  it('lets a Folder keep its own name in another case, but not take another name', async () => {
    const page = await open('work');
    await click(page, 'Rename folder');

    await type(page, 'travel');
    await click(page, 'Save folder name');
    expect(errorText(page)).toBe('A folder with this name already exists');

    await type(page, 'WORK');
    await click(page, 'Save folder name');
    expect(page.folders.renameFolder).toHaveBeenCalledWith('work', 'WORK');
  });

  it('offers rename only on the selected Folder, never on the Default folder', async () => {
    const onDefault = await open('default');
    const names = [...nav(onDefault).querySelectorAll('button')].map(accessibleName);
    expect(names).not.toContain('Rename folder');

    TestBed.resetTestingModule();
    const onWork = await open('work');
    const renameButtons = [...nav(onWork).querySelectorAll('button')].filter(
      (b) => accessibleName(b) === 'Rename folder',
    );
    expect(renameButtons).toHaveLength(1);
    expect(renameButtons[0].closest('.folder')?.textContent).toContain('Work');
  });

  it('keeps only one form row open: starting a new Folder closes the rename', async () => {
    const page = await open('work');
    await click(page, 'Rename folder');
    await type(page, 'Unsaved');

    await click(page, 'New folder');

    expect(nav(page).querySelectorAll('form')).toHaveLength(1);
    expect(nameInput(page).value).toBe('');
    expect(nav(page).textContent).toContain('Work');
    expect(page.folders.renameFolder).not.toHaveBeenCalled();
  });
});
