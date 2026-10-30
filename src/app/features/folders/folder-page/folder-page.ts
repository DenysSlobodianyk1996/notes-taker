import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
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

  private readonly folder = computed(() => this.folders().find((f) => f.id === this.folderId()));

  protected readonly title = computed(() => {
    const folder = this.folder();
    return folder ? folderLabel(folder, this.defaultName()) : '';
  });

  constructor() {
    const router = inject(Router);
    // The open Folder disappeared: deleted (here or on another device), or its save was refused.
    // An empty list only means "still loading", so wait for that to fill instead.
    effect(() => {
      const first = this.folders()[0];
      if (first && this.folderId() && !this.folder()) {
        void router.navigate(['/folders', first.id], { replaceUrl: true });
      }
    });
  }
}
