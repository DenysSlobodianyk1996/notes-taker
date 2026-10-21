# Firebase Hosting, with authDomain on the hosting domain

The app is hosted on Firebase Hosting (free Spark plan), not GitHub Pages, and `authDomain` is set to the app's own `<project>.web.app` domain. Browsers that block third-party storage (Safari 16.1+, Firefox 109+, Chrome 115+) break Firebase redirect sign-in whenever the auth helper is on a different origin. Serving the helper from our own domain keeps redirect sign-in working, including inside an iOS home-screen PWA, where a popup opens in a separate context and loses the result. Sign-in uses a popup on desktop and a redirect on mobile and in standalone (installed) mode.

## Considered options

- **GitHub Pages, signing in with a popup only.** Rejected: there are long-open firebase-js-sdk issues (#77, #7443) about popup sign-in failing in iOS standalone PWAs, and GitHub Pages can't proxy `/__/auth/` to fix it.
- **GitHub Pages with Google Identity Services, then `signInWithCredential`.** Kept as a fallback in case redirect sign-in still fails on a real iPhone install.

## Consequences

The first implementation work includes testing sign-in on a real iPhone home-screen install. This matters even more since Google sign-in became the only way into the app (ADR-0009). Firebase Hosting also handles SPA deep links with a single rewrite rule, so the `404.html` workaround isn't needed.
