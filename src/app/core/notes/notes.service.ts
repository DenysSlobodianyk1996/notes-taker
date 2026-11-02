import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  CollectionReference,
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { Note, sortNotes } from '@domain/notes';
import { AuthService } from '@core/auth/auth.service';
import { FIRESTORE } from '@core/firebase/firebase';

/**
 * The signed-in Account's Notes, live from Firestore (`users/{uid}/notes`). All of them are
 * followed at once: the sidebar needs every Folder's count, and filtering and sorting in the client
 * needs no Firestore index.
 */
@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly firestore = inject(FIRESTORE);
  private readonly auth = inject(AuthService);
  private readonly all = signal<Note[]>([]);
  private readonly loadedState = signal(false);
  private readonly uid = computed(() => this.auth.user()?.uid ?? null);

  /** False until the first list arrives, so an empty Folder isn't claimed before we know. */
  readonly loaded = this.loadedState.asReadonly();

  private readonly byFolder = computed(() => {
    const groups = new Map<string, Note[]>();
    for (const note of sortNotes(this.all())) {
      const group = groups.get(note.folderId);
      if (group) group.push(note);
      else groups.set(note.folderId, [note]);
    }
    return groups;
  });

  constructor() {
    // Follows whoever is signed in; signing out (here or in another tab) drops the list.
    effect((onCleanup) => {
      const uid = this.uid();
      this.all.set([]);
      this.loadedState.set(false);
      if (!uid) return;
      const stop = onSnapshot(
        this.collection(uid),
        (snapshot) => {
          this.all.set(snapshot.docs.map(toNote));
          this.loadedState.set(true);
        },
        (error) => console.error('Could not load notes', error),
      );
      onCleanup(stop);
    });
  }

  /** A Folder's Notes, newest first. */
  notesIn(folderId: string): Note[] {
    return this.byFolder().get(folderId) ?? [];
  }

  /** How many Notes a Folder holds. */
  countIn(folderId: string): number {
    return this.notesIn(folderId).length;
  }

  /**
   * Creates a Note and returns its id. Title and text are stored trimmed; the text must already be
   * valid (`noteFormErrors`).
   */
  createNote(folderId: string, title: string, text: string): string {
    const uid = this.uid();
    if (!uid) throw new Error('Notes need a signed-in Account');
    if (!folderId) throw new Error('A Note needs a Folder');
    const id = crypto.randomUUID();
    const now = Timestamp.now();
    // Not awaited: offline, the promise only settles once the server has the write. The local
    // cache, and so the live list, has it straight away.
    setDoc(doc(this.collection(uid), id), {
      folderId,
      title: title.trim(),
      text: text.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now,
    }).catch((error) => console.error('Could not save the note', error));
    return id;
  }

  private collection(uid: string): CollectionReference {
    return collection(this.firestore, 'users', uid, 'notes');
  }
}

function toNote(snapshot: QueryDocumentSnapshot): Note {
  const data = snapshot.data();
  const date = (value: unknown): Date => (value as Timestamp | undefined)?.toDate() ?? new Date(0);
  return {
    id: snapshot.id,
    folderId: String(data['folderId'] ?? ''),
    title: String(data['title'] ?? ''),
    text: String(data['text'] ?? ''),
    completed: data['completed'] === true,
    createdAt: date(data['createdAt']),
    updatedAt: date(data['updatedAt']),
  };
}
