import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useImportStore } from './importStore';
import { importApi } from './importApi';
import type { PreviewResponse, SaveResponse } from './import.types';
import { budgetApi } from '../budgets/budgetApi';
import { bankAccountApi } from '../bank-accounts/bankAccountApi';

vi.mock('./importApi', () => ({
  importApi: {
    preview: vi.fn(),
    save: vi.fn(),
  },
  buildPreviewPayload: vi.fn().mockReturnValue({ budget_id: 1, bank_accounts: [] }),
}));

vi.mock('../budgets/budgetApi', () => ({
  budgetApi: {
    getAll: vi.fn(),
    autoAllocate: vi.fn(),
  },
}));

const mockSettings = { primary_budget_account_id: 10 };
vi.mock('../settings/settingsStore', () => ({
  useSettingsStore: () => ({ settings: mockSettings }),
}));

vi.mock('../bank-accounts/bankAccountApi', () => ({
  bankAccountApi: {
    getOpen: vi.fn(),
  },
}));

vi.mock('../transactions/importers/camt053Parser', () => ({
  parseCamt053Zip: vi.fn().mockResolvedValue({
    accounts: [
      {
        iban: 'NL01ABNA1234567890',
        bankAccountId: 10,
        transactions: [
          {
            bank_ref: 'REF001',
            bank_account_id: 10,
            transaction_date: '2026-03-15',
            withdrawal_amount: 5000,
            deposit_amount: 0,
            description: 'Test payment',
            status: 'paid',
          },
        ],
      },
    ],
  }),
}));

describe('importStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has empty budgets', () => {
      const store = useImportStore();
      expect(store.budgets).toEqual([]);
    });

    it('has empty bankAccounts', () => {
      const store = useImportStore();
      expect(store.bankAccounts).toEqual([]);
    });

    it('has null selectedBudget', () => {
      const store = useImportStore();
      expect(store.selectedBudget).toBeNull();
    });

    it('has empty previewAccounts', () => {
      const store = useImportStore();
      expect(store.previewAccounts).toEqual([]);
    });

    it('has empty unmatchedIbans', () => {
      const store = useImportStore();
      expect(store.unmatchedIbans).toEqual([]);
    });

    it('has null saveResult', () => {
      const store = useImportStore();
      expect(store.saveResult).toBeNull();
    });

    it('has loading false', () => {
      const store = useImportStore();
      expect(store.loading).toBe(false);
    });

    it('has null error', () => {
      const store = useImportStore();
      expect(store.error).toBeNull();
    });

    it('has phase idle', () => {
      const store = useImportStore();
      expect(store.phase).toBe('idle');
    });
  });

  describe('fetchMetadata', () => {
    it('loads budgets and bank accounts', async () => {
      const budgets = [{ id: 1, name: 'Jan 2026', status: 'open' }];
      const accounts = [{ id: 10, name: 'Checking', account_no: 'NL01ABNA1234567890' }];
      vi.mocked(budgetApi.getAll).mockResolvedValue(budgets);
      vi.mocked(bankAccountApi.getOpen).mockResolvedValue(accounts);

      const store = useImportStore();
      await store.fetchMetadata();

      expect(store.budgets).toEqual(budgets);
      expect(store.bankAccounts).toEqual(accounts);
    });

    it('sets loading true during fetch and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(budgetApi.getAll).mockImplementation(async () => {
        loadingDuringCall = useImportStore().loading;
        return [];
      });
      vi.mocked(bankAccountApi.getOpen).mockResolvedValue([]);

      const store = useImportStore();
      await store.fetchMetadata();

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error on failure without re-throwing', async () => {
      vi.mocked(budgetApi.getAll).mockRejectedValue(new Error('Network error'));
      vi.mocked(bankAccountApi.getOpen).mockResolvedValue([]);

      const store = useImportStore();
      await store.fetchMetadata();

      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });
  });

  describe('selectBudget', () => {
    it('selects a budget by id', () => {
      const store = useImportStore();
      store.budgets = [
        { id: 1, name: 'Jan 2026', status: 'open' },
        { id: 2, name: 'Feb 2026', status: 'open' },
      ];

      store.selectBudget(2);

      expect(store.selectedBudget).toEqual({ id: 2, name: 'Feb 2026', status: 'open' });
    });

    it('sets null when budget not found', () => {
      const store = useImportStore();
      store.budgets = [{ id: 1, name: 'Jan 2026', status: 'open' }];

      store.selectBudget(999);

      expect(store.selectedBudget).toBeNull();
    });
  });

  describe('currentAndPastBudgets computed', () => {
    it('is wired to useCurrentAndPastBudgets composable and reflects budgets', () => {
      const store = useImportStore();
      store.budgets = [
        { id: 1, name: 'Nov 2025', status: 'closed' },
        { id: 2, name: 'Jan 2026', status: 'open' },
      ];

      expect(store.currentAndPastBudgets.map((b) => b.id)).toEqual([2, 1]);
    });
  });

  describe('isBudgetCurrent', () => {
    it('returns true when selected budget is open', () => {
      const store = useImportStore();
      store.selectedBudget = { id: 1, name: 'Jan 2026', status: 'open' };

      expect(store.isBudgetCurrent).toBe(true);
    });

    it('returns false when selected budget is closed', () => {
      const store = useImportStore();
      store.selectedBudget = { id: 1, name: 'Jan 2026', status: 'closed' };

      expect(store.isBudgetCurrent).toBe(false);
    });

    it('returns false when no budget is selected', () => {
      const store = useImportStore();
      store.selectedBudget = null;

      expect(store.isBudgetCurrent).toBe(false);
    });
  });

  describe('parseFile', () => {
    function setupStoreForParse() {
      const store = useImportStore();
      store.selectedBudget = {
        id: 1,
        name: 'Mar 2026',
        status: 'open',
        start_date: '2026-03-01',
        end_date: '2026-03-31',
      };
      store.bankAccounts = [
        { id: 10, name: 'Checking', account_no: 'NL01ABNA1234567890', account_type: 'normal' },
      ];
      return store;
    }

    it('parses file and sets parsedAccounts and phase to parsed', async () => {
      const store = setupStoreForParse();
      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });
      await store.parseFile(file);

      expect(store.parsedAccounts).toHaveLength(1);
      expect(store.parsedAccounts[0].iban).toBe('NL01ABNA1234567890');
      expect(store.phase).toBe('parsed');
    });

    it('sets loading true during parse and false after', async () => {
      const { parseCamt053Zip } = await import('../transactions/importers/camt053Parser');
      let loadingDuringCall = false;
      vi.mocked(parseCamt053Zip).mockImplementationOnce(async () => {
        loadingDuringCall = useImportStore().loading;
        return { accounts: [] };
      });

      const store = setupStoreForParse();
      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });
      await store.parseFile(file);

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error and re-throws when no budget selected', async () => {
      const store = useImportStore();
      store.selectedBudget = null;

      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });
      await expect(store.parseFile(file)).rejects.toThrow('No budget selected');

      expect(store.error).toBe('No budget selected');
    });

    it('sets error and re-throws on parse failure', async () => {
      const { parseCamt053Zip } = await import('../transactions/importers/camt053Parser');
      vi.mocked(parseCamt053Zip).mockRejectedValueOnce(new Error('Invalid ZIP'));

      const store = setupStoreForParse();
      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });
      await expect(store.parseFile(file)).rejects.toThrow('Invalid ZIP');

      expect(store.error).toBe('Invalid ZIP');
      expect(store.loading).toBe(false);
    });

    it('resets state before processing', async () => {
      const store = setupStoreForParse();
      store.previewAccounts = [
        { bank_account_id: 99, current_balance: 0, net: 0, projected_balance: 0, transactions: [] },
      ];
      store.unmatchedIbans = [{ iban: 'NL99', transactionCount: 1 }];
      store.saveResult = { bank_accounts: [] };
      store.phase = 'saved';

      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });
      await store.parseFile(file);

      expect(store.previewAccounts).toEqual([]);
      expect(store.unmatchedIbans).toEqual([]);
      expect(store.saveResult).toBeNull();
    });
  });

  describe('fetchPreview', () => {
    function setupStoreForPreview() {
      const store = useImportStore();
      store.selectedBudget = {
        id: 1,
        name: 'Mar 2026',
        status: 'open',
        start_date: '2026-03-01',
        end_date: '2026-03-31',
      };
      store.bankAccounts = [
        { id: 10, name: 'Checking', account_no: 'NL01ABNA1234567890', account_type: 'normal' },
      ];
      store.parsedAccounts = [
        {
          iban: 'NL01ABNA1234567890',
          bankAccountId: 10,
          transactions: [{ description: 'Test', bank_ref: 'REF001' }],
        },
      ];
      return store;
    }

    it('calls preview endpoint and sets previewAccounts', async () => {
      const previewResponse = {
        bank_accounts: [
          {
            bank_account_id: 10,
            current_balance: 100000,
            net: -5000,
            projected_balance: 95000,
            transactions: [
              {
                bank_ref: 'REF001',
                transaction_date: '2026-03-15',
                withdrawal_amount: 5000,
                deposit_amount: 0,
                description: 'Test payment',
                status: 'paid',
                import_status: 'new',
              },
            ],
          },
        ],
      };
      vi.mocked(importApi.preview).mockResolvedValue(previewResponse as PreviewResponse);

      const store = setupStoreForPreview();
      await store.fetchPreview();

      expect(store.previewAccounts).toEqual(previewResponse.bank_accounts);
      expect(store.phase).toBe('preview');
    });

    it('separates unmatched IBANs from matched accounts', async () => {
      vi.mocked(importApi.preview).mockResolvedValue({ bank_accounts: [] });

      const store = setupStoreForPreview();
      store.parsedAccounts = [
        { iban: 'NL01ABNA1234567890', bankAccountId: 10, transactions: [{ description: 'Test' }] },
        {
          iban: 'NL99UNKN0000000000',
          bankAccountId: undefined,
          transactions: [{ description: 'A' }, { description: 'B' }],
        },
      ];
      await store.fetchPreview();

      expect(store.unmatchedIbans).toEqual([{ iban: 'NL99UNKN0000000000', transactionCount: 2 }]);
    });

    it('sets error and re-throws on preview endpoint failure', async () => {
      vi.mocked(importApi.preview).mockRejectedValue(new Error('Server error'));

      const store = setupStoreForPreview();
      await expect(store.fetchPreview()).rejects.toThrow('Server error');

      expect(store.error).toBe('Server error');
      expect(store.loading).toBe(false);
    });

    it('does nothing when no matched accounts', async () => {
      const store = setupStoreForPreview();
      store.parsedAccounts = [
        {
          iban: 'NL99UNKN0000000000',
          bankAccountId: undefined,
          transactions: [{ description: 'A' }],
        },
      ];
      await store.fetchPreview();

      expect(importApi.preview).not.toHaveBeenCalled();
      expect(store.phase).not.toBe('preview');
    });
  });

  describe('toggleDeleteTransaction', () => {
    it('toggles deleted flag on a transaction', () => {
      const store = useImportStore();
      store.previewAccounts = [
        {
          bank_account_id: 10,
          current_balance: 100000,
          net: 0,
          projected_balance: 100000,
          transactions: [{ description: 'Test', import_status: 'new', deleted: false }],
        },
      ];

      store.toggleDeleteTransaction(0, 0);
      expect(store.previewAccounts[0].transactions[0].deleted).toBe(true);

      store.toggleDeleteTransaction(0, 0);
      expect(store.previewAccounts[0].transactions[0].deleted).toBe(false);
    });

    it('does nothing for invalid indices', () => {
      const store = useImportStore();
      store.previewAccounts = [];

      // Should not throw
      store.toggleDeleteTransaction(99, 0);
      store.toggleDeleteTransaction(0, 99);
    });
  });

  describe('saveImport', () => {
    function setupStoreForSave() {
      const store = useImportStore();
      store.selectedBudget = { id: 1, name: 'Mar 2026', status: 'open' };
      store.bankAccounts = [{ id: 10, name: 'Checking', account_no: 'NL01ABNA1234567890' }];
      store.previewAccounts = [
        {
          bank_account_id: 10,
          current_balance: 100000,
          net: -5000,
          projected_balance: 95000,
          transactions: [
            {
              bank_ref: 'REF001',
              transaction_date: '2026-03-15',
              withdrawal_amount: 5000,
              deposit_amount: 0,
              description: 'Test',
              status: 'paid',
              import_status: 'new',
            },
            {
              bank_ref: 'REF002',
              transaction_date: '2026-03-15',
              withdrawal_amount: 0,
              deposit_amount: 0,
              description: 'Duplicate',
              status: 'paid',
              import_status: 'duplicate',
            },
          ],
        },
      ];
      return store;
    }

    it('sends all transactions including duplicates and deleted with their flags', async () => {
      const saveResponse = {
        bank_accounts: [
          {
            bank_account_id: 10,
            current_balance: 95000,
            net: 0,
            projected_balance: 95000,
            transactions: [],
          },
        ],
      };
      vi.mocked(importApi.save).mockResolvedValue(saveResponse as unknown as SaveResponse);

      const store = setupStoreForSave();
      await store.saveImport();

      expect(importApi.save).toHaveBeenCalledTimes(1);
      const payload = vi.mocked(importApi.save).mock.calls[0][0];
      expect(payload.bank_accounts[0].transactions).toHaveLength(2);
      expect(payload.bank_accounts[0].transactions[0].bank_ref).toBe('REF001');
      expect(payload.bank_accounts[0].transactions[0].deleted).toBe(false);
      expect(payload.bank_accounts[0].transactions[0].camt_imported).toBe(true);
      expect(payload.bank_accounts[0].transactions[1].bank_ref).toBe('REF002');
      expect(payload.bank_accounts[0].transactions[1].deleted).toBe(false);
      expect(payload.bank_accounts[0].transactions[1].camt_imported).toBe(true);
    });

    it('sets phase to saved on success', async () => {
      vi.mocked(importApi.save).mockResolvedValue({ bank_accounts: [] });

      const store = setupStoreForSave();
      await store.saveImport();

      expect(store.phase).toBe('saved');
    });

    it('stores save result', async () => {
      const saveResponse = {
        bank_accounts: [
          {
            bank_account_id: 10,
            current_balance: 95000,
            net: 0,
            projected_balance: 95000,
            transactions: [],
          },
        ],
      };
      vi.mocked(importApi.save).mockResolvedValue(saveResponse as unknown as SaveResponse);

      const store = setupStoreForSave();
      await store.saveImport();

      expect(store.saveResult).toEqual(saveResponse);
    });

    it('sets loading true during save and false after', async () => {
      let loadingDuringSave = false;
      vi.mocked(importApi.save).mockImplementation(async () => {
        loadingDuringSave = useImportStore().loading;
        return { bank_accounts: [] };
      });

      const store = setupStoreForSave();
      await store.saveImport();

      expect(loadingDuringSave).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error and re-throws on failure', async () => {
      vi.mocked(importApi.save).mockRejectedValue(new Error('422 error'));

      const store = setupStoreForSave();
      await expect(store.saveImport()).rejects.toThrow('422 error');

      expect(store.error).toBe('422 error');
      expect(store.loading).toBe(false);
    });

    it('sets error and re-throws when no budget selected', async () => {
      const store = useImportStore();
      store.selectedBudget = null;

      await expect(store.saveImport()).rejects.toThrow('No budget selected');
      expect(store.error).toBe('No budget selected');
    });
  });

  describe('resetPreview', () => {
    it('clears preview state and returns to idle', () => {
      const store = useImportStore();
      store.previewAccounts = [
        { bank_account_id: 10, current_balance: 0, net: 0, projected_balance: 0, transactions: [] },
      ];
      store.unmatchedIbans = [{ iban: 'NL01', transactionCount: 1 }];
      store.saveResult = { bank_accounts: [] };
      store.error = 'some error';
      store.phase = 'preview';

      store.resetPreview();

      expect(store.previewAccounts).toEqual([]);
      expect(store.unmatchedIbans).toEqual([]);
      expect(store.saveResult).toBeNull();
      expect(store.error).toBeNull();
      expect(store.phase).toBe('idle');
    });
  });

  describe('autoAllocate', () => {
    it('calls the API for the primary budget account', async () => {
      const store = useImportStore();
      mockSettings.primary_budget_account_id = 10;
      store.selectedBudget = { id: 1, name: 'Jan 2025', status: 'open' };
      store.bankAccounts = [{ id: 10, name: 'Checking', is_credit_card: false }];
      store.previewAccounts = [
        {
          bank_account_id: 10,
          current_balance: 0,
          net: 0,
          projected_balance: 0,
          transactions: [
            {
              description: 'Groceries',
              import_status: 'new',
              bank_ref: 'R1',
              withdrawal_amount: 5000,
              deposit_amount: 0,
            },
          ],
        },
      ];

      vi.mocked(budgetApi.autoAllocate).mockResolvedValue({ suggestions: [] });
      await store.autoAllocate();

      expect(budgetApi.autoAllocate).toHaveBeenCalled();
    });

    it('calls the API for credit card accounts', async () => {
      const store = useImportStore();
      mockSettings.primary_budget_account_id = 10;
      store.selectedBudget = { id: 1, name: 'Jan 2025', status: 'open' };
      store.bankAccounts = [{ id: 20, name: 'Credit Card', is_credit_card: true }];
      store.previewAccounts = [
        {
          bank_account_id: 20,
          current_balance: 0,
          net: 0,
          projected_balance: 0,
          transactions: [
            {
              description: 'Coffee',
              import_status: 'new',
              bank_ref: 'R2',
              withdrawal_amount: 500,
              deposit_amount: 0,
            },
          ],
        },
      ];

      vi.mocked(budgetApi.autoAllocate).mockResolvedValue({ suggestions: [] });
      await store.autoAllocate();

      expect(budgetApi.autoAllocate).toHaveBeenCalled();
    });

    it('skips accounts that are not primary or credit card', async () => {
      const store = useImportStore();
      mockSettings.primary_budget_account_id = 10;
      store.selectedBudget = { id: 1, name: 'Jan 2025', status: 'open' };
      store.bankAccounts = [{ id: 99, name: 'Savings', is_credit_card: false }];
      store.previewAccounts = [
        {
          bank_account_id: 99,
          current_balance: 0,
          net: 0,
          projected_balance: 0,
          transactions: [
            {
              description: 'Transfer',
              import_status: 'new',
              bank_ref: 'R3',
              withdrawal_amount: 10000,
              deposit_amount: 0,
            },
          ],
        },
      ];

      await store.autoAllocate();

      expect(budgetApi.autoAllocate).not.toHaveBeenCalled();
    });
  });

  describe('getBankAccountName', () => {
    it('returns account name for matching id', () => {
      const store = useImportStore();
      store.bankAccounts = [{ id: 10, name: 'Checking' }];

      expect(store.getBankAccountName(10)).toBe('Checking');
    });

    it('returns "Unknown Account" for non-matching id', () => {
      const store = useImportStore();
      store.bankAccounts = [];

      expect(store.getBankAccountName(999)).toBe('Unknown Account');
    });
  });
});
