import { TestBed } from '@angular/core/testing';
import { OnlineStatus } from './online-status.service';

describe('OnlineStatus', () => {
  afterEach(() => vi.restoreAllMocks());

  it('starts from navigator.onLine', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    expect(TestBed.inject(OnlineStatus).online()).toBe(false);
  });

  it('follows the offline and online events', () => {
    const status = TestBed.inject(OnlineStatus);
    expect(status.online()).toBe(true);

    window.dispatchEvent(new Event('offline'));
    expect(status.online()).toBe(false);

    window.dispatchEvent(new Event('online'));
    expect(status.online()).toBe(true);
  });
});
