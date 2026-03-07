const centsToDollars = (centsValue: number | null | undefined): string => {
  if (centsValue == null) {
    return '0.00';
  }

  const dollarValue = centsValue / 100;
  return dollarValue.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};

export { centsToDollars };
