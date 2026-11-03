import { firebaseConfig } from './firebase.config';

/** Development and tests. Production builds use environment.prod.ts instead (angular.json). */
export const environment = {
  firebase: firebaseConfig,
  /** Microsoft Clarity (ADR-0011): off outside production. */
  clarityProjectId: '',
};
