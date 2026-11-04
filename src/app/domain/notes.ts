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
  /** Up to five https Links, in the order added (ADR-0013). */
  links: string[];
  createdAt: Date;
  updatedAt: Date;
}

/** What the user enters for a new or edited Note. */
export interface NoteInput {
  title: string;
  text: string;
  dueDate: string | null;
  links: string[];
}

export const NOTE_TITLE_MAX_LENGTH = 200;
export const NOTE_TEXT_MAX_LENGTH = 1000;
export const NOTE_LINKS_MAX = 5;
export const NOTE_LINK_MAX_LENGTH = 2048;

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

/**
 * The Notes matching a search: the query, trimmed, found in the title or the text, ignoring case.
 * An empty query keeps every Note.
 */
export function filterNotes(notes: readonly Note[], query: string): readonly Note[] {
  const q = searchForm(query.trim());
  if (!q) return notes;
  return notes.filter((n) => searchForm(n.title).includes(q) || searchForm(n.text).includes(q));
}

/** One Unicode form (so a pasted "й" matches a typed one), lowercased. */
function searchForm(value: string): string {
  return value.normalize('NFC').toLocaleLowerCase();
}

/**
 * A Link as stored: an absolute `https:` URL with a real host, written the way the browser writes
 * it (`href`). A bare address like `example.com` gets `https://`; any other scheme, `http:`
 * included, gives null (ADR-0013). Anything that isn't null is safe as an `<a href>`.
 */
export function normalizeLink(raw: string): string | null {
  const value = raw.trim();
  if (!value || /\s/.test(value)) return null;
  // A scheme is letters then ":", but "example.com:8443" is a host with a port.
  const scheme = /^([a-z][a-z0-9+.-]*):(?!\d)/i.exec(value)?.[1];
  if (scheme && scheme.toLowerCase() !== 'https') return null;
  let url: URL;
  try {
    url = new URL(scheme ? value : `https://${value}`);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.username || url.password) return null;
  // A host with at least one dot and no empty parts: "example.com", not "localhost" or ".com".
  if (!/^[^.]+(\.[^.]+)+$/.test(url.hostname)) return null;
  return url.href;
}

export type NoteLinkError = 'https' | 'duplicate' | 'maxLength' | 'tooMany';

/** Why a typed Link can't be added to a Note that already has `existing`, or null if it can. */
export function noteLinkError(raw: string, existing: readonly string[]): NoteLinkError | null {
  if (existing.length >= NOTE_LINKS_MAX) return 'tooMany';
  if (raw.trim().length > NOTE_LINK_MAX_LENGTH) return 'maxLength';
  const link = normalizeLink(raw);
  if (!link) return 'https';
  if (link.length > NOTE_LINK_MAX_LENGTH) return 'maxLength';
  return existing.includes(link) ? 'duplicate' : null;
}

/** How a Link is shown: host and path ("example.com/a/b"), without `https://` and `www.`. */
export function shortLink(link: string): string {
  const url = new URL(link);
  let path = url.pathname.replace(/\/$/, '');
  try {
    path = decodeURI(path);
  } catch {
    // A malformed escape stays as it is.
  }
  return url.hostname.replace(/^www\./, '') + path;
}
