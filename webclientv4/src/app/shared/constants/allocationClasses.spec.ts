import { describe, it, expect } from 'vitest';
import { allocationClasses } from './allocationClasses';

describe('allocationClasses', () => {
  it('contains want, need, and savings', () => {
    const ids = allocationClasses.map((c) => c.id);
    expect(ids).toEqual(['want', 'need', 'savings']);
  });

  it('has display names for each class', () => {
    const names = allocationClasses.map((c) => c.name);
    expect(names).toEqual(['Want', 'Need', 'Savings']);
  });
});
