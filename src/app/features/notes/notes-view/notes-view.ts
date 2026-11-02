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
import { UiLanguageService } from '@core/i18n/ui-language.service';
import { NotesService } from '@core/notes/notes.service';
import { FormRowService } from '@core/ui/form-row.service';
import { TodayService } from '@core/ui/today.service';
import { Note, NoteInput, isOverdue, noteSummary } from '@domain/notes';
import { formatDueDate } from '@features/notes/due-date';
import { NoteForm } from '@features/notes/note-form/note-form';
import { ConfirmDialog } from '@shared/confirm-dialog/confirm-dialog';

/**
 * The selected Folder's Notes: header with counts, the "+" new-note row, the list (tick to
 * complete, tap to edit inline, delete after confirming) and the empty state.
 */
@Component({
  selector: 'app-notes-view',
  imports: [TranslatePipe, NoteForm, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notes-view.html',
  styleUrl: './notes-view.scss',
})
export class NotesView {
  readonly folderId = input.required<string>();
  /** The Folder's name as shown (the Default folder's is translated). */
  readonly folderName = input.required<string>();

  protected readonly service = inject(NotesService);
  private readonly language = inject(UiLanguageService).current;
  /** The shared open form row; only one (Folder or Note) is open at a time. */
  private readonly row = inject(FormRowService).open;
  private readonly today = inject(TodayService).key;

  protected readonly notes = computed(() => this.service.notesIn(this.folderId()));
  protected readonly summary = computed(() => noteSummary(this.notes()));
  protected readonly loaded = this.service.loaded;
  protected readonly creating = computed(() => this.row()?.kind === 'new-note');
  protected readonly editingId = computed(() => {
    const row = this.row();
    return row?.kind === 'edit-note' ? row.id : null;
  });
  /** The Note waiting for delete confirmation. */
  protected readonly deleting = signal<Note | null>(null);

  constructor() {
    // The page is reused across Folders: an open Note form must not follow to another Folder.
    effect(() => {
      this.folderId();
      untracked(() => {
        const kind = this.row()?.kind;
        if (kind === 'new-note' || kind === 'edit-note') this.row.set(null);
        this.deleting.set(null);
      });
    });
  }

  protected startNew(): void {
    this.row.set({ kind: 'new-note' });
  }

  protected startEdit(note: Note): void {
    this.row.set({ kind: 'edit-note', id: note.id });
  }

  protected closeForm(): void {
    this.row.set(null);
  }

  protected create(input: NoteInput): void {
    this.service.createNote(this.folderId(), input);
    this.closeForm();
  }

  protected update(note: Note, input: NoteInput): void {
    const changed =
      input.title !== note.title || input.text !== note.text || input.dueDate !== note.dueDate;
    if (changed) this.service.updateNote(note.id, input);
    this.closeForm();
  }

  protected toggle(note: Note, event: Event): void {
    // Leave the box as the data says; the live list re-renders it once the change lands (and keeps
    // it right if the Note vanished meanwhile).
    (event.target as HTMLInputElement).checked = note.completed;
    this.service.toggleNote(note.id);
  }

  protected confirmDelete(): void {
    const note = this.deleting();
    if (note) this.service.deleteNote(note.id);
    this.deleting.set(null);
  }

  /** How a Note is named in labels and the delete dialog: its title, or the start of its text. */
  protected name(note: Note, length = 40): string {
    // Cut by characters, not UTF-16 units, so an emoji is never split.
    return note.title || Array.from(note.text).slice(0, length).join('');
  }

  protected overdue(note: Note): boolean {
    return isOverdue(note, this.today());
  }

  protected dueLabel(day: string): string {
    return formatDueDate(day, this.language());
  }
}
