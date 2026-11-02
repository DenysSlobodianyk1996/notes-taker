import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';

let nextId = 0;

/**
 * A confirmation on the native `<dialog>` (ADR-0004): `showModal()` traps focus and makes the page
 * behind inert; Esc or Cancel closes it. Used only for deletes, so the confirm button is red.
 */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  readonly open = input(false);
  readonly heading = input.required<string>();
  readonly body = input.required<string>();
  readonly confirmLabel = input.required<string>();
  readonly cancelLabel = input.required<string>();

  readonly confirmed = output<void>();
  /** Closed without confirming: Cancel, Esc. */
  readonly cancelled = output<void>();

  /** Unique per dialog, so several on one page don't share a heading id. */
  protected readonly headingId = `confirm-heading-${++nextId}`;

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private confirming = false;

  constructor() {
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open() && !dialog.open) {
        this.confirming = false;
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  protected confirm(): void {
    this.confirming = true;
    this.dialog().nativeElement.close();
    this.confirmed.emit();
  }

  protected cancel(): void {
    this.dialog().nativeElement.close();
  }

  /** Fires however the dialog closed; only a close without confirming counts as cancel. */
  protected onClose(): void {
    if (!this.confirming && this.open()) this.cancelled.emit();
    this.confirming = false;
  }
}
