
let dollarsToCents = (dollarValue: number | string): number => {
  let dollarValueToConvert = dollarValue;
  if(dollarValue && dollarValue.replace) {
    dollarValueToConvert = dollarValue.replace(/,/g, '');
  }
  let numericDollarValue = Number(dollarValueToConvert);
  if (isNaN(numericDollarValue)) {
    return 0;
  }
  return Math.round(numericDollarValue * 100);
};

export {dollarsToCents};
