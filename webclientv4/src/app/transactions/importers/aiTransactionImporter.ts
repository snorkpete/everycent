import type { TransactionData } from '../transaction.types';
import type { LanguageModelSession } from '../../ai/languageModel.types';
import { parseLocalDate, formatDate } from './importerUtils';

export const AI_IMPORT_SYSTEM_PROMPT = `You extract financial transactions from text pasted from a bank or credit card statement. The text can be in any format.
Rules:
- Return one entry per transaction. Ignore balances, totals, headers, cardholder names and other non-transaction lines.
- date: the transaction date as YYYY-MM-DD. If the year is missing, use the statement's header or the budget period given with the text. A date shown once can apply to several transactions listed after it.
- description: the merchant or payee text as written, without labels such as "Description:".
- amount: a number in currency units. Negative for money going out (purchases, charges, fees, withdrawals). Positive for money coming in (refunds, deposits, payments received). Amounts may use European formatting: "1.234,56" means 1234.56.
- status: "declined" if the transaction is marked declined or rejected, "pending" if marked pending, reserved or not yet processed, otherwise "completed".
Respond only with JSON matching the schema.`;

export const AI_TRANSACTION_SCHEMA = {
  type: 'object',
  properties: {
    transactions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          description: { type: 'string' },
          amount: { type: 'number' },
          status: { type: 'string', enum: ['completed', 'pending', 'declined'] },
        },
        required: ['date', 'description', 'amount', 'status'],
      },
    },
  },
  required: ['transactions'],
};

// Leaves room in each prompt for the model's JSON reply, which can be as long as the input
const INPUT_SHARE_OF_TOKEN_BUDGET = 0.4;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

interface ModelTransaction {
  date: string;
  description: string;
  amount: number;
  status: string;
}

export interface AiImportOptions {
  signal?: AbortSignal;
  // Called before each part of a long statement is sent to the model
  onProgress?: (part: number, totalParts: number) => void;
}

export interface AiImportResult {
  transactions: TransactionData[];
  // Declined and pending transactions are left out
  skippedCount: number;
  // Rows the model returned that couldn't be used (bad date, missing amount, ...)
  invalidCount: number;
}

/**
 * Turns freeform statement text into transactions using a language model.
 * Long text is split into parts that fit the model's context window.
 */
export async function aiTransactionImporter(
  input: string,
  startDate: string,
  endDate: string,
  session: LanguageModelSession,
  { signal, onProgress }: AiImportOptions = {},
): Promise<AiImportResult> {
  const result: AiImportResult = { transactions: [], skippedCount: 0, invalidCount: 0 };
  if (!input.trim()) return result;

  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const parts = await splitToFit(input.trim(), session);

  for (const [index, part] of parts.entries()) {
    onProgress?.(index + 1, parts.length);
    const reply = await session.promptJson(buildPrompt(part, startDate, endDate), {
      schema: AI_TRANSACTION_SCHEMA,
      signal,
    });

    for (const row of extractRows(reply)) {
      if (!isValidTransaction(row)) {
        result.invalidCount++;
      } else if (row.status === 'declined' || row.status === 'pending') {
        result.skippedCount++;
      } else {
        result.transactions.push(toTransactionData(row, start, end));
      }
    }
  }

  return result;
}

function buildPrompt(text: string, startDate: string, endDate: string): string {
  return `Budget period: ${startDate} to ${endDate}.\n\nStatement text:\n"""\n${text}\n"""`;
}

/**
 * Splits text into parts that fit the session's token budget, breaking at blank
 * lines where possible so transactions aren't cut in half.
 */
async function splitToFit(text: string, session: LanguageModelSession): Promise<string[]> {
  const maxTokens = Math.floor(session.tokenBudget * INPUT_SHARE_OF_TOKEN_BUDGET);
  const tokens = await session.measureTokens(text);
  if (tokens <= maxTokens) return [text];

  // Measuring every candidate part would be slow, so convert the budget to characters
  const maxChars = Math.max(1, Math.floor(text.length * (maxTokens / tokens)));
  const blocks = text.split(/\n\s*\n/).flatMap((block) => splitLongBlock(block, maxChars));
  return packBlocks(blocks, maxChars);
}

function splitLongBlock(block: string, maxChars: number): string[] {
  return block.length <= maxChars ? [block] : packBlocks(block.split('\n'), maxChars, '\n');
}

function packBlocks(blocks: string[], maxChars: number, separator = '\n\n'): string[] {
  const parts: string[] = [];
  let current = '';
  for (const block of blocks) {
    const candidate = current ? current + separator + block : block;
    if (current && candidate.length > maxChars) {
      parts.push(current);
      current = block;
    } else {
      current = candidate;
    }
  }
  parts.push(current);
  return parts;
}

function extractRows(reply: unknown): unknown[] {
  const rows = (reply as { transactions?: unknown } | null)?.transactions;
  return Array.isArray(rows) ? rows : [];
}

function isValidTransaction(row: unknown): row is ModelTransaction {
  const candidate = row as Partial<ModelTransaction> | null;
  return (
    typeof candidate?.description === 'string' &&
    candidate.description.trim() !== '' &&
    typeof candidate.amount === 'number' &&
    Number.isFinite(candidate.amount) &&
    candidate.amount !== 0 &&
    typeof candidate.date === 'string' &&
    isRealDate(candidate.date)
  );
}

// Rejects shapes like 2026-02-31 as well as non-dates
function isRealDate(date: string): boolean {
  return ISO_DATE.test(date) && formatDate(parseLocalDate(date)) === date;
}

function toTransactionData(row: ModelTransaction, start: Date, end: Date): TransactionData {
  const cents = Math.round(Math.abs(row.amount) * 100);
  const date = parseLocalDate(row.date);
  const transaction: TransactionData = {
    transaction_date: row.date,
    description: row.description.trim(),
    withdrawal_amount: row.amount < 0 ? cents : 0,
    deposit_amount: row.amount > 0 ? cents : 0,
    status: 'unpaid',
  };

  if (date < start || date > end) {
    transaction.deleted = true;
  }

  return transaction;
}
