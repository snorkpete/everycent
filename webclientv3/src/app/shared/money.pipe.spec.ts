/* tslint:disable:no-unused-variable */

import {MoneyPipe} from './money.pipe';

describe('MoneyPipe', () => {

  const pipe = new MoneyPipe();

  it('transforms cents amounts to dollars', () => {
    expect(pipe.transform(210)).toEqual('2.10');
  });

  it('transforms undefined to 0', () => {
    let noValue;
    expect(pipe.transform(noValue)).toEqual('0.00');
  });
});
