let centsToDollars = (centsValue: number): string => {
  if (centsValue === null || centsValue === undefined) {
    return "0.00";
  }

  let dollarValue = centsValue / 100;
  return dollarValue.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

export { centsToDollars };
