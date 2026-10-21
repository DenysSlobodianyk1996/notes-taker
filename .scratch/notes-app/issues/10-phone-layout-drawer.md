# 10: Phone layout: drawer and compact header

**What to build:** On screens narrower than 900px, the sidebar is hidden and a ☰ button in the header opens it as a drawer over the content, with a dimmed backdrop. Tapping the backdrop or picking a Folder closes it. The header drops the avatar so the EN | UA toggle and "Sign out" fit, including the longer Ukrainian labels. Touch targets are at least 36–44px. Spec stories 61–63. Design: Mobile-List, Mobile-Drawer, Mobile-List-UA.

**Blocked by:** 04 (Folders sidebar with the Default folder)

**Status:** ready-for-agent

- [ ] A breakpoint signal (900px) used by the shell; the ☰ button has an accessible "Open folders" label; the backdrop button has "Close folders".
- [ ] The drawer closes on folder pick, on backdrop tap and on Esc; focus moves into the drawer when it opens and returns to ☰ when it closes.
- [ ] The compact header hides the avatar; nothing wraps or overflows at 390px wide in either language.
- [ ] Tests: shell component tests for opening and closing the drawer and closing it on folder pick, with the breakpoint signal faked.
