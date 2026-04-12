import { describe, it, expect } from 'vitest';
import { centsToDollars } from './centsToDollars';

describe('centsToDollars', () => {
  it('converts a positive cents value to a formatted dollar string', () => {
    expect(centsToDollars(45000)).toEqual('450.00');
  });

  it('converts zero to 0.00', () => {
    expect(centsToDollars(0)).toEqual('0.00');
  });

  it('converts a negative cents value', () => {
    expect(centsToDollars(-1550)).toEqual('-15.50');
  });

  it('formats large numbers with thousand separators', () => {
    expect(centsToDollars(123456)).toEqual('1,234.56');
  });

  it('returns 0.00 for null', () => {
    expect(centsToDollars(null)).toEqual('0.00');
  });

  it('returns 0.00 for undefined', () => {
    expect(centsToDollars(undefined)).toEqual('0.00');
  });
});
