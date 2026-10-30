# Account settings live on the users/{uid} document

The Theme is the first setting that belongs to the Account rather than the device (the UI language stays per device, ADR-0008). It is stored as a field on the `users/{uid}` document, written with `setDoc(..., { merge: true })`, and read live with `onSnapshot`, so a change on one device reaches the others. Further Account settings go on the same document as more fields.

The existing security rule (`match /users/{uid}/{document=**}`) already covers the document itself, so no rules change is needed. A missing or unknown value falls back to the default.

## Considered options

- **A `users/{uid}/settings/ui` document.** Rejected: a second document and listener for a handful of fields, with no benefit at this size.
- **Device only (`localStorage`).** Rejected: the Theme should follow the Account across devices.
- **Firestore plus a local copy for an instant first paint.** Rejected for now: the Firestore offline cache usually answers within moments, and a brief Orange flash on reload is acceptable.
