# Notes Taker

A personal notes app, installable as a PWA, for keeping short notes grouped into folders. It works without an account (Guest), or with a Google account so notes sync across devices.

## Language

### Content

**Folder**:
A named, flat group of Notes owned by one user. Folders cannot contain other Folders.
_Avoid_: Notebook, category, group, list

**Folder name**:
The label of a Folder. Two Folders of the same user can't share a name once surrounding spaces are trimmed and case is ignored ("Work" and " work " clash).
_Avoid_: Title (reserved for Notes)

**Default folder**:
The Folder named "General", created automatically whenever a user has no Folders, so at least one Folder always exists.
_Avoid_: Inbox, root folder

**Note**:
A single entry inside exactly one Folder. It has an optional Title, required Text, and can be Completed.
_Avoid_: Item, todo, task, entry

**Title**:
The optional short heading of a Note.

**Text**:
The required body of a Note, up to 1000 characters.
_Avoid_: Description, content, body

**Completed**:
A state of a Note, switched on or off with its checkbox. A Completed Note stays in the list but is shown crossed out.
_Avoid_: Done, checked, archived

### People and storage

**Guest**:
Someone using the app without signing in. Their Folders and Notes live only on the current device.
_Avoid_: Anonymous user, offline user

**Account**:
A user signed in with Google. Their Folders and Notes are stored in the cloud and sync across devices, including edits made offline.
_Avoid_: Profile, cloud user

**Session mode**:
Which of the two a person has chosen on the login page: Guest or Account. It is remembered across page reloads until sign-out.
_Avoid_: Login state

### Flows

**Move guest data**:
After a Guest signs in to an Account, the one-time offer to copy all Guest Folders and Notes into the Account and then erase the Guest copy. Declining keeps the Guest data on the device, and the offer is made again at the next sign-in.
_Avoid_: Import, migration, sync

**Folder merge**:
During Move guest data, a Guest Folder whose Folder name clashes with an Account Folder is folded into that Account Folder instead of being created again.

**Duplicate note**:
During a Folder merge, two Notes whose trimmed Title and trimmed Text both match, ignoring case. Only the Account copy is kept, and it is Completed if either copy was.
