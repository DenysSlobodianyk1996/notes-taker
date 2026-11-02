import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from '@core/theme/theme.service';
import { THEMES, Theme } from '@domain/theme';

const ARROWS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/**
 * The header's palette button and its popover of Theme circles: a radio group with one Tab stop,
 * arrow keys to move. Picking one (click, Enter, Space) applies and saves it. Esc, a click outside
 * or tabbing away closes the popover without a change.
 */
@Component({
  selector: 'app-theme-picker',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './theme-picker.html',
  styleUrl: './theme-picker.scss',
  host: {
    '(keydown.escape)': 'close()',
    '(keydown)': 'onArrow($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class ThemePicker {
  private readonly service = inject(ThemeService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly themes = THEMES;
  protected readonly current = this.service.theme;
  protected readonly open = signal(false);

  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button');
  private readonly swatches = viewChildren<ElementRef<HTMLButtonElement>>('swatch');

  constructor() {
    // Focus the current Theme once, when the popover opens; later re-renders (a Theme changed on
    // another device) must not move focus.
    let wasOpen = false;
    afterRenderEffect(() => {
      const open = this.open();
      const swatches = this.swatches();
      if (open && !wasOpen && swatches.length) {
        const index = untracked(() => THEMES.findIndex((t) => t.id === this.current()));
        swatches[Math.max(index, 0)].nativeElement.focus();
      }
      wasOpen = open && swatches.length > 0;
    });
  }

  protected toggle(): void {
    this.open.update((open) => !open);
  }

  protected close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.button().nativeElement.focus();
  }

  protected pick(theme: Theme): void {
    this.service.setTheme(theme);
    this.close();
  }

  /** Arrow keys move between the Themes (wrapping round), as in any radio group. */
  protected onArrow(event: KeyboardEvent): void {
    const step = ARROWS[event.key];
    if (!step) return;
    const swatches = this.swatches().map((ref) => ref.nativeElement);
    const from = swatches.indexOf(event.target as HTMLButtonElement);
    if (from < 0) return; // only while a Theme circle has focus
    event.preventDefault();
    swatches[(from + step + swatches.length) % swatches.length]?.focus();
  }

  /** Tabbing out of the picker closes it (without pulling focus back). */
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (this.open() && next && !this.host.nativeElement.contains(next)) this.open.set(false);
  }
}
