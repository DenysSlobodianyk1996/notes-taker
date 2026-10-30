import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FoldersService } from '../../../core/folders/folders.service';
import { DEFAULT_FOLDER_NAMES } from '../../../core/i18n/default-folder-names';
import { Folder, FolderNameError, folderLabel, folderNameError } from '../../../domain/folders';
import { injectDefaultFolderName } from '../default-folder-name';
import { FolderNameForm } from '../folder-name-form/folder-name-form';

/** Which form row is open: a new Folder, renaming one, or none. Only one at a time. */
type Editing = { mode: 'new' } | { mode: 'rename'; id: string } | null;

/**
 * The Account's Folders, Default folder first. New and renamed Folders use an inline form row;
 * the Default folder is locked against rename and delete.
 */
@Component({
  selector: 'app-folders-sidebar',
  imports: [RouterLink, TranslatePipe, FolderNameForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './folders-sidebar.html',
  styleUrl: './folders-sidebar.scss',
})
export class FoldersSidebar {
  /** The id of the Folder whose Notes are shown. */
  readonly selectedId = input<string>();

  private readonly service = inject(FoldersService);
  private readonly router = inject(Router);
  private readonly defaultName = injectDefaultFolderName();

  protected readonly folders = this.service.folders;
  protected readonly editing = signal<Editing>(null);

  protected readonly checkNew = (name: string): FolderNameError | null =>
    folderNameError(name, this.folders(), { reserved: DEFAULT_FOLDER_NAMES });

  protected label(folder: Folder): string {
    return folderLabel(folder, this.defaultName());
  }

  protected renaming(folder: Folder): boolean {
    const editing = this.editing();
    return editing?.mode === 'rename' && editing.id === folder.id;
  }

  protected readonly checkRename = (name: string): FolderNameError | null => {
    const editing = this.editing();
    return folderNameError(name, this.folders(), {
      reserved: DEFAULT_FOLDER_NAMES,
      renamingId: editing?.mode === 'rename' ? editing.id : undefined,
    });
  };

  protected create(name: string): void {
    const id = this.service.createFolder(name);
    this.editing.set(null);
    void this.router.navigate(['/folders', id]);
  }

  protected rename(folder: Folder, name: string): void {
    if (name !== folder.name) this.service.renameFolder(folder.id, name);
    this.editing.set(null);
  }
}
