# Microsoft Clarity for UX analytics, with user content masked

To see how the app is really used (where people hesitate, rage-click or miss a control), production loads Microsoft Clarity through the `@microsoft/clarity` package: session replays, heatmaps and Clarity's built-in dashboard. It is the app's first third-party script, so these limits are part of the decision:

- **What the user writes is never recorded; the app's own UI is.** The Clarity project uses **Balanced** masking (form fields and sensitive-looking text), and the code adds `data-clarity-mask="true"` on everything that holds note content: the note body (title, text, Due date chip and its "Edit note: …" label), the completion checkbox's label ("Mark as completed: …"), the note form's title, text and date fields, the search field and the no-match message that repeats it, the confirm dialog body (it quotes a Note), and the Account avatar (Google photo and name). Labels, buttons, counts, placeholders, layout and clicks stay visible, which is what UX review needs. **Strict** masking was tried first and rejected: it hides all text, so recordings showed no labels at all.
- **Folder names are visible** (sidebar, Folder heading, empty-Folder message, delete-folder dialog heading): the owner judged them not sensitive, and seeing them makes recordings readable.
- **No cookies, no banner.** The Clarity project runs without cookies, so each visit is anonymous and no consent prompt is needed. The consent API is not called.
- **No identity.** `Clarity.identify` is not called: no uid, email or name is sent.
- **Production only.** Clarity loads only on the hosted app (the project ID lives in the production environment). `ng serve`, tests and builds without the ID never load it.
- **Tags, not events.** Each session is tagged with the UI language, the Theme and the layout (phone or wide) for filtering. No custom events.

## Considered options

- **Consent prompt plus cookies (`consentV2`).** Rejected for now: a personal app with a handful of users doesn't need visits linked across days, and no cookies means no prompt. Revisit if the app gets outside users in the EU, UK or Switzerland.
- **Dashboard masking only.** Rejected: one setting change would expose private notes in replays.
- **Google Analytics or Firebase Analytics.** Rejected: counts without replays; replays are what help find UX problems.
