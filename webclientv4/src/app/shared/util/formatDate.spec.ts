import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats an ISO date as dd-mm-yyyy', () => {
    expect(formatDate('2024-12-25')).toBe('25-12-2024');
  });

  it('preserves leading zeros in day and month', () => {
    expect(formatDate('2024-01-05')).toBe('05-01-2024');
  });

  it('returns an empty string for an empty input', () => {
    expect(formatDate('')).toBe('');
  });

  it('formats the date portion of an ISO timestamp', () => {
    expect(formatDate('2024-12-25T14:30:00.000Z')).toBe('25-12-2024');
  });

  it('returns an empty string for an invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('');
  });
});
