# One NotesStore interface, two storage adapters

All features read and write Folders and Notes only through a `NotesStore` interface. It has two adapters: Dexie (IndexedDB) for a Guest and Firestore for an Account. The active adapter is picked from the Session mode. Without this, every component would branch on "guest or account", and the move-guest-data flow would have no clean seam to read from one store and write to the other.

## Considered options

- **Firestore only, with Firebase anonymous auth for Guests.** Rejected: guest data would still live in the cloud, and the owner wants guest data to stay on the device.
- **IndexedDB only, plus a custom sync layer.** Rejected: it means writing sync and conflict handling ourselves, which Firestore's offline cache already provides.
