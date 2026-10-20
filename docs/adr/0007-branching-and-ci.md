# develop/main branching, deploy on main

All work happens on feature branches merged into `develop` through pull requests. Production releases are pull requests from `develop` into `main`. CI runs lint, tests and build on `develop` and on every pull request. Every push to `main` runs the same checks and then deploys to Firebase Hosting. Husky with lint-staged formats and lints staged files on commit, and runs the type-check and tests before each push.
