# Folder name uniqueness is enforced in the client

Folder names must be unique per user after `trim().toLowerCase()`. Each Folder stores a `nameKey` holding that normalised form. Firestore can't enforce uniqueness while the device is offline, and doing it on the server would need a transaction or an index document per name. So the check runs in the client against the user's loaded Folders, and Folder merge resolves any clashes when guest data moves. With one user per Account, a clash from two devices editing offline at the same moment is accepted as a rare edge case.
