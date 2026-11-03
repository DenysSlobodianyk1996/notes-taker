# Microsoft Clarity setup (one-time, manual)

UX analytics for the hosted app: session replays and heatmaps (ADR-0011). Free, no credit card.

## 1. Create the project

1. Open <https://clarity.microsoft.com> and sign in.
2. **New project**: name `Notes Taker`, website `https://notes-taker-df334.web.app`.
3. Skip the install instructions: the app loads Clarity itself through `@microsoft/clarity`.

## 2. Privacy settings (required by ADR-0011)

1. **Settings → Masking**: choose **Strict**. The app also masks user content in code (`data-clarity-mask`), so notes stay hidden even if this is changed later.
2. **Settings → Setup**: turn **Cookies** off. Visits are then anonymous and no consent banner is needed.

## 3. Connect the app

1. Copy the project ID from **Settings → Overview** (about 10 letters and digits). It is public: it ends up in every page that loads Clarity.
2. Put it in `src/environments/environment.prod.ts`:

   ```ts
   clarityProjectId: '<your id>',
   ```

3. Open a pull request; the merge deploys it. Development (`ng serve`) and tests use `environment.ts`, whose ID stays empty, so they never load Clarity.

## 4. Check

After the deploy, open the hosted app, click around, and within a few minutes the session shows up under **Recordings**. Note titles, text and Folder names show as masked blocks; the app's own labels and your clicks are visible. Filter by the `lang`, `theme` and `layout` tags.
