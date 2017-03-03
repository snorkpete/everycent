
import {isNullOrUndefined} from 'util';

let centsToDollars = (centsValue: number): string => {

  if (isNullOrUndefined(centsValue)) {
    return '0.00';
  }

  let dollarValue = centsValue / 100;
  return dollarValue.toFixed(2);
};

export { centsToDollars };
