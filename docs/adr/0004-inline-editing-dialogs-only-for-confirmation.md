# Inline create and edit, with dialogs only for confirmation

Creating and editing Folders and Notes happens inline in their list. A new row with a form appears at the top of the list, and clicking a row turns it into a form with Submit and Cancel. There is no autosave. Native `<dialog>` is used only for confirmations: deleting a Folder or a Note. The owner wants the list to stay the single working surface, without modal popups for everyday edits.
