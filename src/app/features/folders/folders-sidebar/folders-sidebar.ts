import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FoldersService } from '../../../core/folders/folders.service';
import { Folder, folderLabel } from '../../../domain/folders';
import { injectDefaultFolderName } from '../default-folder-name';

/** The Account's Folders, oldest first. The Default folder is locked against rename and delete. */
@Component({
  selector: 'app-folders-sidebar',
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './folders-sidebar.html',
  styleUrl: './folders-sidebar.scss',
})
export class FoldersSidebar {
  /** The id of the Folder whose Notes are shown. */
  readonly selectedId = input<string>();

  protected readonly folders = inject(FoldersService).folders;
  private readonly defaultName = injectDefaultFolderName();

  protected label(folder: Folder): string {
    return folderLabel(folder, this.defaultName());
  }
}
