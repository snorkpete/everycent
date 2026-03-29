import { describe, it, expect } from 'vitest';
import { total } from './total';

describe('total', () => {
  it('sums the values of the specific field', () => {
    const items = [{ value: 100 }, { value: 200 }, { value: 300 }];
    expect(total(items, 'value')).toEqual(600);
  });

  it('ignores deleted items', () => {
    const items = [{ amount: 100 }, { amount: 200, deleted: true }, { amount: 300 }];
    expect(total(items, 'amount')).toEqual(400);
  });

  it('ignores items without the propertyToSum', () => {
    const items = [{ amount: 100 }, { amount: 200 }, { ignored: 300 }];
    expect(total(items, 'amount')).toEqual(300);
  });

  it('sums net_amount as deposit minus withdrawal', () => {
    const items = [
      { deposit_amount: 500, withdrawal_amount: 200 },
      { deposit_amount: 300, withdrawal_amount: 100 },
    ];
    expect(total(items, 'net_amount')).toEqual(500);
  });

  it('treats missing deposit_amount or withdrawal_amount as zero for net_amount', () => {
    const items = [{ deposit_amount: 400 }, { withdrawal_amount: 150 }];
    expect(total(items, 'net_amount')).toEqual(250);
  });
});
