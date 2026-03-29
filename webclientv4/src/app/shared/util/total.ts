const total = (
  items: { deleted?: boolean; deposit_amount?: number; withdrawal_amount?: number }[] = [],
  fieldToSum: string,
): number => {
  return items.reduce((sum, item) => {
    if (item.deleted) {
      return sum;
    }

    if (fieldToSum === 'net_amount') {
      return sum + ((item.deposit_amount ?? 0) - (item.withdrawal_amount ?? 0));
    }

    const value = (item as Record<string, unknown>)[fieldToSum];
    if (!value || typeof value !== 'number') {
      return sum;
    }

    return sum + value;
  }, 0);
};

export { total };
