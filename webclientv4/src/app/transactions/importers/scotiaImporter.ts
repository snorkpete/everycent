import type { TransactionData } from '../transaction.types';

function convertInputToLines(input: string | null): string[] {
  if (!input) return [];
  return input.split(/[\n]/);
}

function convertLinesToGroups(lines: string[]): string[][] {
  const NBR_LINES_PER_GROUP = 4;
  const groups: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    current.push(line);
    if (current.length >= NBR_LINES_PER_GROUP) {
      groups.push(current);
      current = [];
    }
  }

  if (current.length > 0) {
    groups.push(current);
  }

  return groups;
}

function convertGroupToTransaction(
  group: string[],
  startDate: string,
  endDate: string,
): TransactionData {
  if (group.length !== 4) return {};

  const monthAndDay = group[0];
  const yearAndLine1Description = group[1];
  const line2Description = group[2];
  const amountAndBalance = group[3];

  const yearAndDescMatch = yearAndLine1Description.match(/^(\d{4})\s+(.*)$/);
  if (!yearAndDescMatch || yearAndDescMatch.length !== 3) return {};

  const year = yearAndDescMatch[1];
  const line1Description = yearAndDescMatch[2];

  const signAndAmountMatch = amountAndBalance.match(/^\s*(-?)\$(.*?)\sTTD/);
  let sign = '';
  let amount = '0';
  if (signAndAmountMatch && signAndAmountMatch.length === 3) {
    sign = signAndAmountMatch[1];
    amount = signAndAmountMatch[2];
  }

  const transactionDate = new Date(`${monthAndDay} ${year}`);
  const amountAsNumber = Number(amount.replace(/,/g, '')) * 100;

  const transaction: TransactionData = {
    transaction_date: transactionDate.toISOString().substring(0, 10),
    description: `${line1Description} ${line2Description}`,
    withdrawal_amount: sign === '-' ? amountAsNumber : 0,
    deposit_amount: sign === '' ? amountAsNumber : 0,
  };

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (transactionDate < start || transactionDate > end) {
    transaction.deleted = true;
  }

  if (transaction.withdrawal_amount === 0 && transaction.deposit_amount === 0) {
    transaction.deleted = true;
  }

  return transaction;
}

export function scotiaImporter(
  input: string,
  startDate: string,
  endDate: string,
): TransactionData[] {
  const lines = convertInputToLines(input);
  const groups = convertLinesToGroups(lines);
  return groups.map((group) => convertGroupToTransaction(group, startDate, endDate));
}
