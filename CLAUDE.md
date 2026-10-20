# Notes Taker

An Angular 22 PWA for notes grouped into folders. It works as a Guest (IndexedDB on the device) or with a Google Account (Firebase Auth and Firestore), and is hosted on Firebase Hosting.

- Plan: `docs/plan.md`
- Glossary: `CONTEXT.md`. Use its terms (Folder, Note, Guest, Account, Move guest data…) in code, tests and tickets.
- Decisions: `docs/adr/`
- Setup: `docs/setup/firebase.md` and `docs/setup/deploy.md`
- Design: `docs/design/`. This is the source of truth for UI and flows: `notes-taker-design.html` is the standalone prototype, `project/` is the Claude Design canvas source, and the canvas link is in `docs/design/README.md`.

## Workflow

Follows the ask-matt main flow: grill-with-docs → design prototype → `/to-spec` → `/to-tickets` → `/implement` per ticket (TDD), then `/code-review`.

- Branch from `main` as `feature/<slug>`, and open a pull request into `main`.
- Merging into `main` deploys. Never push directly to `main`.

## Agent skills

### Issue tracker

Local markdown under `.scratch/<feature>/` (spec plus one file per ticket). See `docs/agents/issue-tracker.md`.

### Triage labels

The default five roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single context: root `CONTEXT.md` plus `docs/adr/`. See `docs/agents/domain.md`.
