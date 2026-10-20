# Move guest data merges Folders and removes Duplicate notes

When a Guest signs in, they are offered Move guest data instead of losing or hiding what they wrote. A Guest Folder whose name clashes with an Account Folder is merged into it (a Folder merge). Duplicate notes (same trimmed Title and Text, ignoring case) are kept once, using the Account copy, and that copy is Completed if either side was. All other Notes are added. After a successful move the Guest store is wiped. If the person declines, the Guest data stays on the device and the offer comes back at the next sign-in. The merge is a pure function (`mergeGuestData`) so it can be fully unit tested apart from either store.

## Default folders

Folders match by name only, even Default folders. A Guest "Загальне" and an Account "General" stay two separate folders after the move. The Account keeps its own Default folder, so a Guest Default folder that arrives under a different name becomes an ordinary, deletable Folder. The offer to move isn't shown at all when the Guest has nothing but an empty Default folder, and that check uses the default marker, not the name, because the folder may have been renamed or created in either language.
