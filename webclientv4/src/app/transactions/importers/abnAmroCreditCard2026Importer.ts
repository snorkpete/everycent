import type { TransactionData } from '../transaction.types';
import { MONTH_MAP, parseLocalDate, formatDate } from './importerUtils';

const DATE_PATTERN = /^(\d{1,2})\s+([a-z]{3})\.?\s+(\d{4})$/i;
const DESCRIPTION_LABEL = /^Transaction description:/i;
const AMOUNT_LABEL = /^Transaction amount:/i;
const NOISE_PATTERNS = [
  /^Cardholder:/i,
  /^RECURRING$/i,
  /^RESERVED$/i,
  /^Current Period$/i,
  /^\d{4}$/, // standalone year like "2026"
  /^\d+\s+\w+\s+to\s+\d+/i, // date range like "28 februari to 27 maart 2026"
];

function isNoise(line: string): boolean {
  return NOISE_PATTERNS.some((p) => p.test(line));
}

function isDateLine(line: string): boolean {
  return DATE_PATTERN.test(line);
}

function parseDate(line: string): Date | null {
  const match = line.match(DATE_PATTERN);
  if (!match) return null;
  const [, day, monthAbbr, year] = match;
  const month = MONTH_MAP[monthAbbr.toLowerCase()];
  if (month === undefined) return null;
  return new Date(parseInt(year, 10), month, parseInt(day, 10));
}

function parseAmount(line: string): number | null {
  const cleaned = line.trim().replaceAll('.', '');
  // After removing dots (thousands sep), re-add the comma pattern
  const match = cleaned.match(/^([+-]\s*)?€\s*(\d+),(\d{2})$/);
  if (!match) return null;
  const [, sign, whole, decimal] = match;
  const amount = parseInt(whole, 10) * 100 + parseInt(decimal, 10);
  return sign && sign.trim().startsWith('-') ? -amount : amount;
}

interface RawTransaction {
  date: Date;
  description: string;
  amount: number;
}

/**
 * Block-based parser for ABN AMRO credit card statements (2026+ format).
 *
 * Strategy: split lines into blocks by date, then within each block find
 * transactions by scanning for labeled fields. Ignores noise (RECURRING,
 * RESERVED, headers) and gracefully skips incomplete transactions.
 */
export function abnAmroCreditCard2026Importer(
  input: string,
  startDate: string,
  endDate: string,
): TransactionData[] {
  if (!input) return [];

  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  const lines = input
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l !== '');

  const raw = extractRawTransactions(lines);

  return raw.map((t) => {
    const transaction: TransactionData = {
      transaction_date: formatDate(t.date),
      description: t.description,
      withdrawal_amount: t.amount < 0 ? Math.abs(t.amount) : 0,
      deposit_amount: t.amount > 0 ? t.amount : 0,
      status: 'unpaid',
    };

    if (t.date < start || t.date > end) {
      transaction.deleted = true;
    }

    return transaction;
  });
}

function extractRawTransactions(lines: string[]): RawTransaction[] {
  const transactions: RawTransaction[] = [];
  let currentDate: Date | null = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip noise lines
    if (isNoise(line)) {
      i++;
      continue;
    }

    // Date line — update current date and continue
    if (isDateLine(line)) {
      currentDate = parseDate(line);
      i++;
      continue;
    }

    // Transaction description label — start of a transaction block
    if (DESCRIPTION_LABEL.test(line) && currentDate) {
      const description = line.replace(DESCRIPTION_LABEL, '').trim();

      // Scan forward for "Transaction amount:" and extract the amount on the next line
      let amount: number | null = null;
      let j = i + 1;
      // Look ahead within a reasonable window (skip cardholder, RECURRING, etc.)
      while (j < lines.length && !isDateLine(lines[j]) && !DESCRIPTION_LABEL.test(lines[j])) {
        if (AMOUNT_LABEL.test(lines[j])) {
          // The actual amount is on the next non-empty line
          j++;
          while (j < lines.length && lines[j].trim() === '') j++;
          if (j < lines.length) {
            amount = parseAmount(lines[j]);
          }
          break;
        }
        j++;
      }

      if (amount !== null) {
        transactions.push({ date: currentDate, description, amount });
      }

      // Advance past the amount line we consumed
      i = j + 1;
      continue;
    }

    // Anything else — skip
    i++;
  }

  return transactions;
}
