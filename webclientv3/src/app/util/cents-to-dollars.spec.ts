
import {centsToDollars} from './cents-to-dollars';

describe('#centsToDollars', () => {

  it('converts a numeric cents value to a formatted dollar value', () => {
    expect(centsToDollars(45000)).toEqual('450.00');
  });

  it('converts undefined or null to a formatted 0.00 value', () => {
    let noValue;
    expect(centsToDollars(noValue)).toEqual('0.00');
    expect(centsToDollars(null)).toEqual('0.00');
  });
});