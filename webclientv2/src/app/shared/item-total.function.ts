

export default function total(items: Array<any>, fieldToSum : string): number {
  return items.reduce(((sum, item) => {

    // don't include deleted items
    // ---------------------------
    if (item.deleted) {
      return sum;
    }

    // handle 'net_amount' specially -
    // net amount totaling is deposit - withdrawal
    if (fieldToSum === 'net_amount') {
      return sum + (item.deposit_amount - item.withdrawal_amount);
    }

    // skip any items that don't have the property
    if (!item[fieldToSum]) {
      return sum;
    }

    return sum + item[fieldToSum];

  }), 0);
}
