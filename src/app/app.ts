import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<router-outlet />',
  styles: ':host { display: flex; flex-direction: column; min-height: 100dvh; }',
})
export class App {
  constructor() {
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
