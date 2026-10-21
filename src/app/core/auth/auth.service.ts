import { DOCUMENT, Injectable, Injector, inject, signal } from '@angular/core';
import { FirebaseError } from 'firebase/app';
import {
  GoogleAuthProvider,
  User,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { clearIndexedDbPersistence, terminate } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE } from '../firebase/firebase';
import { SignInContext, signInMethod } from './sign-in-method';

/** The user closed or replaced the popup: not an error worth reporting. */
const CANCELLED = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request']);

/** Google sign-in and sign-out (ADR-0003, ADR-0009). Exposes the signed-in Account's user. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(FIREBASE_AUTH);
  // Firestore is created on first use (sign-out here, data features later), not at startup.
  private readonly injector = inject(Injector);
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly current = signal<User | null>(null);

  /** The signed-in user, or null when signed out. */
  readonly user = this.current.asReadonly();

  constructor() {
    onAuthStateChanged(this.auth, (user) => this.current.set(user));
  }

  /** Finishes a pending redirect sign-in and waits for the saved session. Call once at startup. */
  async ready(): Promise<void> {
    try {
      await getRedirectResult(this.auth);
    } catch (error) {
      console.error('Google sign-in (redirect) failed', error);
    }
    await this.auth.authStateReady();
    this.current.set(this.auth.currentUser);
  }

  async signIn(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      if (signInMethod(this.context()) === 'redirect') {
        await signInWithRedirect(this.auth, provider);
      } else {
        await this.signInWithPopupOrRedirect(provider);
      }
    } catch (error) {
      console.error('Google sign-in failed', error);
    }
  }

  /**
   * Signs out and removes this device's cached copy of the Account's data, then reloads on the
   * login page so the next sign-in starts with a fresh Firestore instance.
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      const firestore = this.injector.get(FIRESTORE);
      await terminate(firestore);
      // Fails if another tab still has the app open; that tab's cache then stays until next time.
      await clearIndexedDbPersistence(firestore);
    } catch (error) {
      console.error('Sign-out did not finish cleanly', error);
    } finally {
      this.window?.location.assign('/login');
    }
  }

  /** Popup on desktop; falls back to a redirect if the browser blocks the popup. */
  private async signInWithPopupOrRedirect(provider: GoogleAuthProvider): Promise<void> {
    try {
      await signInWithPopup(this.auth, provider);
    } catch (error) {
      const code = error instanceof FirebaseError ? error.code : '';
      if (code === 'auth/popup-blocked') {
        await signInWithRedirect(this.auth, provider);
      } else if (!CANCELLED.has(code)) {
        throw error;
      }
    }
  }

  private context(): SignInContext {
    const matches = (query: string): boolean => this.window?.matchMedia?.(query).matches ?? false;
    const iosStandalone = (this.window?.navigator as { standalone?: boolean } | undefined)
      ?.standalone;
    return {
      standalone: matches('(display-mode: standalone)') || iosStandalone === true,
      coarsePointer: matches('(pointer: coarse)'),
    };
  }
}
