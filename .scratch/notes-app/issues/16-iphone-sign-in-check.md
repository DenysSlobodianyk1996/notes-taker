# 16: iPhone sign-in check

**What to build:** Prove Google sign-in on a real iPhone, in Safari and in the home-screen app (Add to Home Screen), with the same Account showing the same data. This is the open risk in ADR-0003. Moved here from ticket 03, which closed without it because no iPhone was available. Spec stories 6, 15.

**Blocked by:** an iPhone to test on

**Status:** ready-for-human

- [ ] **Human check (iPhone):** sign in in Safari, then Add to Home Screen, open the app and sign in. Both show the same signed-in state and the same Notes.
- [ ] While there, the iPhone part of ticket 11's offline check: go offline, add, edit and complete a Note, reconnect, and see the changes on another device.
- [ ] If the home-screen sign-in fails: implement the Google Identity Services → `signInWithCredential` fallback for standalone iOS.
- [ ] Record the outcome in ADR-0003 (Status).
