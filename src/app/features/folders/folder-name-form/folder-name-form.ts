import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  OnInit,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormField, form, submit, validate } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { FolderNameError } from '../../../domain/folders';

/**
 * The inline form row for a new or renamed Folder (ADR-0004): ✓ or Enter saves, ✕ or Esc cancels.
 * Errors show once the user tries to save, then follow their typing.
 */
@Component({
  selector: 'app-folder-name-form',
  imports: [FormField, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './folder-name-form.html',
  styleUrl: './folder-name-form.scss',
})
export class FolderNameForm implements OnInit {
  /** The current name when renaming; empty for a new Folder. */
  readonly initialName = input('');
  /** Translation key for the ✓ button's accessible name. */
  readonly saveLabel = input.required<string>();
  /** Checks a name against the Account's Folders (`folderNameError`). */
  readonly check = input.required<(name: string) => FolderNameError | null>();

  readonly saved = output<string>();
  readonly cancelled = output<void>();

  protected readonly model = signal({ name: '' });
  protected readonly nameForm = form(this.model, (path) => {
    validate(path.name, ({ value }) => {
      const error = this.check()(value());
      return error ? { kind: error } : null;
    });
  });

  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');

  constructor() {
    afterNextRender(() => this.input().nativeElement.focus());
  }

  ngOnInit(): void {
    // Taken once: a rename from another device must not wipe what the user is typing.
    this.model.set({ name: this.initialName() });
  }

  protected error(): string | null {
    const field = this.nameForm.name();
    return field.touched() ? (field.errors()[0]?.kind ?? null) : null;
  }

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.nameForm, async () => {
      this.saved.emit(this.model().name.trim());
      return undefined;
    });
  }
}
