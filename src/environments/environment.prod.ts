import { firebaseConfig } from './firebase.config';

/** Production builds (replaces environment.ts, see angular.json). */
export const environment = {
  firebase: firebaseConfig,
  /**
   * Microsoft Clarity (ADR-0011): the "Notes Taker" project, docs/setup/clarity.md. Public: it is
   * in every page that loads Clarity.
   */
  clarityProjectId: 'z7wvfu4416',
};
