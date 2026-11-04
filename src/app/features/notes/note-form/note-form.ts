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
import {
  NOTE_LINKS_MAX,
  NOTE_TEXT_MAX_LENGTH,
  NOTE_TITLE_MAX_LENGTH,
  NoteInput,
  NoteLinkError,
  normalizeLink,
  noteFormErrors,
  noteLinkError,
  shortLink,
} from '@domain/notes';

let nextFormId = 0;

/**
 * The inline form row for a new or edited Note (ADR-0004). Save is disabled while the text is
 * blank. Ctrl/⌘+Enter (or Enter in the title) saves; Enter in the text adds a line; Esc cancels.
 * Enter in the Link field adds the Link (ADR-0013).
 */
@Component({
  selector: 'app-note-form',
  imports: [FormField, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './note-form.html',
  styleUrl: './note-form.scss',
})
export class NoteForm implements OnInit {
  /** A new Note gets a note icon beside its fields. */
  readonly isNew = input(false);

  /** The Note's current fields when editing; empty for a new Note. */
  readonly initial = input<NoteInput>({ title: '', text: '', dueDate: null, links: [] });

  readonly saved = output<NoteInput>();
  readonly cancelled = output<void>();

  protected readonly textMax = NOTE_TEXT_MAX_LENGTH;
  protected readonly linksMax = NOTE_LINKS_MAX;
  protected readonly linkErrorId = `note-link-error-${nextFormId++}`;
  protected readonly shortLink = shortLink;

  /** The Links added so far, as stored; the address being typed; why it was refused, if it was. */
  protected readonly links = signal<string[]>([]);
  protected readonly linkDraft = signal('');
  protected readonly linkError = signal<NoteLinkError | null>(null);

  /** The date input works in `'YYYY-MM-DD'` strings; `''` means no Due date. */
  protected readonly model = signal({ title: '', text: '', dueDate: '' });
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
  private readonly linkInput = viewChild<ElementRef<HTMLInputElement>>('linkInput');

  constructor() {
    afterNextRender(() => this.textArea().nativeElement.focus());
  }

  ngOnInit(): void {
    // Taken once: a change from another device must not wipe what the user is typing.
    const { title, text, dueDate, links } = this.initial();
    this.model.set({ title, text, dueDate: dueDate ?? '' });
    this.links.set([...links]);
  }

  protected typeLink(value: string): void {
    this.linkDraft.set(value);
    this.linkError.set(null);
  }

  /** Enter in the Link field adds it (Ctrl/⌘+Enter saves instead; see the template). */
  protected addLinkFromEnter(event: Event): void {
    event.preventDefault(); // no form submit
    if ((event as KeyboardEvent).isComposing) return;
    this.addLink();
  }

  /**
   * Adds the typed Link. Returns false, with the reason shown, when it can't be added; an empty
   * field (or a full list, where the field is hidden) adds nothing and is fine.
   */
  protected addLink(): boolean {
    const draft = this.linkDraft();
    if (!draft.trim() || this.links().length >= NOTE_LINKS_MAX) return true;
    const error = noteLinkError(draft, this.links());
    const link = error ? null : normalizeLink(draft);
    if (!link) {
      this.linkError.set(error ?? 'https');
      return false;
    }
    this.links.update((links) => [...links, link]);
    this.linkDraft.set('');
    this.linkError.set(null);
    return true;
  }

  protected removeLink(link: string): void {
    this.links.update((links) => links.filter((l) => l !== link));
  }

  protected clearDueDate(): void {
    this.model.update((m) => ({ ...m, dueDate: '' }));
  }

  /** Enter in the title saves, except while an input method is still composing a word. */
  protected saveFromTitle(event: Event): void {
    if ((event as KeyboardEvent).isComposing) return;
    void this.save(event);
  }

  protected async save(event?: Event): Promise<void> {
    event?.preventDefault();
    // An address still in the Link field is saved with the Note, or stops the save with its error.
    if (!this.addLink()) {
      this.linkInput()?.nativeElement.focus();
      return;
    }
    await submit(this.noteForm, async () => {
      const { title, text, dueDate } = this.model();
      this.saved.emit({
        title: title.trim(),
        text: text.trim(),
        dueDate: dueDate || null,
        links: this.links(),
      });
      return undefined;
    });
  }
}
