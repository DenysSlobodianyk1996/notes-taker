export type SignInMethod = 'popup' | 'redirect';

export interface SignInContext {
  /** Running as an installed app (display-mode: standalone, or iOS navigator.standalone). */
  standalone: boolean;
  /** The main pointer is a finger, i.e. a phone or tablet. */
  coarsePointer: boolean;
}

/**
 * Popup on desktop; redirect on touch devices and in the installed app, where popups are
 * unreliable (an iOS home-screen app loses the popup's result). See ADR-0003.
 */
export function signInMethod({ standalone, coarsePointer }: SignInContext): SignInMethod {
  return standalone || coarsePointer ? 'redirect' : 'popup';
}
