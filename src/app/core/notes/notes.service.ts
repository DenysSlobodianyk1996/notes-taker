import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  CollectionReference,
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { Note, NoteInput, sortNotes } from '@domain/notes';
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
  createNote(folderId: string, input: NoteInput): string {
    if (!folderId) throw new Error('A Note needs a Folder');
    const id = crypto.randomUUID();
    const now = Timestamp.now();
    this.save(
      setDoc(this.ref(id), {
        folderId,
        ...fields(input),
        completed: false,
        createdAt: now,
        updatedAt: now,
      }),
    );
    return id;
  }

  /** Saves an edited Note: trimmed title and text, the Due date (null clears it). */
  updateNote(id: string, input: NoteInput): void {
    this.save(updateDoc(this.ref(id), { ...fields(input), updatedAt: Timestamp.now() }));
  }

  /** Marks a Note Completed, or not Completed again. */
  toggleNote(id: string): void {
    const note = this.all().find((n) => n.id === id);
    if (!note) return;
    this.save(updateDoc(this.ref(id), { completed: !note.completed, updatedAt: Timestamp.now() }));
  }

  deleteNote(id: string): void {
    this.save(deleteDoc(this.ref(id)));
  }

  /**
   * Writes aren't awaited: offline, the promise only settles once the server has the write. The
   * local cache, and so the live list, has it straight away.
   */
  private save(write: Promise<void>): void {
    write.catch((error) => console.error('Could not save a note change', error));
  }

  private ref(id: string) {
    const uid = this.uid();
    if (!uid) throw new Error('Notes need a signed-in Account');
    return doc(this.collection(uid), id);
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
    dueDate: isDay(data['dueDate']) ? data['dueDate'] : null,
    createdAt: date(data['createdAt']),
    updatedAt: date(data['updatedAt']),
  };
}

function fields(input: NoteInput): { title: string; text: string; dueDate: string | null } {
  return { title: input.title.trim(), text: input.text.trim(), dueDate: input.dueDate || null };
}

/**
 * A stored Due date: a real `'YYYY-MM-DD'` day. Anything else (missing on older Notes, malformed,
 * or impossible like 2026-02-31) means none.
 */
function isDay(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getMonth() === month - 1 && date.getDate() === day;
}
