/**
 * An in-memory stand-in for the parts of `firebase/firestore` the app uses. Use it with
 * `vi.mock('firebase/firestore', async () => (await import('…/fake-firestore')).fakeFirestoreModule)`
 * (a dynamic import: a static one isn't ready when the hoisted mock runs), and seed or inspect `fakeDb`.
 */

type Data = Record<string, unknown>;

interface Ref {
  path: string;
  id: string;
}
interface Snapshot {
  docs: { id: string; data: () => Data }[];
  empty: boolean;
}
interface Listener {
  collection: string;
  next: (snapshot: Snapshot) => void;
  error: (error: unknown) => void;
}
interface DocSnapshot {
  exists: () => boolean;
  data: () => Data | undefined;
}
interface DocListener {
  path: string;
  next: (snapshot: DocSnapshot) => void;
}

export class FakeTimestamp {
  constructor(private readonly date: Date) {}
  toDate(): Date {
    return this.date;
  }
  static now(): FakeTimestamp {
    return new FakeTimestamp(new Date());
  }
  static fromDate(date: Date): FakeTimestamp {
    return new FakeTimestamp(date);
  }
}

class FakeDb {
  private readonly collections = new Map<string, Map<string, Data>>();
  private listeners: Listener[] = [];
  private docListeners: DocListener[] = [];
  readonly writes: { path: string; data: Data }[] = [];
  /** Paths deleted by each committed write batch. */
  readonly batches: string[][] = [];

  reset(): void {
    this.collections.clear();
    this.listeners = [];
    this.docListeners = [];
    this.writes.length = 0;
    this.batches.length = 0;
  }

  seed(collection: string, id: string, data: Data): void {
    this.docsIn(collection).set(id, data);
  }

  docsIn(collection: string): Map<string, Data> {
    let docs = this.collections.get(collection);
    if (!docs) {
      docs = new Map();
      this.collections.set(collection, docs);
    }
    return docs;
  }

  set(path: string, data: Data): void {
    const { collection, id } = split(path);
    this.docsIn(collection).set(id, data);
    this.writes.push({ path, data });
    for (const l of this.listeners.filter((x) => x.collection === collection)) {
      // Real Firestore reports changes asynchronously; so does the fake.
      queueMicrotask(() => l.next(this.snapshot(collection)));
    }
    for (const l of this.docListeners.filter((x) => x.path === path)) {
      queueMicrotask(() => l.next(this.docSnapshot(path)));
    }
  }

  listenToDoc(listener: DocListener): () => void {
    this.docListeners.push(listener);
    queueMicrotask(() => listener.next(this.docSnapshot(listener.path)));
    return () => (this.docListeners = this.docListeners.filter((l) => l !== listener));
  }

  docSnapshot(path: string): DocSnapshot {
    const { collection, id } = split(path);
    const data = this.docsIn(collection).get(id);
    return { exists: () => data !== undefined, data: () => data };
  }

  remove(path: string): void {
    const { collection, id } = split(path);
    this.docsIn(collection).delete(id);
    this.writes.push({ path, data: { deleted: true } });
    for (const l of this.listeners.filter((x) => x.collection === collection)) {
      queueMicrotask(() => l.next(this.snapshot(collection)));
    }
  }

  listen(listener: Listener): () => void {
    this.listeners.push(listener);
    queueMicrotask(() => listener.next(this.snapshot(listener.collection)));
    return () => (this.listeners = this.listeners.filter((l) => l !== listener));
  }

  /** Ends every listener with an error, as Firestore does on e.g. permission-denied. */
  failListeners(error: unknown): void {
    const listeners = this.listeners;
    this.listeners = [];
    listeners.forEach((l) => l.error(error));
  }

  snapshot(collection: string): Snapshot {
    const docs = [...this.docsIn(collection)].map(([id, data]) => ({ id, data: () => data }));
    return { docs, empty: docs.length === 0 };
  }
}

function split(path: string): { collection: string; id: string } {
  const at = path.lastIndexOf('/');
  return { collection: path.slice(0, at), id: path.slice(at + 1) };
}

export const fakeDb = new FakeDb();

export const fakeFirestoreModule = {
  Timestamp: FakeTimestamp,
  collection: (_db: unknown, ...segments: string[]): Ref => ({
    path: segments.join('/'),
    id: segments[segments.length - 1],
  }),
  /** `doc(collectionRef, id)` or `doc(db, 'users', uid)`, like the real one. */
  doc: (parent: unknown, ...segments: string[]): Ref => {
    const base = (parent as Partial<Ref>).path;
    const path = [...(base ? [base] : []), ...segments].join('/');
    return { path, id: segments[segments.length - 1] };
  },
  getDoc: async (ref: Ref): Promise<{ exists: () => boolean }> => {
    const { collection, id } = split(ref.path);
    const found = fakeDb.docsIn(collection).has(id);
    return { exists: () => found };
  },
  setDoc: async (ref: Ref, data: Data, options?: { merge?: boolean }): Promise<void> => {
    const { collection, id } = split(ref.path);
    const current = options?.merge ? fakeDb.docsIn(collection).get(id) : undefined;
    fakeDb.set(ref.path, { ...current, ...data });
  },
  updateDoc: async (ref: Ref, data: Data): Promise<void> => {
    const { collection, id } = split(ref.path);
    const current = fakeDb.docsIn(collection).get(id);
    if (!current) throw new Error(`No document to update: ${ref.path}`);
    fakeDb.set(ref.path, { ...current, ...data });
  },
  where: (field: string, _op: '==', value: unknown) => ({ field, value }),
  query: (collection: Ref, ...filters: { field: string; value: unknown }[]) => ({
    collection: collection.path,
    filters,
  }),
  getDocs: async (q: { collection: string; filters: { field: string; value: unknown }[] }) => {
    const docs = [...fakeDb.docsIn(q.collection)]
      .filter(([, data]) => q.filters.every((f) => data[f.field] === f.value))
      .map(([id, data]) => ({ id, data: () => data, ref: { path: `${q.collection}/${id}`, id } }));
    return { docs, empty: docs.length === 0 };
  },
  deleteDoc: async (ref: Ref): Promise<void> => fakeDb.remove(ref.path),
  writeBatch: () => {
    const deletes: string[] = [];
    return {
      delete(ref: Ref) {
        deletes.push(ref.path);
        return this;
      },
      async commit(): Promise<void> {
        fakeDb.batches.push([...deletes]);
        deletes.forEach((path) => fakeDb.remove(path));
      },
    };
  },
  /** A collection (odd path length) or a single document (even path length), like the real one. */
  onSnapshot: (
    ref: Ref,
    next: (snapshot: never) => void,
    error: (error: unknown) => void,
  ): (() => void) =>
    ref.path.split('/').length % 2 === 0
      ? fakeDb.listenToDoc({ path: ref.path, next: next as (s: DocSnapshot) => void })
      : fakeDb.listen({ collection: ref.path, next: next as (s: Snapshot) => void, error }),
};

/** Lets queued snapshot callbacks run. */
export async function flushSnapshots(): Promise<void> {
  for (let i = 0; i < 5; i++) await Promise.resolve();
}
