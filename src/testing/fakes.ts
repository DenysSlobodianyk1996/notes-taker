import { Provider, signal } from '@angular/core';
import { User } from 'firebase/auth';
import { vi } from 'vitest';
import { AuthService } from '@core/auth/auth.service';
import { LayoutService } from '@core/layout/layout.service';
import { FoldersService } from '@core/folders/folders.service';
import { NotesService } from '@core/notes/notes.service';
import { OnlineStatus } from '@core/network/online-status.service';
import { Folder } from '@domain/folders';
import { Note, NoteInput, sortNotes } from '@domain/notes';

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
  readonly createFolder = vi.fn((name: string) => {
    const folder = aFolder({ id: 'new-folder', name, createdAt: new Date('2026-12-01') });
    this.folders.update((list) => [...list, folder]);
    return folder.id;
  });
  readonly renameFolder = vi.fn();
  readonly deleteFolder = vi.fn(async (id: string) => {
    this.folders.update((list) => list.filter((f) => f.id !== id));
  });
}

export function provideFakeFolders(fake = new FakeFoldersService()): Provider {
  return { provide: FoldersService, useValue: fake };
}

/** A Note with sensible defaults for tests. */
export function aNote(fields: Partial<Note> = {}): Note {
  return {
    id: 'n1',
    folderId: 'default',
    title: '',
    text: 'Buy milk',
    completed: false,
    dueDate: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...fields,
  };
}

/** Stands in for NotesService: set `notes` (any order) and check the spies. */
export class FakeNotesService {
  readonly notes = signal<Note[]>([]);
  readonly loaded = signal(true);
  notesIn(folderId: string): Note[] {
    return sortNotes(this.notes().filter((n) => n.folderId === folderId));
  }
  countIn(folderId: string): number {
    return this.notesIn(folderId).length;
  }
  readonly createNote = vi.fn((folderId: string, input: NoteInput) => {
    const note = aNote({
      id: `new-${this.notes().length}`,
      folderId,
      ...input,
      createdAt: new Date(),
    });
    this.notes.update((list) => [...list, note]);
    return note.id;
  });
  readonly updateNote = vi.fn((id: string, input: NoteInput) => {
    this.notes.update((list) => list.map((n) => (n.id === id ? { ...n, ...input } : n)));
  });
  readonly toggleNote = vi.fn((id: string) => {
    this.notes.update((list) =>
      list.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n)),
    );
  });
  readonly deleteNote = vi.fn((id: string) => {
    this.notes.update((list) => list.filter((n) => n.id !== id));
  });
}

export function provideFakeNotes(fake = new FakeNotesService()): Provider {
  return { provide: NotesService, useValue: fake };
}

/** Stands in for LayoutService: set `narrow` for a phone-sized screen; the drawer works for real. */
export class FakeLayoutService {
  readonly narrow = signal(false);
  readonly drawerOpen = signal(false);
  readonly openDrawer = vi.fn(() => this.drawerOpen.set(true));
  readonly returnFocus = signal(0);
  readonly closeDrawer = vi.fn(({ returnFocus = true } = {}) => {
    if (!this.drawerOpen()) return;
    this.drawerOpen.set(false);
    if (returnFocus) this.returnFocus.update((n) => n + 1);
  });
}

export function provideFakeLayout(fake = new FakeLayoutService()): Provider {
  return { provide: LayoutService, useValue: fake };
}
