import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { FoldersService } from '@core/folders/folders.service';
import { LayoutService } from '@core/layout/layout.service';
import { folderLabel } from '@domain/folders';
import { injectDefaultFolderName } from '@features/folders/default-folder-name';
import { NotesView } from '@features/notes/notes-view/notes-view';
import { FoldersSidebar } from '@features/folders/folders-sidebar/folders-sidebar';

/**
 * `/folders/:folderId`: the Folders sidebar next to the selected Folder's Notes. On narrow screens
 * the sidebar is a drawer over the Notes, opened from ☰ in the header.
 */
@Component({
  selector: 'app-folder-page',
  host: {
    '[class.narrow]': 'layout.narrow()',
    '(keydown.escape)': 'onEscape($event)',
    '(click)': 'onClick($event)',
  },
  imports: [FoldersSidebar, NotesView],
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

  protected readonly layout = inject(LayoutService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly folders = inject(FoldersService).folders;
  private readonly defaultName = injectDefaultFolderName();

  private readonly folder = computed(() => this.folders().find((f) => f.id === this.folderId()));

  protected readonly title = computed(() => {
    const folder = this.folder();
    return folder ? folderLabel(folder, this.defaultName()) : '';
  });

  /** Esc closes the drawer, unless it was meant for a form row or dialog inside it. */
  protected onEscape(event: Event): void {
    if ((event.target as Element).closest('form, dialog')) return;
    this.layout.closeDrawer();
  }

  /**
   * Tapping the Folder that's already open doesn't navigate, so close the drawer here. Other
   * Folders navigate, which closes it anyway. Ctrl/⌘-clicks open a new tab, so leave it open.
   */
  protected onClick(event: MouseEvent): void {
    if (event.ctrlKey || event.metaKey || event.shiftKey) return;
    if ((event.target as Element).closest('app-folders-sidebar a[aria-current="page"]')) {
      this.layout.closeDrawer({ returnFocus: false });
    }
  }

  constructor() {
    // Focus moves into the drawer when it opens: onto the panel itself, so no folder shows a focus
    // ring after a tap; Tab then reaches the first folder.
    afterRenderEffect(() => {
      if (!this.layout.narrow() || !this.layout.drawerOpen()) return;
      this.host.nativeElement.querySelector<HTMLElement>('app-folders-sidebar nav')?.focus();
    });
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
