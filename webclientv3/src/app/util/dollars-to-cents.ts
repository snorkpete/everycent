
let dollarsToCents = (dollarValue: number | string): number => {
  let numericDollarValue = Number(dollarValue);
  if (isNaN(numericDollarValue)) {
    return 0;
  }
  return Math.round(numericDollarValue * 100);
};

export {dollarsToCents};
