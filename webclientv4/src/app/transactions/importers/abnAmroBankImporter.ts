import type { TransactionData } from '../transaction.types';

interface DateParts {
  year: number;
  month: number;
  day: number;
}

const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function convertInputToLines(input: string | null): string[] {
  if (!input) return [];
  return input.split(/[\n]/);
}

function isBlank(line: string): boolean {
  if (!line) return true;
  return line.trim() === '';
}

function parseFormattedDate(line: string): DateParts | false {
  // Long form: "Fri, 8 Mar • …"
  let match = line.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{1,2}) ([A-Za-z]{3}) /);
  if (match) {
    return {
      year: new Date().getFullYear(),
      month: MONTH_MAP[match[3]],
      day: parseInt(match[2], 10),
    };
  }

  // Short form: "Fr 25 Apr • …"
  match = line.match(/^(Mo|Tu|We|Th|Fr|Sa|Su) (\d{1,2}) ([A-Za-z]{3}) /);
  if (match) {
    return {
      year: new Date().getFullYear(),
      month: MONTH_MAP[match[3]],
      day: parseInt(match[2], 10),
    };
  }

  // Month DD, YYYY
  match = line.match(/^([A-Za-z]+) (\d{1,2}), (\d{4})/);
  if (match) {
    return {
      year: parseInt(match[3], 10),
      month: MONTH_MAP[match[1]],
      day: parseInt(match[2], 10),
    };
  }

  return false;
}

function isDate(line: string): boolean {
  if (!line) return false;
  if (line === 'today' || line === 'yesterday') return true;
  return parseFormattedDate(line) !== false;
}

function extractDate(line: string): Date | undefined {
  if (!isDate(line)) return undefined;

  if (line === 'today') return new Date();

  if (line === 'yesterday') {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }

  const parts = parseFormattedDate(line);
  if (!parts) return undefined;
  // hour=10 avoids midnight timezone off-by-one
  return new Date(parts.year, parts.month, parts.day, 10);
}

function isSkippableText(line: string): boolean {
  if (line.length === 2) return true;
  if (line.match(/^(Yesterday|Today|January|February|March|April|May|June|July|August|September|October|November|December)/)) {
    return true;
  }
  if (line.startsWith('Account: ')) return true;
  if (isDate(line)) return false;
  return false;
}

function isAmountLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.startsWith('Amount:')) return true;
  const first = trimmed.substring(0, 1);
  return first === '-' || first === '+' || first === '€';
}

function isDescription(line: string): boolean {
  if (isBlank(line)) return false;
  if (isDate(line)) return false;
  if (isAmountLine(line)) return false;
  if (line.length <= 2) return false;
  return true;
}

function extractAmount(line: string): number {
  const cleaned = line.replace(/,/g, '');
  const match = cleaned.match(/([+-]) (\d*\.?\d*)/);
  if (!match) return 0;
  const [, sign, amountString] = match;
  const amount = Math.ceil(Number(amountString) * 100);
  return sign === '-' ? -amount : amount;
}

export function abnAmroBankImporter(
  input: string,
  startDate: string,
  endDate: string,
): TransactionData[] {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const transactions: TransactionData[] = [];
  let currentDate: Date | undefined;
  let currentDescription = '';

  const lines = convertInputToLines(input);

  for (const line of lines) {
    if (isBlank(line)) continue;
    if (isSkippableText(line)) continue;

    if (isDate(line)) {
      currentDate = extractDate(line);
      continue;
    }

    if (isAmountLine(line)) {
      const raw = extractAmount(line);
      const withdrawalAmount = raw < 0 ? Math.abs(raw) : 0;
      const depositAmount = raw > 0 ? raw : 0;

      const transaction: TransactionData = {
        transaction_date: undefined,
        description: currentDescription,
        withdrawal_amount: withdrawalAmount,
        deposit_amount: depositAmount,
        status: 'paid',
      };

      if (currentDate && currentDate.toISOString) {
        transaction.transaction_date = currentDate.toISOString().substring(0, 10);
      }

      if (currentDate && (currentDate < start || currentDate > end)) {
        transaction.deleted = true;
      }

      if (withdrawalAmount === 0 && depositAmount === 0) {
        transaction.deleted = true;
      }

      transactions.push(transaction);
      currentDescription = '';
      continue;
    }

    if (isDescription(line)) {
      currentDescription = line;
    }
  }

  return transactions;
}
