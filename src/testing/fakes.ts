import { Provider, signal } from '@angular/core';
import { User } from 'firebase/auth';
import { vi } from 'vitest';
import { AuthService } from '../app/core/auth/auth.service';
import { OnlineStatus } from '../app/core/network/online-status.service';

/** Stands in for AuthService: set `user` to sign in or out, and check the spies. */
export class FakeAuthService {
  readonly user = signal<User | null>(null);
  readonly signIn = vi.fn(async () => undefined);
  readonly signOut = vi.fn(async () => undefined);

  /** Signs in as a minimal Google user. */
  signInAs(fields: Partial<User> = {}): void {
    this.user.set({ uid: 'u1', displayName: 'Ada Lovelace', photoURL: null, ...fields } as User);
  }
}

/** Stands in for OnlineStatus: flip `online` to simulate the connection dropping or returning. */
export class FakeOnlineStatus {
  readonly online = signal(true);
}

export function provideFakeAuth(fake = new FakeAuthService()): Provider {
  return { provide: AuthService, useValue: fake };
}

export function provideFakeOnlineStatus(fake = new FakeOnlineStatus()): Provider {
  return { provide: OnlineStatus, useValue: fake };
}
