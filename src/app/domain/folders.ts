/** A Folder of the signed-in Account (CONTEXT.md). */
export interface Folder {
  id: string;
  /** As typed, trimmed. Empty for the Default folder, which is shown by translation instead. */
  name: string;
  /** `name` trimmed and lowercased, used to keep Folder names unique (ADR-0005). */
  nameKey: string;
  isDefault: boolean;
  createdAt: Date;
}

/** The Default folder's document id: fixed, so creating it twice still gives one Folder. */
export const DEFAULT_FOLDER_ID = 'default';

/**
 * The Default folder first, then the rest oldest first. Folders created at the same moment keep a
 * stable order by id.
 */
export function sortFolders(folders: readonly Folder[]): Folder[] {
  return [...folders].sort(
    (a, b) =>
      Number(b.isDefault) - Number(a.isDefault) ||
      a.createdAt.getTime() - b.createdAt.getTime() ||
      a.id.localeCompare(b.id),
  );
}

/**
 * The name to show: the Default folder follows the UI language (`defaultName` is the
 * `folders.defaultName` translation); every other Folder shows its stored name untranslated.
 */
export function folderLabel(
  folder: Pick<Folder, 'name' | 'isDefault'>,
  defaultName: string,
): string {
  return folder.isDefault ? defaultName : folder.name;
}

export const FOLDER_NAME_MAX_LENGTH = 50;

/** Why a Folder name can't be used; matches the `folders.errors.*` translation keys. */
export type FolderNameError = 'required' | 'maxLength' | 'taken';

/**
 * The form Folder names are compared in (and stored as `nameKey`): one Unicode form (so "é" typed
 * or pasted matches), trimmed, lowercased.
 */
export function normalizeFolderName(name: string): string {
  return name.normalize('NFC').trim().toLowerCase();
}

/**
 * Checks a Folder name for create or rename (ADR-0005). `reserved` holds the Default folder's name
 * in every UI language, which no other Folder may use; `renamingId` is the Folder being renamed,
 * which may keep its own name.
 */
export function folderNameError(
  name: string,
  folders: readonly Folder[],
  options: { reserved: readonly string[]; renamingId?: string },
): FolderNameError | null {
  const trimmed = name.trim();
  if (!trimmed) return 'required';
  // Counted in characters, not UTF-16 units, so an emoji counts once.
  if ([...trimmed].length > FOLDER_NAME_MAX_LENGTH) return 'maxLength';
  const key = normalizeFolderName(trimmed);
  const reserved = options.reserved.some((n) => normalizeFolderName(n) === key);
  const used = folders.some(
    (f) => !f.isDefault && f.id !== options.renamingId && f.nameKey === key,
  );
  return reserved || used ? 'taken' : null;
}
