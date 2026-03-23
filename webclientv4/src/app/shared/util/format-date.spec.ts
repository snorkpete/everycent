import { describe, it, expect } from 'vitest';
import { formatDate } from './format-date';

describe('formatDate', () => {
  it('formats an ISO date as a human-readable string', () => {
    const isoDate = '2024-12-25';
    const expected = 'Dec 25, 2024';

    expect(formatDate(isoDate)).toBe(expected);
  });

  it('handles a single-digit day', () => {
    const isoDate = '2024-01-05';
    const expected = 'Jan 5, 2024';

    expect(formatDate(isoDate)).toBe(expected);
  });

  it('handles a single-digit month', () => {
    const isoDate = '2024-03-01';
    const expected = 'Mar 1, 2024';

    expect(formatDate(isoDate)).toBe(expected);
  });

  it('returns an empty string for an empty input', () => {
    expect(formatDate('')).toBe('');
  });

  it('returns an empty string for an invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('');
  });
});
