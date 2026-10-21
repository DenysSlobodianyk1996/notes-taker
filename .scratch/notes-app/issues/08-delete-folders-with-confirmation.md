# 08: Delete folders with confirmation

**What to build:** On the selected non-default Folder, a delete icon opens the confirm dialog: "Delete '<Folder>'?" with "The folder and all its notes (notes: N) will be deleted. This can't be undone." (or "This empty folder will be deleted."). Confirming removes the Folder and all its Notes in one go, and the user lands in the Default folder. The Default folder can never be deleted. Spec stories 32–34. Design: Desktop-DeleteFolder.

**Blocked by:** 05 (Create and rename folders inline), 07 (Edit, complete and delete notes, which provides the shared confirm dialog)

**Status:** ready-for-agent

- [ ] Folders service: `deleteFolder(id)` deletes the folder document and all notes with that `folderId` in one batched write; it refuses the Default folder.
- [ ] The sidebar delete icon appears only on the selected non-default Folder and opens the shared confirm dialog with the translated texts and the note count.
- [ ] After deleting, navigate to the Default folder.
- [ ] Tests: the service batches the folder and its notes and refuses the Default folder (Firebase SDK mocked); the sidebar only calls `deleteFolder` after confirming; the empty-folder text; the navigation afterwards (services replaced through DI).
