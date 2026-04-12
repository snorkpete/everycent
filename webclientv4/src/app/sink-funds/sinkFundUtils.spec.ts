import { describe, it, expect } from 'vitest';
import { outstanding } from './sinkFundUtils';

describe('outstanding', () => {
  it('returns 0 when target is 0', () => {
    expect(outstanding({ target: 0, current_balance: 500 })).toBe(0);
  });

  it('returns 0 when target is undefined', () => {
    expect(outstanding({ current_balance: 500 })).toBe(0);
  });

  it('returns difference between current_balance and target', () => {
    expect(outstanding({ target: 1000, current_balance: 1500 })).toBe(500);
  });

  it('returns negative when current_balance is below target', () => {
    expect(outstanding({ target: 1000, current_balance: 600 })).toBe(-400);
  });

  it('treats undefined current_balance as 0', () => {
    expect(outstanding({ target: 1000 })).toBe(-1000);
  });
});
