# Notes Taker

An installable notes app (PWA) for iOS, Android and desktop. Keep short notes in folders, tick them off when they're done, and search inside a folder.

- **Sign in with Google:** your notes are stored in Firebase and sync across your browsers, the installed app and all your devices. They also work offline once you've signed in. The app never sees your password.
- **Interface in English or Ukrainian** (EN | UA toggle). Your own folder names and notes are never translated.

> Status: design review. See [docs/plan.md](docs/plan.md) and the [design prototype](docs/design/README.md).

## Stack

Angular 22 (standalone, signals, Signal Forms), ngx-translate (EN/UA), plain SCSS, Material Symbols, Firebase (Auth, Firestore, Hosting), Vitest, ESLint, Prettier and Husky.

## Docs

| What                                                      | Where                                                                                                                                                            |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan                                                      | [docs/plan.md](docs/plan.md)                                                                                                                                     |
| Glossary                                                  | [CONTEXT.md](CONTEXT.md)                                                                                                                                         |
| Decisions (ADRs)                                          | [docs/adr/](docs/adr/)                                                                                                                                           |
| Firebase setup                                            | [docs/setup/firebase.md](docs/setup/firebase.md)                                                                                                                 |
| CI and deploy                                             | [docs/setup/deploy.md](docs/setup/deploy.md)                                                                                                                     |
| Design (Claude Design canvas + standalone HTML prototype) | [Claude Design canvas](https://claude.ai/artifact/TXP1WiDr5cb8hvjZvpV68G) · [docs/design/](docs/design/) · [open prototype](docs/design/notes-taker-design.html) |
| Spec and tickets                                          | `.scratch/notes-app/`                                                                                                                                            |

## Branches

`feature/*` → `main`, through pull requests only. A push to `main` deploys to Firebase Hosting.
