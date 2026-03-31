import { describe, it, expect } from 'vitest';
import { remainingClass } from './remaining-class';

describe('remainingClass', () => {
  it('returns amount-positive for positive values', () => {
    expect(remainingClass(100)).toBe('amount-positive');
  });

  it('returns amount-negative for negative values', () => {
    expect(remainingClass(-50)).toBe('amount-negative');
  });

  it('returns amount-muted for zero', () => {
    expect(remainingClass(0)).toBe('amount-muted');
  });
});
