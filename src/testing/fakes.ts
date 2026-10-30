import { Provider, signal } from '@angular/core';
import { User } from 'firebase/auth';
import { vi } from 'vitest';
import { AuthService } from '../app/core/auth/auth.service';
import { FoldersService } from '../app/core/folders/folders.service';
import { OnlineStatus } from '../app/core/network/online-status.service';
import { Folder } from '../app/domain/folders';

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

/** A Folder with sensible defaults for tests. */
export function aFolder(fields: Partial<Folder> = {}): Folder {
  const name = fields.name ?? 'Work';
  return {
    id: name.toLowerCase() || 'default',
    name,
    nameKey: name.trim().toLowerCase(),
    isDefault: false,
    createdAt: new Date('2026-01-01'),
    ...fields,
  };
}

/** The Default folder, as stored: no name, shown by translation. */
export function aDefaultFolder(fields: Partial<Folder> = {}): Folder {
  return aFolder({ id: 'default', name: '', isDefault: true, ...fields });
}

/** Stands in for FoldersService: set `folders` (oldest first) and check the spies. */
export class FakeFoldersService {
  readonly folders = signal<Folder[]>([]);
  readonly ensureDefaultFolder = vi.fn(async () => {
    if (!this.folders().some((f) => f.isDefault)) {
      this.folders.update((list) => [aDefaultFolder(), ...list]);
    }
  });
  readonly whenLoaded = vi.fn(async () => this.folders());
}

export function provideFakeFolders(fake = new FakeFoldersService()): Provider {
  return { provide: FoldersService, useValue: fake };
}
