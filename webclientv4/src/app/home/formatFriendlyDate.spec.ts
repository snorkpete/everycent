import { describe, it, expect } from 'vitest';
import { formatFriendlyDate } from './formatFriendlyDate';

describe('formatFriendlyDate', () => {
  it('formats an ISO date as "D MMM YYYY"', () => {
    expect(formatFriendlyDate('2026-04-04')).toBe('4 Apr 2026');
  });

  it('renders two-digit days without leading zero', () => {
    expect(formatFriendlyDate('2026-12-25')).toBe('25 Dec 2026');
  });

  it('uses abbreviated month names', () => {
    expect(formatFriendlyDate('2026-01-15')).toBe('15 Jan 2026');
    // en-GB abbreviates September as "Sept" (4 chars) per CLDR — all other
    // months are 3 chars.
    expect(formatFriendlyDate('2026-09-01')).toBe('1 Sept 2026');
  });
});
