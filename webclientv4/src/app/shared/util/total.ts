export interface SummableItem {
  deleted?: boolean;
  deposit_amount?: number;
  withdrawal_amount?: number;
  [key: string]: unknown;
}

const total = (items: SummableItem[] = [], fieldToSum: string): number => {
  return items.reduce((sum, item) => {
    if (item.deleted) {
      return sum;
    }

    if (fieldToSum === 'net_amount') {
      return sum + ((item.deposit_amount ?? 0) - (item.withdrawal_amount ?? 0));
    }

    const value = item[fieldToSum];
    if (!value || typeof value !== 'number') {
      return sum;
    }

    return sum + value;
  }, 0);
};

export { total };
