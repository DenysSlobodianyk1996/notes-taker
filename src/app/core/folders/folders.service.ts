import { Injectable, effect, inject, signal, untracked } from '@angular/core';
import {
  CollectionReference,
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { DEFAULT_FOLDER_ID, Folder, normalizeFolderName, sortFolders } from '../../domain/folders';
import { AuthService } from '../auth/auth.service';
import { FIRESTORE } from '../firebase/firebase';

interface Waiter {
  resolve: (folders: Folder[]) => void;
  reject: (error: unknown) => void;
}

/**
 * The signed-in Account's Folders, live from Firestore (`users/{uid}/folders`), Default folder
 * first. The list starts on the first `whenLoaded()` or `ensureDefaultFolder()` call, which the
 * folder routes make before any folder page shows, and stops when the Account signs out.
 */
@Injectable({ providedIn: 'root' })
export class FoldersService {
  private readonly firestore = inject(FIRESTORE);
  private readonly auth = inject(AuthService);
  private readonly list = signal<Folder[]>([]);
  private listening: { uid: string; stop: () => void } | null = null;
  private loaded = false;
  private waiting: Waiter[] = [];
  private ensuring: Promise<void> | null = null;

  /** The Folders: the Default folder first, then the rest oldest first. */
  readonly folders = this.list.asReadonly();

  constructor() {
    // Signed out without a reload (e.g. in another tab): drop the old Account's list and listener.
    effect(() => {
      if (!this.auth.user()) untracked(() => this.stop(new Error('Signed out')));
    });
  }

  /**
   * Resolves with the Folders once at least one has arrived. Every Account has a Default folder,
   * so an empty list only means "not loaded yet" (or a new Account: call `ensureDefaultFolder()`).
   * This also keeps an empty offline cache from hiding the Account's Folders. Rejects if the
   * Folders can't be loaded.
   */
  whenLoaded(): Promise<Folder[]> {
    this.listen();
    if (this.loaded) return Promise.resolve(this.list());
    return new Promise((resolve, reject) => this.waiting.push({ resolve, reject }));
  }

  /**
   * Creates the Account's Default folder unless it already has one. The Default folder always has
   * the id `default`, so even two devices creating it at once end up with one Folder.
   */
  ensureDefaultFolder(): Promise<void> {
    this.ensuring ??= this.createDefaultIfMissing().finally(() => (this.ensuring = null));
    return this.ensuring;
  }

  /**
   * Creates a Folder and returns its id. The name must already be valid (`folderNameError`). The
   * Folder is listed straight away, so the app can navigate to it before Firestore reports back.
   */
  createFolder(name: string): string {
    const folder: Folder = {
      id: crypto.randomUUID(),
      name: name.trim(),
      nameKey: normalizeFolderName(name),
      isDefault: false,
      createdAt: new Date(),
    };
    const { id, ...data } = folder;
    this.save(
      setDoc(doc(this.collection(), id), {
        ...data,
        createdAt: Timestamp.fromDate(data.createdAt),
      }),
    );
    this.list.update((list) => sortFolders([...list, folder]));
    return id;
  }

  /** Renames a Folder. The name must already be valid. The Default folder can't be renamed. */
  renameFolder(id: string, name: string): void {
    if (id === DEFAULT_FOLDER_ID || this.list().find((f) => f.id === id)?.isDefault) {
      throw new Error("The Default folder can't be renamed");
    }
    this.save(
      updateDoc(doc(this.collection(), id), {
        name: name.trim(),
        nameKey: normalizeFolderName(name),
      }),
    );
  }

  /**
   * Writes aren't awaited: offline, the promise only settles once the server has the write. The
   * local cache, and so the live list, has it straight away.
   */
  private save(write: Promise<void>): void {
    write.catch((error) => console.error('Could not save a folder change', error));
  }

  private async createDefaultIfMissing(): Promise<void> {
    this.listen();
    if (this.list().some((f) => f.isDefault)) return;

    const ref = doc(this.collection(), DEFAULT_FOLDER_ID);
    try {
      if ((await getDoc(ref)).exists()) return;
    } catch {
      // Offline with nothing cached: write anyway. Rewriting the same document is harmless.
    }
    this.save(setDoc(ref, { name: '', nameKey: '', isDefault: true, createdAt: Timestamp.now() }));
  }

  /** Follows the signed-in Account's Folders; switches over if the Account changed. */
  private listen(): void {
    const uid = this.uid();
    if (this.listening?.uid === uid) return;
    this.stop(new Error('The Account changed'));
    const stop = onSnapshot(
      this.collection(),
      (snapshot) => {
        this.list.set(sortFolders(snapshot.docs.map(toFolder)));
        if (!snapshot.empty) {
          this.loaded = true;
          this.settle((w) => w.resolve(this.list()));
        }
      },
      (error) => {
        console.error('Could not load folders', error);
        // Firestore has ended this listener; the next call starts a fresh one.
        this.stop(error);
      },
    );
    this.listening = { uid, stop };
  }

  /** Stops listening, clears the list and fails anyone still waiting for it. */
  private stop(reason: unknown): void {
    this.listening?.stop();
    this.listening = null;
    this.list.set([]);
    this.loaded = false;
    this.settle((w) => w.reject(reason));
  }

  private settle(action: (waiter: Waiter) => void): void {
    const waiting = this.waiting;
    this.waiting = [];
    waiting.forEach(action);
  }

  private collection(): CollectionReference {
    return collection(this.firestore, 'users', this.uid(), 'folders');
  }

  private uid(): string {
    const uid = this.auth.user()?.uid;
    if (!uid) throw new Error('Folders need a signed-in Account');
    return uid;
  }
}

function toFolder(snapshot: QueryDocumentSnapshot): Folder {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: String(data['name'] ?? ''),
    nameKey: String(data['nameKey'] ?? ''),
    isDefault: data['isDefault'] === true,
    createdAt: (data['createdAt'] as Timestamp | undefined)?.toDate() ?? new Date(0),
  };
}
