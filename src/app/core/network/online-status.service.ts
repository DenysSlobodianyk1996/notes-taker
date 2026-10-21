import { DOCUMENT, DestroyRef, Injectable, inject, signal } from '@angular/core';

/** Whether the browser thinks it's online (`navigator.onLine` plus the online/offline events). */
@Injectable({ providedIn: 'root' })
export class OnlineStatus {
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly state = signal(this.window?.navigator.onLine ?? true);

  readonly online = this.state.asReadonly();

  constructor() {
    if (!this.window) return;
    const goOnline = (): void => this.state.set(true);
    const goOffline = (): void => this.state.set(false);
    this.window.addEventListener('online', goOnline);
    this.window.addEventListener('offline', goOffline);
    inject(DestroyRef).onDestroy(() => {
      this.window?.removeEventListener('online', goOnline);
      this.window?.removeEventListener('offline', goOffline);
    });
  }
}
