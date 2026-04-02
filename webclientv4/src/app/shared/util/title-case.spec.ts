import { describe, it, expect } from 'vitest';
import { titleCase } from './title-case';

describe('titleCase', () => {
  it('capitalises the first letter and lowercases the rest', () => {
    expect(titleCase('want')).toBe('Want');
  });

  it('handles already title-cased input', () => {
    expect(titleCase('Need')).toBe('Need');
  });

  it('handles all-uppercase input', () => {
    expect(titleCase('SAVINGS')).toBe('Savings');
  });

  it('returns empty string for undefined', () => {
    expect(titleCase(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(titleCase('')).toBe('');
  });

  it('handles single character', () => {
    expect(titleCase('a')).toBe('A');
  });
});
