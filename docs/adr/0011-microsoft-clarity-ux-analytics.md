# Microsoft Clarity for UX analytics, with user content masked

To see how the app is really used (where people hesitate, rage-click or miss a control), production loads Microsoft Clarity through the `@microsoft/clarity` package: session replays, heatmaps and Clarity's built-in dashboard. It is the app's first third-party script, so these limits are part of the decision:

- **User content is never recorded.** Note titles and text, Folder names, the Due date chip and the search field carry `data-clarity-mask="true"`, and the Clarity project is set to **Strict** masking. Masking in code keeps notes hidden even if the dashboard setting is later relaxed. The app's own text, layout and clicks stay visible.
- **No cookies, no banner.** The Clarity project runs without cookies, so each visit is anonymous and no consent prompt is needed. The consent API is not called.
- **No identity.** `Clarity.identify` is not called: no uid, email or name is sent.
- **Production only.** Clarity loads only on the hosted app (the project ID lives in the production environment). `ng serve`, tests and builds without the ID never load it.
- **Tags, not events.** Each session is tagged with the UI language, the Theme and the layout (phone or wide) for filtering. No custom events.

## Considered options

- **Consent prompt plus cookies (`consentV2`).** Rejected for now: a personal app with a handful of users doesn't need visits linked across days, and no cookies means no prompt. Revisit if the app gets outside users in the EU, UK or Switzerland.
- **Dashboard masking only.** Rejected: one setting change would expose private notes in replays.
- **Google Analytics or Firebase Analytics.** Rejected: counts without replays; replays are what help find UX problems.
