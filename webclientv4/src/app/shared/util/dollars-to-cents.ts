const dollarsToCents = (dollarValue: number | string | null | undefined): number => {
  if (dollarValue == null) {
    return 0;
  }
  const dollarValueToConvert =
    typeof dollarValue === 'string' ? dollarValue.replace(/,/g, '') : dollarValue;
  const numericDollarValue = Number(dollarValueToConvert);
  if (isNaN(numericDollarValue)) {
    return 0;
  }
  return Math.round(numericDollarValue * 100);
};

export { dollarsToCents };
