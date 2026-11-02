import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { todayKey } from '@domain/notes';

/**
 * Today's local date as `'YYYY-MM-DD'`, updated just after midnight, so Overdue Notes turn red
 * even in an app left open overnight.
 */
@Injectable({ providedIn: 'root' })
export class TodayService {
  private readonly day = signal(todayKey());
  readonly key = this.day.asReadonly();

  constructor() {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = (): void => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(
        () => {
          this.day.set(todayKey());
          schedule();
        },
        nextMidnight.getTime() - now.getTime() + 1000,
      );
    };
    schedule();
    inject(DestroyRef).onDestroy(() => clearTimeout(timer));
  }
}
