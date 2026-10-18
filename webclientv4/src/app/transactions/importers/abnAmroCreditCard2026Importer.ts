import type { TransactionData } from '../transaction.types';
import { MONTH_MAP, parseLocalDate, formatDate } from './importerUtils';

// Year is optional: the 2026 statements print dates like "9 Oct" with no year
const DATE_PATTERN = /^(\d{1,2})\s+([a-z]{3})\.?(?:\s+(\d{4}))?$/i;
// e.g. "28 September to 27 October 2026" or "28 februari to 27 maart 2026"
const PERIOD_PATTERN =
  /^\d{1,2}\s+[a-z]+\.?(?:\s+\d{4})?\s+to\s+(\d{1,2})\s+([a-z]+)\.?\s+(\d{4})$/i;
const YEAR_PATTERN = /^\d{4}$/;
const DECLINED_PATTERN = /^DECLINED$/i;
const DESCRIPTION_LABEL = /^Transaction description:/i;
const AMOUNT_LABEL = /^Transaction amount:/i;
const NOISE_PATTERNS = [
  /^Cardholder:/i,
  /^RECURRING$/i,
  /^RESERVED$/i,
  /^Current Period$/i,
  YEAR_PATTERN, // standalone year like "2026"
  PERIOD_PATTERN, // date range like "28 februari to 27 maart 2026"
];

function isNoise(line: string): boolean {
  return NOISE_PATTERNS.some((p) => p.test(line));
}

function isDateLine(line: string): boolean {
  return parseDateParts(line) !== null;
}

function isDeclinedLine(line: string): boolean {
  return DECLINED_PATTERN.test(line);
}

// Maps a (possibly full) month name to a month index using its first 3 letters
function monthFromName(name: string): number | undefined {
  return MONTH_MAP[name.slice(0, 3).toLowerCase()];
}

interface StatementHeader {
  year: number;
  periodEnd?: Date;
}

/**
 * Works out the year for dates that are printed without one.
 * Prefers the period line ("28 September to 27 October 2026"); then the
 * standalone year line; and finally the year of the endDate argument.
 */
function findStatementHeader(lines: string[], fallbackYear: number): StatementHeader {
  for (const line of lines) {
    const match = line.match(PERIOD_PATTERN);
    if (!match) continue;
    const [, day, monthName, year] = match;
    const month = monthFromName(monthName);
    if (month === undefined) continue;
    return {
      year: parseInt(year, 10),
      periodEnd: new Date(parseInt(year, 10), month, parseInt(day, 10)),
    };
  }

  const yearLine = lines.find((l) => YEAR_PATTERN.test(l));
  return { year: yearLine ? parseInt(yearLine, 10) : fallbackYear };
}

// Picks the year that puts the date closest to the period end, so periods
// spanning New Year (and dates just outside the period) get the right year
function inferYear(month: number, day: number, header: StatementHeader): number {
  const { year, periodEnd } = header;
  if (!periodEnd) return year;
  const distance = (y: number) => Math.abs(new Date(y, month, day).getTime() - periodEnd.getTime());
  return [year - 1, year, year + 1].reduce((best, y) => (distance(y) < distance(best) ? y : best));
}

interface DateParts {
  day: number;
  month: number;
  year?: number;
}

// Returns null unless the line is a date with a recognised month,
// so lines like "12 USD" aren't mistaken for dates
function parseDateParts(line: string): DateParts | null {
  const match = line.match(DATE_PATTERN);
  if (!match) return null;
  const [, day, monthAbbr, year] = match;
  const month = monthFromName(monthAbbr);
  if (month === undefined) return null;
  return { day: parseInt(day, 10), month, year: year ? parseInt(year, 10) : undefined };
}

function parseDate(parts: DateParts, header: StatementHeader): Date {
  const { day, month } = parts;
  const year = parts.year ?? inferYear(month, day, header);
  return new Date(year, month, day);
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
 * RESERVED, headers), skips DECLINED transactions and gracefully skips
 * incomplete transactions.
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

  const header = findStatementHeader(lines, end.getFullYear());
  const raw = extractRawTransactions(lines, header);

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

function extractRawTransactions(lines: string[], header: StatementHeader): RawTransaction[] {
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
    const dateParts = parseDateParts(line);
    if (dateParts) {
      currentDate = parseDate(dateParts, header);
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

      // Declined transactions never went through, so skip them
      const declined = isDeclinedLine(lines[j + 1] ?? '');

      if (amount !== null && !declined) {
        transactions.push({ date: currentDate, description, amount });
      }

      // Advance past the amount line we consumed. Without an amount, resume at the
      // line that ended the scan so a following date or transaction isn't skipped
      i = amount !== null ? j + 1 : j;
      continue;
    }

    // Anything else — skip
    i++;
  }

  return transactions;
}
