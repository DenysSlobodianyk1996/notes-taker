# Feature branches straight to main, deploy on main

All work happens on short-lived `feature/*` branches, each merged into `main` through a pull request. There is no `develop` branch: this is a one-person project, and an extra integration branch would only add merge overhead. CI runs lint, tests and build on every pull request. Every push to `main` runs the same checks and then deploys to Firebase Hosting, so `main` is always what's live. Husky with lint-staged formats and lints staged files on commit, and runs the type-check and tests before each push.
