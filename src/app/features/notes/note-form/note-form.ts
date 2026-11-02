import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  afterNextRender,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormField, form, maxLength, submit, validate } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { NOTE_TEXT_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH, noteFormErrors } from '@domain/notes';

export interface NoteFields {
  title: string;
  text: string;
}

/**
 * The inline form row for a new or edited Note (ADR-0004). Save is disabled while the text is
 * blank. Ctrl/⌘+Enter (or Enter in the title) saves; Enter in the text adds a line; Esc cancels.
 */
@Component({
  selector: 'app-note-form',
  imports: [FormField, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './note-form.html',
  styleUrl: './note-form.scss',
})
export class NoteForm implements OnInit {
  /** The Note's current fields when editing; empty for a new Note. */
  readonly initial = input<NoteFields>({ title: '', text: '' });

  readonly saved = output<NoteFields>();
  readonly cancelled = output<void>();

  protected readonly textMax = NOTE_TEXT_MAX_LENGTH;

  protected readonly model = signal<NoteFields>({ title: '', text: '' });
  protected readonly noteForm = form(this.model, (path) => {
    // Also sets the native maxlength, so the fields can't take more than the limits.
    maxLength(path.title, NOTE_TITLE_MAX_LENGTH);
    maxLength(path.text, NOTE_TEXT_MAX_LENGTH);
    validate(path.text, ({ value }) => {
      const error = noteFormErrors({ title: '', text: value() }).text;
      return error ? { kind: error } : null;
    });
    validate(path.title, ({ value }) => {
      const error = noteFormErrors({ title: value(), text: 'x' }).title;
      return error ? { kind: error } : null;
    });
  });

  private readonly textArea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textInput');

  constructor() {
    afterNextRender(() => this.textArea().nativeElement.focus());
  }

  ngOnInit(): void {
    // Taken once: a change from another device must not wipe what the user is typing.
    this.model.set({ ...this.initial() });
  }

  /** Enter in the title saves, except while an input method is still composing a word. */
  protected saveFromTitle(event: Event): void {
    if ((event as KeyboardEvent).isComposing) return;
    void this.save(event);
  }

  protected async save(event?: Event): Promise<void> {
    event?.preventDefault();
    await submit(this.noteForm, async () => {
      const { title, text } = this.model();
      this.saved.emit({ title: title.trim(), text: text.trim() });
      return undefined;
    });
  }
}
