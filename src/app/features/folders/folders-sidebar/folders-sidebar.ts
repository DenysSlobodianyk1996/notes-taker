import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FoldersService } from '@core/folders/folders.service';
import { NotesService } from '@core/notes/notes.service';
import { FormRowService } from '@core/ui/form-row.service';
import { DEFAULT_FOLDER_NAMES } from '@core/i18n/default-folder-names';
import {
  DEFAULT_FOLDER_ID,
  Folder,
  folderLabel,
  folderNameError,
  FolderNameError,
} from '@domain/folders';
import { injectDefaultFolderName } from '@features/folders/default-folder-name';
import { FolderNameForm } from '@features/folders/folder-name-form/folder-name-form';
import { ConfirmDialog } from '@shared/confirm-dialog/confirm-dialog';

/**
 * The Account's Folders, Default folder first. New and renamed Folders use an inline form row;
 * the Default folder is locked against rename and delete.
 */
@Component({
  selector: 'app-folders-sidebar',
  imports: [RouterLink, TranslatePipe, FolderNameForm, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './folders-sidebar.html',
  styleUrl: './folders-sidebar.scss',
})
export class FoldersSidebar {
  /** The id of the Folder whose Notes are shown. */
  readonly selectedId = input<string>();

  private readonly service = inject(FoldersService);
  protected readonly notes = inject(NotesService);
  private readonly router = inject(Router);
  private readonly defaultName = injectDefaultFolderName();

  protected readonly folders = this.service.folders;
  /** The shared open form row; only one (Folder or Note) is open at a time. */
  protected readonly row = inject(FormRowService).open;

  /** The Folder waiting for delete confirmation. */
  protected readonly deleting = signal<Folder | null>(null);

  constructor() {
    // A pending delete belongs to the Folder it was asked on.
    effect(() => {
      this.selectedId();
      untracked(() => this.deleting.set(null));
    });
  }

  protected readonly checkNew = (name: string): FolderNameError | null =>
    folderNameError(name, this.folders(), { reserved: DEFAULT_FOLDER_NAMES });

  protected label(folder: Folder): string {
    return folderLabel(folder, this.defaultName());
  }

  protected creating(): boolean {
    return this.row()?.kind === 'new-folder';
  }

  protected renaming(folder: Folder): boolean {
    const row = this.row();
    return row?.kind === 'rename-folder' && row.id === folder.id;
  }

  protected readonly checkRename = (name: string): FolderNameError | null => {
    const row = this.row();
    return folderNameError(name, this.folders(), {
      reserved: DEFAULT_FOLDER_NAMES,
      renamingId: row?.kind === 'rename-folder' ? row.id : undefined,
    });
  };

  protected create(name: string): void {
    const id = this.service.createFolder(name);
    this.row.set(null);
    void this.router.navigate(['/folders', id]);
  }

  protected confirmDelete(): void {
    const folder = this.deleting();
    this.deleting.set(null);
    if (!folder) return;
    this.row.set(null);
    this.service
      .deleteFolder(folder.id)
      .catch((error) => console.error('Could not delete the folder', error));
    // Replace the deleted Folder's URL, so Back doesn't land on it.
    void this.router.navigate(['/folders', DEFAULT_FOLDER_ID], { replaceUrl: true });
  }

  protected rename(folder: Folder, name: string): void {
    if (name !== folder.name) this.service.renameFolder(folder.id, name);
    this.row.set(null);
  }
}
