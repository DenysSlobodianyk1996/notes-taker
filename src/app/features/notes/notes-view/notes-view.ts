import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { NotesService } from '../../../core/notes/notes.service';
import { noteSummary } from '../../../domain/notes';
import { NoteFields, NoteForm } from '../note-form/note-form';

/** The selected Folder's Notes: header with counts, the "+" new-note row, the list, empty state. */
@Component({
  selector: 'app-notes-view',
  imports: [TranslatePipe, NoteForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notes-view.html',
  styleUrl: './notes-view.scss',
})
export class NotesView {
  readonly folderId = input.required<string>();
  /** The Folder's name as shown (the Default folder's is translated). */
  readonly folderName = input.required<string>();

  private readonly service = inject(NotesService);

  protected readonly notes = computed(() => this.service.notesIn(this.folderId()));
  protected readonly summary = computed(() => noteSummary(this.notes()));
  protected readonly creating = signal(false);
  protected readonly loaded = this.service.loaded;

  constructor() {
    // The page is reused across Folders: a new-note draft must not follow to another Folder.
    effect(() => {
      this.folderId();
      untracked(() => this.creating.set(false));
    });
  }

  protected create(fields: NoteFields): void {
    this.service.createNote(this.folderId(), fields.title, fields.text);
    this.creating.set(false);
  }
}
