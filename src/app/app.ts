import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { ThemeService } from './core/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<router-outlet />',
  // Exactly the screen height: the page itself never scrolls; each area scrolls on its own.
  styles: ':host { display: flex; flex-direction: column; height: 100dvh; }',
})
export class App {
  constructor() {
    // Applies the Account's Theme on every page, whether or not the header (and its picker) is there.
    inject(ThemeService);
    const auth = inject(AuthService);
    const router = inject(Router);
    let wasSignedIn: boolean | undefined;
    // Guards only run on navigation, so follow later sign-in changes here: a finished popup
    // sign-in opens the folders, and a session ended elsewhere (another tab) shows the login page.
    effect(() => {
      const signedIn = auth.user() !== null;
      if (wasSignedIn !== undefined && signedIn !== wasSignedIn) {
        void router.navigateByUrl(signedIn ? '/folders' : '/login');
      }
      wasSignedIn = signedIn;
    });
  }
}
