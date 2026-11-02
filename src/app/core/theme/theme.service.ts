import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { AuthService } from '@core/auth/auth.service';
import { FIRESTORE } from '@core/firebase/firebase';
import { DEFAULT_THEME, THEMES, Theme, parseTheme } from '@domain/theme';

/** The sticky-note glyph of public/icons/icon.svg (a test keeps the two identical). */
export const FAVICON_GLYPH_PATH =
  'M200-200h360v-200h200v-360H200v560Zm0 80q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h' +
  '560q33 0 56.5 23.5T840-760v400L600-120H200Zm80-280v-80h200v80H280Zm0-160v-80h400v80H280Zm-80 ' +
  '360v-560 560Z';

/** The app icon with the tile in a Theme's accent, for the browser tab. */
function faviconFor(accent: string): string {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">' +
    `<rect width="56" height="56" rx="14" fill="${accent}"/>` +
    '<svg x="12" y="12" width="32" height="32" viewBox="0 -960 960 960">' +
    `<path fill="#1C1C1E" d="${FAVICON_GLYPH_PATH}"/></svg></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * The Account's Theme (ADR-0010): stored as `theme` on `users/{uid}`, followed live so a change on
 * another device shows here. Applies it as `data-theme` on <html> (the accent CSS variables), the
 * browser bar colour and the tab icon. Signed out it is always Orange, as on the login page.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly firestore = inject(FIRESTORE);
  private readonly auth = inject(AuthService);
  private readonly document = inject(DOCUMENT);
  private readonly uid = computed(() => this.auth.user()?.uid ?? null);
  private readonly saved = signal<Theme>(DEFAULT_THEME);
  private readonly originalFavicon =
    this.document.querySelector('link[rel="icon"][type="image/svg+xml"]')?.getAttribute('href') ??
    null;

  /** The current Theme; Orange while signed out. */
  readonly theme = computed(() => (this.uid() ? this.saved() : DEFAULT_THEME));

  constructor() {
    effect((onCleanup) => {
      const uid = this.uid();
      this.saved.set(DEFAULT_THEME);
      if (!uid) return;
      const stop = onSnapshot(
        doc(this.firestore, 'users', uid),
        (snapshot) => this.saved.set(parseTheme(snapshot.data()?.['theme'])),
        (error) => console.error('Could not load the Theme', error),
      );
      onCleanup(stop);
    });
    effect(() => this.apply(this.theme(), this.uid() !== null));
  }

  /** Applies a Theme here at once and saves it in the Account (merged with other settings). */
  setTheme(theme: Theme): void {
    const uid = this.uid();
    if (!uid) return;
    this.saved.set(theme);
    // Not awaited: offline, the promise only settles once the server has the write.
    setDoc(doc(this.firestore, 'users', uid), { theme }, { merge: true }).catch((error) =>
      console.error('Could not save the Theme', error),
    );
  }

  private apply(theme: Theme, signedIn: boolean): void {
    const root = this.document.documentElement;
    const accent = THEMES.find((t) => t.id === theme)?.accent ?? THEMES[0].accent;
    if (signedIn) root.dataset['theme'] = theme;
    else delete root.dataset['theme'];
    this.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', accent);
    const icon = this.document.querySelector('link[rel="icon"][type="image/svg+xml"]');
    const href = signedIn && theme !== DEFAULT_THEME ? faviconFor(accent) : this.originalFavicon;
    if (icon && href) icon.setAttribute('href', href);
  }
}
