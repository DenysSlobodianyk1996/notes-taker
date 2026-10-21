# Google sign-in only, Firestore used directly

The app can only be used signed in with Google. There is no guest mode. Every Folder and Note lives in Firestore under `users/{uid}`, with Firestore's `persistentLocalCache` for offline use, so the same notes appear in every browser, in the installed PWA and on every device.

The trigger was iOS. A home-screen web app gets **storage separate from Safari**, so guest notes written in Safari never appear in the installed app, and vice versa (Android and desktop Chrome share storage between the browser and the installed app). Guest mode would therefore behave differently per platform and lose notes in a confusing way. Requiring sign-in removes that whole class of problems. It also removes the IndexedDB (Dexie) store, the move-guest-data dialog and its merge and dedupe rules (ADR-0006), and the session-mode concept.

With only one store left, the `NotesStore` interface (ADR-0002) is removed as well. `FoldersService` and `NotesService` call `@angular/fire/firestore` directly. The rules worth testing (folder-name normalisation, uniqueness with reserved Default-folder names, folder labels, note filtering) live in pure functions under `core/domain/` and are unit tested on their own. Service tests mock AngularFire; the Firebase emulator can be added later if needed.

- **Offline before the first sign-in:** the login page shows "You're offline. Connect to sign in." and disables the button. After one sign-in, the app works offline from the cache.
- **The Default folder** is created on an Account's first sign-in, when it has no folders.
- **Passwords** are never seen or stored by the app or by Firebase; Google handles the sign-in. Notes aren't end-to-end encrypted, so the Firebase project owner can read them in the console.

## Considered options

- **Keep guest mode (IndexedDB) next to Google sign-in.** Rejected for the iOS storage split above, and for the extra code: a second store, plus moving and merging data on sign-in.
- **Keep the `NotesStore` interface with an in-memory fake for tests.** Rejected by the owner as unneeded indirection for a single store. The pure domain functions carry the testable rules instead.
- **Firebase anonymous auth as "guest".** Not chosen. It would sync per device but still lose data on sign-out or reinstall, and add account-linking work.
