# Folder name uniqueness is enforced in the client

Folder names must be unique per Account after `trim().toLowerCase()`. Each Folder stores a `nameKey` holding that normalised form. Firestore can't enforce uniqueness while the device is offline, and doing it on the server would need a transaction or an index document per name. So the check runs in the client against the Account's loaded Folders. With one person per Account, a clash from two devices editing offline at the same moment is accepted as a rare edge case.

The Default folder's display names, the `folders.defaultName` value in every UI language ("general", "загальне"), are also reserved. An ordinary Folder can't use them, so it never looks identical to the Default folder in either language. The same "A folder with this name already exists" error is shown.
