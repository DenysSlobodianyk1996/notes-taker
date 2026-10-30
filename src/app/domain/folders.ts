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
