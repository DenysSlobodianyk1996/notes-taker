import { DOCUMENT, DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/** Below this width the Folders sidebar becomes a drawer (design: 900px breakpoint). */
const NARROW = '(max-width: 899.98px)';

/** The screen size class and the Folders drawer it implies on phones (ticket 10). */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly narrowState = signal(false);
  private readonly drawerState = signal(false);

  /** True on screens narrower than 900px. */
  readonly narrow = this.narrowState.asReadonly();
  /** Whether the Folders drawer is open (only meaningful when narrow). */
  readonly drawerOpen = this.drawerState.asReadonly();
  private readonly focusRequests = signal(0);
  /** Bumps when the user closes the drawer themselves; focus should go back to ☰. */
  readonly returnFocus = this.focusRequests.asReadonly();

  constructor() {
    const query = this.window?.matchMedia?.(NARROW);
    if (query) {
      this.narrowState.set(query.matches);
      const onChange = (event: { matches: boolean }): void => {
        this.narrowState.set(event.matches);
        if (!event.matches) this.drawerState.set(false);
      };
      // Older Safari (before 14) only has addListener.
      if (query.addEventListener) {
        query.addEventListener('change', onChange);
        inject(DestroyRef).onDestroy(() => query.removeEventListener('change', onChange));
      } else {
        query.addListener(onChange);
        inject(DestroyRef).onDestroy(() => query.removeListener(onChange));
      }
    }
    // Picking or creating a Folder navigates; the drawer then gets out of the way.
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.drawerState.set(false));
  }

  openDrawer(): void {
    this.drawerState.set(true);
  }

  /**
   * Closes the drawer. `returnFocus` (the default) sends focus back to ☰, for closes the user asked
   * for (backdrop, Esc); a close that leads somewhere else, like opening a Folder, passes false.
   */
  closeDrawer({ returnFocus = true } = {}): void {
    if (!this.drawerState()) return;
    this.drawerState.set(false);
    if (returnFocus) this.focusRequests.update((n) => n + 1);
  }
}
