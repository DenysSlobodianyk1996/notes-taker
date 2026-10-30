import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { FoldersService } from '../../../core/folders/folders.service';
import { folderLabel } from '../../../domain/folders';
import { injectDefaultFolderName } from '../default-folder-name';
import { FoldersSidebar } from '../folders-sidebar/folders-sidebar';

/** `/folders/:folderId`: the Folders sidebar next to the selected Folder (its Notes come in 06). */
@Component({
  selector: 'app-folder-page',
  imports: [FoldersSidebar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './folder-page.html',
  styleUrl: './folder-page.scss',
})
export class FolderPage {
  /** The `:folderId` in the URL; the route guard has already checked that it exists. */
  protected readonly folderId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('folderId') ?? '')),
    { initialValue: '' },
  );

  private readonly folders = inject(FoldersService).folders;
  private readonly defaultName = injectDefaultFolderName();

  protected readonly title = computed(() => {
    const folder = this.folders().find((f) => f.id === this.folderId());
    return folder ? folderLabel(folder, this.defaultName()) : '';
  });
}
