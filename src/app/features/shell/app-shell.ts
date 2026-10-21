import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageToggle } from '../../shared/language-toggle/language-toggle';

/** The signed-in frame: a header (brand, EN | UA, avatar, Sign out) above the routed page. */
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

  protected signOut(): void {
    void this.auth.signOut();
  }
}
