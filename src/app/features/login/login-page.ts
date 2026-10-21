import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageToggle } from '../../shared/language-toggle/language-toggle';

/** The only way into the app: sign in with Google (ADR-0009). Sign-in is wired up in ticket 02. */
@Component({
  selector: 'app-login-page',
  imports: [TranslatePipe, LanguageToggle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {}
