import { formatDueDate } from './due-date';

describe('formatDueDate', () => {
  const now = new Date(2026, 10, 2);

  it('shows day and short month in the UI language', () => {
    expect(formatDueDate('2026-11-05', 'en', now)).toBe('5 Nov');
    expect(formatDueDate('2026-11-05', 'uk', now)).toBe('5 лист.');
  });

  it('adds the year when it is not the current one', () => {
    expect(formatDueDate('2027-01-15', 'en', now)).toBe('15 Jan 2027');
  });

  it('does not shift the day across time zones', () => {
    expect(formatDueDate('2026-11-01', 'en', now)).toBe('1 Nov');
  });
});
