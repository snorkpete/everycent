// Accept any object array. The function accesses fields dynamically by name,
// plus has special handling for `deleted`, `deposit_amount`, `withdrawal_amount`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const total = (items: any[] = [], fieldToSum: string): number => {
  return items.reduce((sum: number, item: Record<string, unknown>) => {
    if (item.deleted) {
      return sum;
    }

    if (fieldToSum === 'net_amount') {
      const deposit = (item.deposit_amount as number) ?? 0;
      const withdrawal = (item.withdrawal_amount as number) ?? 0;
      return sum + (deposit - withdrawal);
    }

    const value = item[fieldToSum];
    if (!value || typeof value !== 'number') {
      return sum;
    }

    return sum + value;
  }, 0);
};

export { total };
