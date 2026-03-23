import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useImportStore } from './importStore';
import { importApi } from './importApi';
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
  },
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

    it('sets error and re-throws on failure', async () => {
      vi.mocked(budgetApi.getAll).mockRejectedValue(new Error('Network error'));
      vi.mocked(bankAccountApi.getOpen).mockResolvedValue([]);

      const store = useImportStore();
      await expect(store.fetchMetadata()).rejects.toThrow('Network error');

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

  describe('budgetsForDropdown', () => {
    it('puts open budgets before closed budgets', () => {
      const store = useImportStore();
      store.budgets = [
        { id: 1, name: 'Nov 2025', status: 'closed' },
        { id: 2, name: 'Jan 2026', status: 'open' },
      ];

      expect(store.budgetsForDropdown.map((b) => b.id)).toEqual([2, 1]);
    });

    it('returns empty array when budgets is empty', () => {
      const store = useImportStore();
      store.budgets = [];

      expect(store.budgetsForDropdown).toEqual([]);
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

  describe('parseAndPreview', () => {
    function setupStoreForParse() {
      const store = useImportStore();
      store.selectedBudget = { id: 1, name: 'Mar 2026', status: 'open', start_date: '2026-03-01', end_date: '2026-03-31' };
      store.bankAccounts = [
        { id: 10, name: 'Checking', account_no: 'NL01ABNA1234567890', account_type: 'normal' },
      ];
      return store;
    }

    it('calls parser and preview endpoint, sets previewAccounts', async () => {
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
                bank_account_id: 10,
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
      vi.mocked(importApi.preview).mockResolvedValue(previewResponse);

      const store = setupStoreForParse();
      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });
      await store.parseAndPreview(file);

      expect(store.previewAccounts).toEqual(previewResponse.bank_accounts);
      expect(store.phase).toBe('preview');
    });

    it('sets loading true during parse and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(importApi.preview).mockImplementation(async () => {
        loadingDuringCall = useImportStore().loading;
        return { bank_accounts: [] };
      });

      const store = setupStoreForParse();
      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });
      await store.parseAndPreview(file);

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error and re-throws when no budget selected', async () => {
      const store = useImportStore();
      store.selectedBudget = null;

      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });
      await expect(store.parseAndPreview(file)).rejects.toThrow('No budget selected');

      expect(store.error).toBe('No budget selected');
    });

    it('sets error and re-throws on preview endpoint failure', async () => {
      vi.mocked(importApi.preview).mockRejectedValue(new Error('Server error'));

      const store = setupStoreForParse();
      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });
      await expect(store.parseAndPreview(file)).rejects.toThrow('Server error');

      expect(store.error).toBe('Server error');
      expect(store.loading).toBe(false);
    });

    it('separates unmatched IBANs from matched accounts', async () => {
      const { parseCamt053Zip } = await import('../transactions/importers/camt053Parser');
      vi.mocked(parseCamt053Zip).mockResolvedValueOnce({
        accounts: [
          { iban: 'NL01ABNA1234567890', bankAccountId: 10, transactions: [{ description: 'Test' }] },
          { iban: 'NL99UNKN0000000000', bankAccountId: undefined, transactions: [{ description: 'A' }, { description: 'B' }] },
        ],
      });
      vi.mocked(importApi.preview).mockResolvedValue({ bank_accounts: [] });

      const store = setupStoreForParse();
      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });
      await store.parseAndPreview(file);

      expect(store.unmatchedIbans).toEqual([
        { iban: 'NL99UNKN0000000000', transactionCount: 2 },
      ]);
    });

    it('resets preview state before processing', async () => {
      vi.mocked(importApi.preview).mockResolvedValue({ bank_accounts: [] });

      const store = setupStoreForParse();
      store.previewAccounts = [{ bank_account_id: 99, current_balance: 0, net: 0, projected_balance: 0, transactions: [] }];
      store.unmatchedIbans = [{ iban: 'NL99', transactionCount: 1 }];
      store.saveResult = { bank_accounts: [] };
      store.phase = 'saved';

      const file = new File(['fake'], 'test.zip', { type: 'application/zip' });
      await store.parseAndPreview(file);

      // previewAccounts is set from the (empty) response, unmatchedIbans and saveResult reset
      expect(store.saveResult).toBeNull();
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
          transactions: [
            { description: 'Test', import_status: 'new', deleted: false },
          ],
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

  describe('confirmableTransactions', () => {
    it('filters out duplicates and deleted transactions', () => {
      const store = useImportStore();
      store.previewAccounts = [
        {
          bank_account_id: 10,
          current_balance: 100000,
          net: 0,
          projected_balance: 100000,
          transactions: [
            { description: 'New', import_status: 'new', deleted: false },
            { description: 'Duplicate', import_status: 'duplicate', deleted: false },
            { description: 'Deleted', import_status: 'new', deleted: true },
            { description: 'Out of period', import_status: 'out_of_period', deleted: false },
          ],
        },
      ];

      const result = store.confirmableTransactions;
      expect(result[0].transactions).toHaveLength(2);
      expect(result[0].transactions.map((t) => t.description)).toEqual(['New', 'Out of period']);
    });
  });

  describe('saveImport', () => {
    function setupStoreForSave() {
      const store = useImportStore();
      store.selectedBudget = { id: 1, name: 'Mar 2026', status: 'open' };
      store.bankAccounts = [
        { id: 10, name: 'Checking', account_no: 'NL01ABNA1234567890' },
      ];
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

    it('calls save endpoint with non-deleted, non-duplicate transactions', async () => {
      const saveResponse = { bank_accounts: [{ bank_account_id: 10, current_balance: 95000, net: 0, projected_balance: 95000, transactions: [] }] };
      vi.mocked(importApi.save).mockResolvedValue(saveResponse);

      const store = setupStoreForSave();
      await store.saveImport();

      expect(importApi.save).toHaveBeenCalledTimes(1);
      const payload = vi.mocked(importApi.save).mock.calls[0][0];
      expect(payload.bank_accounts[0].transactions).toHaveLength(1);
      expect(payload.bank_accounts[0].transactions[0].bank_ref).toBe('REF001');
    });

    it('sets phase to saved on success', async () => {
      vi.mocked(importApi.save).mockResolvedValue({ bank_accounts: [] });

      const store = setupStoreForSave();
      await store.saveImport();

      expect(store.phase).toBe('saved');
    });

    it('stores save result', async () => {
      const saveResponse = { bank_accounts: [{ bank_account_id: 10, current_balance: 95000, net: 0, projected_balance: 95000, transactions: [] }] };
      vi.mocked(importApi.save).mockResolvedValue(saveResponse);

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
      store.previewAccounts = [{ bank_account_id: 10, current_balance: 0, net: 0, projected_balance: 0, transactions: [] }];
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
