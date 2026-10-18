import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  aiTransactionImporter,
  AI_IMPORT_SYSTEM_PROMPT,
  AI_TRANSACTION_SCHEMA,
} from './aiTransactionImporter';
import { browserLanguageModel } from '../../ai/browserLanguageModel';
import { buildPromptApiMock } from '../../../test/buildPromptApiMock';
import type { PromptApiMockOptions } from '../../../test/buildPromptApiMock';

const startDate = '2026-09-28';
const endDate = '2026-10-27';

function reply(transactions: unknown[]): string {
  return JSON.stringify({ transactions });
}

async function setup(options: PromptApiMockOptions = {}) {
  const mock = buildPromptApiMock(options);
  const session = await browserLanguageModel.createSession({
    systemPrompt: AI_IMPORT_SYSTEM_PROMPT,
  });
  return { mock, session };
}

describe('aiTransactionImporter', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns nothing for blank input without calling the model', async () => {
    const { mock, session } = await setup();
    const result = await aiTransactionImporter('  \n ', startDate, endDate, session);

    expect(result).toEqual({ transactions: [], skippedCount: 0, invalidCount: 0 });
    expect(mock.prompts).toEqual([]);
  });

  it('sends the statement text and budget period with the transaction schema', async () => {
    const { mock, session } = await setup();
    await aiTransactionImporter('6 Oct STREAMCO -9,50', startDate, endDate, session);

    expect(mock.prompts[0]).toContain('Budget period: 2026-09-28 to 2026-10-27.');
    expect(mock.prompts[0]).toContain('6 Oct STREAMCO -9,50');
    expect(mock.responseConstraints[0]).toEqual(AI_TRANSACTION_SCHEMA);
  });

  it('converts charges to withdrawals and credits to deposits, in cents', async () => {
    const { session } = await setup({
      responses: [
        reply([
          { date: '2026-10-06', description: 'STREAMCO', amount: -9.5, status: 'completed' },
          { date: '2026-10-02', description: 'REFUNDCO', amount: 1234.56, status: 'completed' },
        ]),
      ],
    });

    const { transactions } = await aiTransactionImporter('text', startDate, endDate, session);

    expect(transactions).toEqual([
      {
        transaction_date: '2026-10-06',
        description: 'STREAMCO',
        withdrawal_amount: 950,
        deposit_amount: 0,
        status: 'unpaid',
      },
      {
        transaction_date: '2026-10-02',
        description: 'REFUNDCO',
        withdrawal_amount: 0,
        deposit_amount: 123456,
        status: 'unpaid',
      },
    ]);
  });

  it('trims descriptions and rounds amounts to whole cents', async () => {
    const { session } = await setup({
      responses: [
        reply([
          {
            date: '2026-10-06',
            description: '  SHOPCO  ',
            amount: -0.1 - 0.2,
            status: 'completed',
          },
        ]),
      ],
    });

    const { transactions } = await aiTransactionImporter('text', startDate, endDate, session);

    expect(transactions[0].description).toBe('SHOPCO');
    expect(transactions[0].withdrawal_amount).toBe(30);
  });

  it('marks transactions outside the budget period as deleted', async () => {
    const { session } = await setup({
      responses: [
        reply([
          { date: '2026-09-27', description: 'BEFORE', amount: -1, status: 'completed' },
          { date: '2026-10-28', description: 'AFTER', amount: -1, status: 'completed' },
          { date: '2026-10-27', description: 'LAST DAY', amount: -1, status: 'completed' },
        ]),
      ],
    });

    const { transactions } = await aiTransactionImporter('text', startDate, endDate, session);

    expect(transactions.map((t) => t.deleted)).toEqual([true, true, undefined]);
  });

  it('skips declined and pending transactions and counts them', async () => {
    const { session } = await setup({
      responses: [
        reply([
          { date: '2026-10-09', description: 'HOSTCO', amount: -15, status: 'declined' },
          { date: '2026-10-09', description: 'HOTELCO', amount: -80, status: 'pending' },
          { date: '2026-10-06', description: 'STREAMCO', amount: -9.5, status: 'completed' },
        ]),
      ],
    });

    const result = await aiTransactionImporter('text', startDate, endDate, session);

    expect(result.transactions.map((t) => t.description)).toEqual(['STREAMCO']);
    expect(result.skippedCount).toBe(2);
  });

  it('drops rows the model got wrong and counts them', async () => {
    const { session } = await setup({
      responses: [
        reply([
          { date: '2026-02-31', description: 'IMPOSSIBLE DATE', amount: -1, status: 'completed' },
          { date: '6 Oct', description: 'WRONG FORMAT', amount: -1, status: 'completed' },
          { date: '2026-10-06', description: '  ', amount: -1, status: 'completed' },
          { date: '2026-10-06', description: 'NO AMOUNT', amount: 0, status: 'completed' },
          { date: '2026-10-06', description: 'NOT A NUMBER', amount: NaN, status: 'completed' },
          { date: '2026-10-06', description: 'GOOD', amount: -1, status: 'completed' },
        ]),
      ],
    });

    const result = await aiTransactionImporter('text', startDate, endDate, session);

    expect(result.transactions.map((t) => t.description)).toEqual(['GOOD']);
    expect(result.invalidCount).toBe(5);
  });

  describe('long statements', () => {
    // Budget of 1000 tokens → about 400 tokens (1600 chars) of input per part
    const smallWindow = { contextWindow: 1100, systemPromptTokens: 100 };

    function block(label: string, chars: number): string {
      return `${label}\n${'x'.repeat(chars)}`;
    }

    it('sends a statement that fits in one prompt', async () => {
      const { mock, session } = await setup(smallWindow);
      await aiTransactionImporter(block('ONLY', 1000), startDate, endDate, session);
      expect(mock.prompts.length).toBe(1);
    });

    it('splits at blank lines and combines the results of every part', async () => {
      const { mock, session } = await setup({
        ...smallWindow,
        responses: [
          reply([{ date: '2026-10-01', description: 'FIRST', amount: -1, status: 'completed' }]),
          reply([{ date: '2026-10-02', description: 'SECOND', amount: -2, status: 'completed' }]),
        ],
      });
      const input = [block('PART A', 1000), block('PART B', 1000)].join('\n\n');
      const onProgress = vi.fn();

      const result = await aiTransactionImporter(input, startDate, endDate, session, {
        onProgress,
      });

      expect(mock.prompts.length).toBe(2);
      expect(mock.prompts[0]).toContain('PART A');
      expect(mock.prompts[0]).not.toContain('PART B');
      expect(mock.prompts[1]).toContain('PART B');
      expect(onProgress.mock.calls).toEqual([
        [1, 2],
        [2, 2],
      ]);
      expect(result.transactions.map((t) => t.description)).toEqual(['FIRST', 'SECOND']);
    });

    it('keeps small blocks together in the same part', async () => {
      const { mock, session } = await setup(smallWindow);
      const input = [block('A', 500), block('B', 500), block('C', 500), block('D', 500)].join(
        '\n\n',
      );

      await aiTransactionImporter(input, startDate, endDate, session);

      expect(mock.prompts.length).toBe(2);
      expect(mock.prompts[0]).toContain('A\n');
      expect(mock.prompts[0]).toContain('B\n');
    });

    it('splits a block with no blank lines by line', async () => {
      const { mock, session } = await setup(smallWindow);
      const lines = Array.from({ length: 40 }, (_, i) => `LINE ${i} ${'x'.repeat(90)}`);

      await aiTransactionImporter(lines.join('\n'), startDate, endDate, session);

      expect(mock.prompts.length).toBeGreaterThan(1);
      expect(mock.prompts.join('\n')).toContain('LINE 39');
      mock.prompts.forEach((prompt) => expect(prompt).not.toContain('\n\n\n'));
    });
  });

  it('passes the abort signal to the model', async () => {
    const controller = new AbortController();
    const { session } = await setup();
    const promptJson = vi.spyOn(session, 'promptJson');

    await aiTransactionImporter('text', startDate, endDate, session, {
      signal: controller.signal,
    });

    expect(promptJson.mock.calls[0][1].signal).toBe(controller.signal);
  });
});
