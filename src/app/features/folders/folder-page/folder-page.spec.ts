import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
  FakeFoldersService,
  aDefaultFolder,
  aFolder,
  provideFakeFolders,
} from '../../../../testing/fakes';
import { provideTestTranslations } from '../../../../testing/translations';
import { UiLanguageService } from '../../../core/i18n/ui-language.service';
import { FolderPage } from './folder-page';

async function open(
  folderId: string,
): Promise<{ harness: RouterTestingHarness; root: HTMLElement; folders: FakeFoldersService }> {
  const folders = new FakeFoldersService();
  folders.folders.set([
    aDefaultFolder(),
    aFolder({ id: 'work', name: 'Work', createdAt: new Date('2026-02-01') }),
    aFolder({ id: 'travel', name: 'Подорожі', createdAt: new Date('2026-03-01') }),
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
});
