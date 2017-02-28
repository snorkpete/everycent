import {total} from './total';

describe('total', () => {


  it('sums the values of the specific field', () => {
    let items = [{ value: 100 }, {value: 200}, { value: 300}];
    expect(total(items, 'value')).toEqual(600);
  });

  it('ignores deleted items', () => {
    let items = [{ amount: 100 }, {amount: 200, deleted: true}, { amount: 300}];
    expect(total(items, 'amount')).toEqual(400);
  });

  it('ignores items without the propertyToSum', () => {
    let items = [{ amount: 100 }, {amount: 200 }, { ignored: 300}];
    expect(total(items, 'amount')).toEqual(300);
  });
});