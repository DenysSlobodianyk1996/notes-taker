import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import {
  Auth,
  browserPopupRedirectResolver,
  indexedDBLocalPersistence,
  initializeAuth,
} from 'firebase/auth';
import {
  Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP');
export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH');
export const FIRESTORE = new InjectionToken<Firestore>('FIRESTORE');

/**
 * Sets up the Firebase SDK directly (no AngularFire: it has no Angular 22 release, see ADR-0009).
 * Auth stays signed in across reloads; Firestore keeps an offline cache shared by all tabs.
 */
export function provideFirebase(options: FirebaseOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: FIREBASE_APP, useFactory: () => initializeApp(options) },
    {
      provide: FIREBASE_AUTH,
      useFactory: (app: FirebaseApp) =>
        initializeAuth(app, {
          persistence: indexedDBLocalPersistence,
          popupRedirectResolver: browserPopupRedirectResolver,
        }),
      deps: [FIREBASE_APP],
    },
    {
      provide: FIRESTORE,
      useFactory: (app: FirebaseApp) =>
        initializeFirestore(app, {
          localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
        }),
      deps: [FIREBASE_APP],
    },
  ]);
}
