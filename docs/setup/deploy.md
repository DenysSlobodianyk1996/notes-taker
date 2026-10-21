# CI and deploy

See [ADR-0007](../adr/0007-branching-and-ci.md) for the branching model.

## Workflows

| File                           | Trigger                      | Steps                                                                      |
| ------------------------------ | ---------------------------- | -------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`     | any pull request into `main` | `npm ci` → format check → lint → typecheck → test → build                  |
| `.github/workflows/deploy.yml` | push to `main`               | `npm ci` → lint → test → build → deploy to Firebase Hosting (live channel) |

The deploy step uses `FirebaseExtended/action-hosting-deploy@v0`.

## One-time: connect GitHub to Firebase

Do this after the Firebase project exists (see [firebase.md](./firebase.md)):

```bash
firebase init hosting:github
```

- **Repository:** `DenysSlobodianyk1996/notes-taker`
- The command creates a service account and stores it as the repo secret `FIREBASE_SERVICE_ACCOUNT_<PROJECT_ID>`. `deploy.yml` reads that secret.
- **Say no** when it offers to write its own workflow files, because the repo already has them.

You can check the secret under **GitHub → repo → Settings → Secrets and variables → Actions**.

## Branch protection (recommended)

Under **GitHub → Settings → Branches**, add a rule for `main`:

- Require a pull request before merging
- Require the `ci` status check to pass

## Local hooks (Husky)

- **pre-commit:** lint-staged (Prettier and ESLint on staged files)
- **pre-push:** type-check (`tsc --noEmit`) and `npm test`
