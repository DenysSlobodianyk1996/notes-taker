import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { OnlineStatus } from '../../core/network/online-status.service';
import { LanguageToggle } from '../../shared/language-toggle/language-toggle';

/** The only way into the app: sign in with Google (ADR-0009). Disabled while offline. */
@Component({
  selector: 'app-login-page',
  imports: [TranslatePipe, LanguageToggle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  protected readonly online = inject(OnlineStatus).online;

  protected signIn(): void {
    void this.auth.signIn();
  }
}
