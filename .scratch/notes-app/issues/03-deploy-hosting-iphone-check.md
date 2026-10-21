# 03: Deploy to Firebase Hosting + iPhone sign-in check

**What to build:** Every merge to `main` deploys the app to `https://<project>.web.app` automatically. Refreshing on any deep link (e.g. `/folders/<id>`) works without a 404. Google sign-in is proven on a real iPhone in both Safari and the home-screen app, with the same Account showing the same data. This retires the main risk in ADR-0003 early. Spec stories 6, 15, 68, 71, 73. `docs/setup/deploy.md`.

**Blocked by:** 02 (Sign in and out with Google). Also needs the owner to run `firebase init hosting:github`, which creates the deploy secret.

**Status:** ready-for-agent (with a human device check)

- [x] `firebase.json` serves the production build and rewrites `**` to `/index.html`.
- [x] `deploy.yml` on push to `main`: lint, test, build, then `FirebaseExtended/action-hosting-deploy` to the live channel using the `FIREBASE_SERVICE_ACCOUNT_<PROJECT>` secret.
- [ ] A deep-link refresh on the hosted app returns the app, not a 404.
- [ ] **Human check (Android):** sign in in Chrome, then install the app (Add to Home screen), open it and sign in. Both show the same signed-in state.
- [ ] **Human check (iPhone): deferred.** The owner has no iPhone yet. Redirect sign-in in an iOS home-screen install is unverified (see ADR-0003, Status).
- [ ] Deferred with the iPhone check. If the iPhone home-screen sign-in fails: implement the Google Identity Services → `signInWithCredential` fallback for standalone iOS and record the outcome in ADR-0003.
