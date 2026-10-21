# 02: Sign in and out with Google

**What to build:** A visitor can sign in with Google from the login page and lands on an (empty for now) app shell at `/folders`, with a header showing the app name, the EN | UA toggle, an avatar and "Sign out". Reloading keeps them signed in. Signing out clears the device's cached data and returns to the login page. Visitors who aren't signed in can't reach any app URL. On a device that's offline and has never been signed in, the login page shows "You're offline. Connect to sign in." and the button is disabled until the connection returns. Spec stories 3–14, 69. ADR-0003, ADR-0009. Design: Main (login → app), Mobile-Login-Offline.

**Blocked by:** 01 (App skeleton). Also needs the owner's Firebase web config: a human step, see `docs/setup/firebase.md` (steps 1–6).

**Status:** ready-for-agent

- [ ] `@angular/fire` wired with the owner's config (`authDomain` = `<project>.web.app`); Firestore uses `persistentLocalCache` with multi-tab support.
- [ ] Auth service: the current user as a signal; `signIn()` uses a popup on desktop and a redirect on mobile or standalone display mode, and completes a pending redirect result on startup; `signOut()` signs out, terminates Firestore and clears its persistent cache.
- [ ] Online-status signal driven by `navigator.onLine` and the online/offline events.
- [ ] Login page: the button calls `signIn()`; when offline, the button is disabled and the offline note is shown instead of the sync hint.
- [ ] `authGuard` sends anyone not signed in to `/login`; `/login` sends signed-in users to `/folders`; `**` goes to `/folders`.
- [ ] App shell with a header (brand, toggle, avatar, Sign out) and a router outlet; `/folders` shows a placeholder.
- [ ] `firestore.rules` allows `users/{uid}/**` only when `request.auth.uid == uid`; `.firebaserc` committed.
- [ ] Tests (services replaced through DI by test doubles): the offline login state, the sign-in click, sign-out calling the service, and the guard redirects.
- [ ] Manual: sign in locally (`localhost` authorised), reload and stay signed in, sign out.
