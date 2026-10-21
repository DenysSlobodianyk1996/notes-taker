# Firebase setup (one-time, manual)

Everything here is free on the **Spark** plan, and no credit card is needed.

| Service                          | Free limit (Spark)                                         |
| -------------------------------- | ---------------------------------------------------------- |
| Authentication (Google provider) | 50,000 monthly active users                                |
| Firestore                        | 1 GiB stored, 50K reads / 20K writes / 20K deletes per day |
| Hosting                          | 10 GB storage, 360 MB/day transfer                         |

Limits: <https://firebase.google.com/pricing>

## 1. Create the project

1. Open <https://console.firebase.google.com>, click **Add project**, and name it `notes-taker` (Firebase may add a suffix).
2. Google Analytics isn't needed; leave it off.
3. Write down the **project ID**, for example `notes-taker-1a2b3`. It's used below as `<project>`.

## 2. Register the web app

1. In **Project settings → General → Your apps**, click the **</>** (Web) icon.
2. Nickname it `notes-taker-web`, and tick **Also set up Firebase Hosting**.
3. Copy the `firebaseConfig` object. It goes into `src/environments/environment.ts` and `environment.prod.ts`. These values are public and safe to commit; security comes from the Firestore rules.
4. **Change `authDomain`** from `<project>.firebaseapp.com` to `<project>.web.app` (see [ADR-0003](../adr/0003-firebase-hosting-and-sign-in-strategy.md)).

## 3. Enable Google sign-in

1. Go to **Build → Authentication → Get started → Sign-in method → Google**, then **Enable**.
2. Pick a project support email and **Save**.
3. Under **Authentication → Settings → Authorized domains**, make sure these are listed:
   - `localhost` (for `ng serve`)
   - `<project>.web.app`
   - `<project>.firebaseapp.com`
4. Because `authDomain` is `<project>.web.app`, the OAuth client must allow the redirect URL on that domain:
   - Open <https://console.cloud.google.com/apis/credentials> with the same project selected.
   - Open **OAuth 2.0 Client IDs → Web client (auto created by Google Service)**.
   - Under **Authorized redirect URIs**, add `https://<project>.web.app/__/auth/handler`, then **Save**. It can take a few minutes to take effect.

## 4. Create Firestore

1. Go to **Build → Firestore Database → Create database**.
2. Pick a location close to you, for example `eur3` (Europe multi-region). **It can't be changed later.**
3. Start in **production mode**. The real rules are deployed from the repo in step 6.

## 5. Install the CLI locally

```bash
npm i -g firebase-tools
firebase login
firebase use --add   # pick <project>, alias "default"
```

This writes `.firebaserc`, which is committed.

## 6. Deploy security rules

The rules live in `firestore.rules` and give each user access to their own data only:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

```bash
firebase deploy --only firestore:rules
```

## 7. Hosting

`firebase.json` serves `dist/notes-taker/browser`, and rewrites `**` to `/index.html` so refreshing on `/folders/<id>` never returns a 404. Deploys normally run from CI (see [deploy.md](./deploy.md)). To deploy by hand:

```bash
npm run build && firebase deploy --only hosting
```

The app is then at `https://<project>.web.app`.

## 8. Check on real devices

- **iPhone:** open the URL in Safari, choose **Share → Add to Home Screen**, launch the app from the icon, then **Sign in with Google**. You should come back signed in.
- **Android:** open the URL in Chrome and choose **Install app**, then sign in the same way.
- If sign-in in the iPhone home-screen app fails, record the result in ADR-0003 and switch to the Google Identity Services fallback.
