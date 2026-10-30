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
  readonly writes: { path: string; data: Data }[] = [];

  reset(): void {
    this.collections.clear();
    this.listeners = [];
    this.writes.length = 0;
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
  doc: (collection: Ref, id: string): Ref => ({ path: `${collection.path}/${id}`, id }),
  getDoc: async (ref: Ref): Promise<{ exists: () => boolean }> => {
    const { collection, id } = split(ref.path);
    const found = fakeDb.docsIn(collection).has(id);
    return { exists: () => found };
  },
  setDoc: async (ref: Ref, data: Data): Promise<void> => fakeDb.set(ref.path, data),
  updateDoc: async (ref: Ref, data: Data): Promise<void> => {
    const { collection, id } = split(ref.path);
    const current = fakeDb.docsIn(collection).get(id);
    if (!current) throw new Error(`No document to update: ${ref.path}`);
    fakeDb.set(ref.path, { ...current, ...data });
  },
  onSnapshot: (
    collection: Ref,
    next: (snapshot: Snapshot) => void,
    error: (error: unknown) => void,
  ): (() => void) => fakeDb.listen({ collection: collection.path, next, error }),
};

/** Lets queued snapshot callbacks run. */
export async function flushSnapshots(): Promise<void> {
  for (let i = 0; i < 5; i++) await Promise.resolve();
}
