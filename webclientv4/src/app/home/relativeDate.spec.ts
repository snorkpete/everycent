import { describe, it, expect } from 'vitest';
import { relativeDate } from './relativeDate';

// All test dates use an explicit `now` so the tests are deterministic.
const NOW = new Date(2026, 3, 5); // 2026-04-05 (local time)

describe('relativeDate', () => {
  it('returns "today" for the same date', () => {
    expect(relativeDate('2026-04-05', NOW)).toBe('today');
  });

  it('returns "yesterday" for one day ago', () => {
    expect(relativeDate('2026-04-04', NOW)).toBe('yesterday');
  });

  it('returns "N days ago" for 2-6 days ago', () => {
    expect(relativeDate('2026-04-03', NOW)).toBe('2 days ago');
    expect(relativeDate('2026-03-30', NOW)).toBe('6 days ago');
  });

  it('returns "last week" for 7-13 days ago', () => {
    expect(relativeDate('2026-03-29', NOW)).toBe('last week');
    expect(relativeDate('2026-03-23', NOW)).toBe('last week');
  });

  it('returns "N weeks ago" for 14-29 days ago', () => {
    expect(relativeDate('2026-03-22', NOW)).toBe('2 weeks ago');
    expect(relativeDate('2026-03-08', NOW)).toBe('4 weeks ago');
  });

  it('returns "last month" for 30-59 days ago', () => {
    expect(relativeDate('2026-03-06', NOW)).toBe('last month');
    expect(relativeDate('2026-02-05', NOW)).toBe('last month');
  });

  it('returns "N months ago" for 60+ days ago', () => {
    expect(relativeDate('2026-02-04', NOW)).toBe('2 months ago');
    expect(relativeDate('2025-10-05', NOW)).toBe('6 months ago');
  });

  it('returns "in the future" for dates after now', () => {
    expect(relativeDate('2026-04-06', NOW)).toBe('in the future');
  });
});
