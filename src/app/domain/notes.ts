/** A Note in one Folder of the signed-in Account (CONTEXT.md). */
export interface Note {
  id: string;
  folderId: string;
  /** Optional heading; empty when the Note has none. */
  title: string;
  text: string;
  completed: boolean;
  /** A local calendar day, `'YYYY-MM-DD'`, or null for none. */
  dueDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** What the user enters for a new or edited Note. */
export interface NoteInput {
  title: string;
  text: string;
  dueDate: string | null;
}

export const NOTE_TITLE_MAX_LENGTH = 200;
export const NOTE_TEXT_MAX_LENGTH = 1000;

/** Newest first; Completed Notes keep their place. Same-moment Notes keep a stable order by id. */
export function sortNotes(notes: readonly Note[]): Note[] {
  return [...notes].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime() || a.id.localeCompare(b.id),
  );
}

export type NoteFieldError = 'required' | 'maxLength';

/**
 * What's wrong with a new or edited Note's fields, if anything. Lengths count after trimming, the
 * same way the fields' `maxlength` and the "N / 1000" counter do (UTF-16 units).
 */
export function noteFormErrors(fields: { title: string; text: string }): {
  title?: NoteFieldError;
  text?: NoteFieldError;
} {
  const errors: { title?: NoteFieldError; text?: NoteFieldError } = {};
  const text = fields.text.trim();
  if (!text) errors.text = 'required';
  else if (text.length > NOTE_TEXT_MAX_LENGTH) errors.text = 'maxLength';
  if (fields.title.trim().length > NOTE_TITLE_MAX_LENGTH) errors.title = 'maxLength';
  return errors;
}

/** The counts shown under a Folder's name. */
export function noteSummary(notes: readonly Note[]): { count: number; completed: number } {
  return { count: notes.length, completed: notes.filter((n) => n.completed).length };
}

/** A local calendar day as `'YYYY-MM-DD'`, the form Due dates are stored in. */
export function todayKey(now: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Overdue: the Due date is before `today` (`'YYYY-MM-DD'`) and the Note isn't Completed. */
export function isOverdue(note: Pick<Note, 'dueDate' | 'completed'>, today: string): boolean {
  return note.dueDate !== null && !note.completed && note.dueDate < today;
}
