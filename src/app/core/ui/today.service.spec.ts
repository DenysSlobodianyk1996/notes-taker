import { TestBed } from '@angular/core/testing';
import { TodayService } from './today.service';

describe('TodayService', () => {
  afterEach(() => vi.useRealTimers());

  it('moves to the next day just after midnight', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 2, 23, 59, 30));
    const today = TestBed.inject(TodayService);
    expect(today.key()).toBe('2026-11-02');

    vi.advanceTimersByTime(60_000);

    expect(today.key()).toBe('2026-11-03');
  });
});
