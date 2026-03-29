import { describe, it, expect, vi, beforeEach } from 'vitest';
import { importApi, buildPreviewPayload } from './importApi';
import type { PreviewPayload, SavePayload } from './importApi';
import type { CamtAccountResult } from '../transactions/importers/camt053Parser';
import apiGateway from '../../api/api-gateway';

vi.mock('../../api/api-gateway', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('importApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('preview', () => {
    it('posts to /transactions/import_preview and returns data', async () => {
      const responseData = { bank_accounts: [] };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: responseData });

      const payload: PreviewPayload = {
        budget_id: 1,
        bank_accounts: [],
      };

      const result = await importApi.preview(payload);

      expect(apiGateway.post).toHaveBeenCalledWith('/transactions/import_preview', payload);
      expect(result).toEqual(responseData);
    });
  });

  describe('save', () => {
    it('posts to /transactions/import_save and returns data', async () => {
      const responseData = { bank_accounts: [] };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: responseData });

      const payload: SavePayload = {
        budget_id: 1,
        bank_accounts: [],
      };

      const result = await importApi.save(payload);

      expect(apiGateway.post).toHaveBeenCalledWith('/transactions/import_save', payload);
      expect(result).toEqual(responseData);
    });
  });
});

describe('buildPreviewPayload', () => {
  it('maps CamtAccountResult[] to PreviewPayload', () => {
    const accounts: CamtAccountResult[] = [
      {
        iban: 'NL01ABNA0123456789',
        bankAccountId: 10,
        transactions: [
          {
            transaction_date: '2026-01-15',
            description: 'Groceries',
            withdrawal_amount: 5000,
            deposit_amount: 0,
            bank_ref: 'REF001',
            status: 'paid',
          },
        ],
      },
    ];

    const result = buildPreviewPayload(1, accounts);

    expect(result).toEqual({
      budget_id: 1,
      bank_accounts: [
        {
          bank_account_id: 10,
          iban: 'NL01ABNA0123456789',
          transactions: [
            {
              transaction_date: '2026-01-15',
              description: 'Groceries',
              withdrawal_amount: 5000,
              deposit_amount: 0,
              bank_ref: 'REF001',
              status: 'paid',
            },
          ],
        },
      ],
    });
  });

  it('filters out accounts with no bankAccountId', () => {
    const accounts: CamtAccountResult[] = [
      {
        iban: 'NL01ABNA0123456789',
        bankAccountId: 10,
        transactions: [],
      },
      {
        iban: 'NL99UNKNOWN0000000',
        bankAccountId: undefined,
        transactions: [
          {
            transaction_date: '2026-01-15',
            description: 'Should be excluded',
            withdrawal_amount: 1000,
            deposit_amount: 0,
            bank_ref: 'REF002',
          },
        ],
      },
    ];

    const { bank_accounts } = buildPreviewPayload(1, accounts);

    expect(bank_accounts).toHaveLength(1);
    expect(bank_accounts[0]?.bank_account_id).toBe(10);
  });

  it('defaults missing transaction fields', () => {
    const accounts: CamtAccountResult[] = [
      {
        iban: 'NL01ABNA0123456789',
        bankAccountId: 10,
        transactions: [
          {
            // all fields undefined
          },
        ],
      },
    ];

    const { bank_accounts } = buildPreviewPayload(1, accounts);
    const tx = bank_accounts[0]?.transactions[0];

    expect(tx?.transaction_date).toBe('');
    expect(tx?.description).toBe('');
    expect(tx?.withdrawal_amount).toBe(0);
    expect(tx?.deposit_amount).toBe(0);
    expect(tx?.bank_ref).toBe('');
    expect(tx?.status).toBe('paid');
  });
});
