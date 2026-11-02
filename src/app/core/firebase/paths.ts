import { CollectionReference, Firestore, collection } from 'firebase/firestore';

/** The signed-in Account's Notes: `users/{uid}/notes` (one place for the path). */
export function notesCollection(firestore: Firestore, uid: string): CollectionReference {
  return collection(firestore, 'users', uid, 'notes');
}
