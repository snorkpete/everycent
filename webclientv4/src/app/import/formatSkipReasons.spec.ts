import { describe, it, expect } from 'vitest';
import { formatSkipReasons } from './formatSkipReasons';
import type { SkippedTransaction } from './import.types';

describe('formatSkipReasons', () => {
  it('returns empty string for empty array', () => {
    expect(formatSkipReasons([])).toBe('');
  });

  it('formats a single reason', () => {
    const skipped: SkippedTransaction[] = [
      { bank_ref: 'REF1', reason: 'duplicate' },
    ];
    expect(formatSkipReasons(skipped)).toBe('1 duplicate');
  });

  it('groups multiple of the same reason', () => {
    const skipped: SkippedTransaction[] = [
      { bank_ref: 'REF1', reason: 'duplicate' },
      { bank_ref: 'REF2', reason: 'duplicate' },
      { bank_ref: 'REF3', reason: 'duplicate' },
    ];
    expect(formatSkipReasons(skipped)).toBe('3 duplicate');
  });

  it('formats multiple distinct reasons', () => {
    const skipped: SkippedTransaction[] = [
      { bank_ref: 'REF1', reason: 'duplicate' },
      { bank_ref: 'REF2', reason: 'user_excluded' },
      { bank_ref: 'REF3', reason: 'out_of_period' },
    ];
    expect(formatSkipReasons(skipped)).toBe('1 duplicate, 1 manually excluded, 1 out of period');
  });

  it('groups and counts mixed reasons', () => {
    const skipped: SkippedTransaction[] = [
      { bank_ref: 'REF1', reason: 'duplicate' },
      { bank_ref: 'REF2', reason: 'duplicate' },
      { bank_ref: 'REF3', reason: 'user_excluded' },
      { bank_ref: 'REF4', reason: 'out_of_period' },
      { bank_ref: 'REF5', reason: 'out_of_period' },
    ];
    expect(formatSkipReasons(skipped)).toBe('2 duplicate, 1 manually excluded, 2 out of period');
  });

  it('falls back to raw reason key for unknown reasons', () => {
    const skipped = [
      { bank_ref: 'REF1', reason: 'some_new_reason' },
    ] as SkippedTransaction[];
    expect(formatSkipReasons(skipped)).toBe('1 some_new_reason');
  });

  it('uses label for invalid_date reason', () => {
    const skipped: SkippedTransaction[] = [
      { bank_ref: 'REF1', reason: 'invalid_date' },
    ];
    expect(formatSkipReasons(skipped)).toBe('1 invalid date');
  });
});
