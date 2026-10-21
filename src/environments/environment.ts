/** Public Firebase web config: safe to commit, access is enforced by firestore.rules. */
export const environment = {
  firebase: {
    apiKey: 'AIzaSyBvaf1aWBltfv17HkozXEl5t4ec_HV5ipI',
    // The hosting domain, not firebaseapp.com, so redirect sign-in works (ADR-0003).
    authDomain: 'notes-taker-df334.web.app',
    projectId: 'notes-taker-df334',
    storageBucket: 'notes-taker-df334.firebasestorage.app',
    messagingSenderId: '443702703956',
    appId: '1:443702703956:web:e5598de0f8763276b43ac1',
  },
};
