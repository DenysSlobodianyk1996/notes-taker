# Notes Taker

A personal notes app, installable as a PWA, for keeping short notes grouped into folders. You sign in with Google, and your notes sync across all your devices, including the installed app.

## Language

### Content

**Folder**:
A named, flat group of Notes in one Account. Folders cannot contain other Folders.
_Avoid_: Notebook, category, group, list

**Folder name**:
The label of a Folder. Two Folders in the same Account can't share a name once surrounding spaces are trimmed and case is ignored ("Work" and " work " clash).
_Avoid_: Title (reserved for Notes)

**Default folder**:
The one Folder each Account gets automatically on its first sign-in. It has no stored name; it is always shown in the current UI language ("General" in EN, "Загальне" in UA). It can't be renamed or deleted, so at least one Folder always exists. It is recognised by its default marker, and both of its display names are reserved: no other Folder may use them.
_Avoid_: Inbox, root folder, main folder

**Note**:
A single entry inside exactly one Folder. It has an optional Title, required Text, an optional Due date, and can be Completed.
_Avoid_: Item, todo, task, entry

**Title**:
The optional short heading of a Note.

**Text**:
The required body of a Note, up to 1000 characters.
_Avoid_: Description, content, body

**Due date**:
The optional day (no time) by which a Note should be Completed. It can be set, changed or cleared. It never changes the order of Notes.
_Avoid_: Deadline, reminder, due time

**Overdue**:
A Note whose Due date is before today and that isn't Completed. It is highlighted in red.
_Avoid_: Late, expired

**Completed**:
A state of a Note, switched on or off with its checkbox. A Completed Note stays in the list but is shown crossed out.
_Avoid_: Done, checked, archived

### People and settings

**Theme**:
The Account's chosen accent colour for the app: Orange (the default), Pink or Purple. It is stored in the Account, so it is the same on every device. The login page is always Orange.
_Avoid_: Skin, colour scheme, dark mode

**Account**:
The signed-in Google user. All Folders and Notes belong to exactly one Account, are stored in the cloud, and sync across devices, including edits made offline. The app can only be used signed in; there is no guest use (ADR-0009).
_Avoid_: Profile, guest, anonymous user

**UI language**:
The language of the app's own interface text: English (EN) or Ukrainian (UA). It is chosen per device and never changes user content. Folder names, Titles and Text stay exactly as typed.
_Avoid_: Locale (in conversation), translation of notes
