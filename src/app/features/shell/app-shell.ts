import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '@core/auth/auth.service';
import { LayoutService } from '@core/layout/layout.service';
import { LanguageToggle } from '@shared/language-toggle/language-toggle';

/**
 * The signed-in frame: a header (☰ on phones, brand, EN | UA, avatar on wide screens, Sign out)
 * above the routed page.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, TranslatePipe, LanguageToggle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  protected readonly auth = inject(AuthService);
  /** The Google photo failed to load; show the person icon instead. */
  protected readonly photoFailed = signal(false);
  protected readonly layout = inject(LayoutService);

  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');

  constructor() {
    // When the user closes the drawer, focus returns to ☰ (where they opened it from).
    let handled = this.layout.returnFocus();
    effect(() => {
      const requests = this.layout.returnFocus();
      if (requests === handled) return;
      handled = requests;
      this.menuButton()?.nativeElement.focus();
    });
  }

  protected signOut(): void {
    void this.auth.signOut();
  }
}
