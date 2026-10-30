/**
 * The Default folder's name in every UI language (`folders.defaultName`); no other Folder may use
 * them (ADR-0008). Kept here rather than imported from the translation files, so the app bundle
 * doesn't carry every translation; a test keeps the two in step.
 */
export const DEFAULT_FOLDER_NAMES: readonly string[] = ['General', 'Загальне'];
