import {dollarsToCents} from './dollars-to-cents';

describe('#dollarsToCents', () => {

  it('converts a number dollar value to cents', () => {
    expect(dollarsToCents(450.40)).toEqual(45040);
  });

  it('converts a string dollar value to cents', () => {
    expect(dollarsToCents('56.03')).toEqual(5603);
  });

  it('converts a non numeric string to 0 cents', () => {
    expect(dollarsToCents('add')).toEqual(0);
  });

  it('converts undefined and null to 0 cents', () => {
    let notDefined;
    expect(dollarsToCents(notDefined)).toEqual(0);
    expect(dollarsToCents(null)).toEqual(0);
  });

  it('rounds to the nearest cent', () => {
    expect(dollarsToCents('5.019')).toEqual(502);
  });
});
