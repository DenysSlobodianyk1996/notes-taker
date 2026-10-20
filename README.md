# Notes Taker

An installable notes app (PWA) for iOS, Android and desktop. Keep short notes in folders, tick them off when they're done, and search inside a folder.

- **Guest mode:** notes stay on this device (IndexedDB).
- **Google sign-in:** notes sync through Firebase and work offline. On first sign-in, your guest notes can be moved into the account.

> Status: planning. See [docs/plan.md](docs/plan.md).

## Stack

Angular 22 (standalone, signals, Signal Forms), plain SCSS, Material Symbols, Dexie, Firebase (Auth, Firestore, Hosting), Vitest, ESLint, Prettier and Husky.

## Docs

| What | Where |
| --- | --- |
| Plan | [docs/plan.md](docs/plan.md) |
| Glossary | [CONTEXT.md](CONTEXT.md) |
| Decisions (ADRs) | [docs/adr/](docs/adr/) |
| Firebase setup | [docs/setup/firebase.md](docs/setup/firebase.md) |
| CI and deploy | [docs/setup/deploy.md](docs/setup/deploy.md) |
| Design | [docs/design/](docs/design/) |
| Spec and tickets | `.scratch/notes-app/` |

## Branches

`feature/*` → `main`, through pull requests only. A push to `main` deploys to Firebase Hosting.
