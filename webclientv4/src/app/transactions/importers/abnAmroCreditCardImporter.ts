import type { TransactionData } from '../transaction.types';

const MONTH_MAP: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

function convertInputToLines(input: string | null): string[] {
  if (!input) return [];
  return input
    .split(/[\n]/)
    .map((line) => line.trim())
    .filter((line) => line !== '');
}

function isDate(line: string): boolean {
  return !!line.match(/^\d{1,2} [a-z]{3}\. \d{4}$/i);
}

function extractDate(line: string): Date | null {
  const parts = line.match(/^(\d{1,2}) ([a-z]{3})\. (\d{4})$/i);
  if (!parts) return null;
  const [, day, monthAbbr, year] = parts;
  const month = MONTH_MAP[monthAbbr.toLowerCase()];
  return new Date(parseInt(year, 10), month, parseInt(day, 10));
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isAmountLine(line: string): boolean {
  return !!line.replaceAll('.', '').match(/^([+-]\s*)?€\s*(\d+),(\d+)$/);
}

function extractAmount(line: string): number {
  const match = line.replaceAll('.', '').match(/^([+-]\s*)?€\s*(\d+),(\d+)$/);
  if (!match) return 0;
  const [, sign, whole, decimal] = match;
  const amount = parseInt(whole, 10) * 100 + parseInt(decimal, 10);
  return sign && sign.trim().startsWith('-') ? -amount : amount;
}

export function abnAmroCreditCardImporter(
  input: string,
  startDate: string,
  endDate: string,
): TransactionData[] {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  const lines = convertInputToLines(input);
  const transactions: TransactionData[] = [];
  let currentDate: Date | null = null;
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex];

    if (isDate(line)) {
      currentDate = extractDate(line);
      lineIndex++;
    }

    if (currentDate && lineIndex < lines.length) {
      const currentDescription = lines[lineIndex];
      lineIndex++;

      // iDEAL style: next line is amount (no cardholder)
      if (lineIndex < lines.length && isAmountLine(lines[lineIndex])) {
        const amount = extractAmount(lines[lineIndex]);

        const transaction: TransactionData = {
          transaction_date: formatDate(currentDate),
          description: currentDescription,
          withdrawal_amount: amount < 0 ? Math.abs(amount) : 0,
          deposit_amount: amount > 0 ? amount : 0,
          status: 'unpaid',
        };

        if (currentDate < start || currentDate > end) {
          transaction.deleted = true;
        }

        transactions.push(transaction);
        lineIndex++;
      } else if (lineIndex < lines.length) {
        // Regular style: next line is cardholder, then amount
        lineIndex++; // skip cardholder

        if (lineIndex < lines.length) {
          const amount = extractAmount(lines[lineIndex]);

          const transaction: TransactionData = {
            transaction_date: formatDate(currentDate),
            description: currentDescription,
            withdrawal_amount: amount < 0 ? Math.abs(amount) : 0,
            deposit_amount: amount > 0 ? amount : 0,
            status: 'unpaid',
          };

          if (currentDate < start || currentDate > end) {
            transaction.deleted = true;
          }

          transactions.push(transaction);
          lineIndex++;
        }
      }
    } else {
      lineIndex++;
    }
  }

  return transactions;
}
