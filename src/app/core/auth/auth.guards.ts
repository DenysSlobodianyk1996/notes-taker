import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** App pages: anyone not signed in goes to the login page. */
export const authGuard: CanActivateFn = () =>
  inject(AuthService).user() ? true : inject(Router).createUrlTree(['/login']);

/** The login page: signed-in users go straight to their folders. */
export const signedOutGuard: CanActivateFn = () =>
  inject(AuthService).user() ? inject(Router).createUrlTree(['/folders']) : true;
