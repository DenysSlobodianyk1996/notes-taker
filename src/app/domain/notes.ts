/** A Note in one Folder of the signed-in Account (CONTEXT.md). */
export interface Note {
  id: string;
  folderId: string;
  /** Optional heading; empty when the Note has none. */
  title: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
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
