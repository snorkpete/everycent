import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTransactionStore } from './transactionStore';
import { transactionApi } from './transactionApi';
import { budgetApi } from '../budgets/budgetApi';
import { bankAccountApi } from '../bank-accounts/bankAccountApi';

vi.mock('./transactionApi', () => ({
  transactionApi: {
    getAll: vi.fn(),
    save: vi.fn(),
    getSinkFundAllocations: vi.fn(),
  },
}));

vi.mock('../budgets/budgetApi', () => ({
  budgetApi: {
    getAll: vi.fn(),
    getAllocations: vi.fn(),
  },
}));

vi.mock('../bank-accounts/bankAccountApi', () => ({
  bankAccountApi: {
    getAll: vi.fn(),
    getInstitutions: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    getWithBalances: vi.fn(),
  },
}));

describe('transactionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has empty transactions', () => {
      const store = useTransactionStore();
      expect(store.transactions).toEqual([]);
    });

    it('has empty draftTransactions', () => {
      const store = useTransactionStore();
      expect(store.draftTransactions).toEqual([]);
    });

    it('has isEditMode false', () => {
      const store = useTransactionStore();
      expect(store.isEditMode).toBe(false);
    });

    it('has empty allocations', () => {
      const store = useTransactionStore();
      expect(store.allocations).toEqual([]);
    });

    it('has empty sinkFundAllocations', () => {
      const store = useTransactionStore();
      expect(store.sinkFundAllocations).toEqual([]);
    });

    it('has empty budgets', () => {
      const store = useTransactionStore();
      expect(store.budgets).toEqual([]);
    });

    it('has empty bankAccounts', () => {
      const store = useTransactionStore();
      expect(store.bankAccounts).toEqual([]);
    });

    it('has null selectedBankAccount', () => {
      const store = useTransactionStore();
      expect(store.selectedBankAccount).toBeNull();
    });

    it('has null selectedBudget', () => {
      const store = useTransactionStore();
      expect(store.selectedBudget).toBeNull();
    });

    it('has loading false', () => {
      const store = useTransactionStore();
      expect(store.loading).toBe(false);
    });

    it('has null error', () => {
      const store = useTransactionStore();
      expect(store.error).toBeNull();
    });
  });

  describe('fetchMetadata', () => {
    it('loads budgets and bank accounts with balances', async () => {
      const budgets = [{ id: 1, name: 'Jan 2025', status: 'open' }];
      const accounts = [{ id: 2, name: 'Savings', current_balance: 50000 }];
      vi.mocked(budgetApi.getAll).mockResolvedValue(budgets);
      vi.mocked(bankAccountApi.getWithBalances).mockResolvedValue(accounts);

      const store = useTransactionStore();
      await store.fetchMetadata();

      expect(store.budgets).toEqual(budgets);
      expect(store.bankAccounts).toEqual(accounts);
    });

    it('sets loading to true during fetch and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(budgetApi.getAll).mockImplementation(async () => {
        loadingDuringCall = useTransactionStore().loading;
        return [];
      });
      vi.mocked(bankAccountApi.getWithBalances).mockResolvedValue([]);

      const store = useTransactionStore();
      await store.fetchMetadata();

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error message on failure', async () => {
      vi.mocked(budgetApi.getAll).mockRejectedValue(new Error('Network error'));
      vi.mocked(bankAccountApi.getWithBalances).mockResolvedValue([]);

      const store = useTransactionStore();
      await store.fetchMetadata();

      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });

    it('clears error on subsequent successful fetch', async () => {
      vi.mocked(budgetApi.getAll).mockRejectedValueOnce(new Error('fail'));
      vi.mocked(bankAccountApi.getWithBalances).mockResolvedValue([]);
      vi.mocked(budgetApi.getAll).mockResolvedValueOnce([]);

      const store = useTransactionStore();
      await store.fetchMetadata();
      await store.fetchMetadata();

      expect(store.error).toBeNull();
    });
  });

  describe('fetch', () => {
    it('fetches transactions, allocations, and sink fund allocations for non-sink-fund account', async () => {
      const transactions = [{ id: 1, description: 'Test' }];
      const allocations = [{ id: 1, name: 'Rent' }];
      const bankAccount = { id: 2, name: 'Checking', is_sink_fund: false };
      const budget = { id: 3, name: 'Jan 2025' };

      vi.mocked(transactionApi.getAll).mockResolvedValue(transactions);
      vi.mocked(budgetApi.getAllocations).mockResolvedValue(allocations);
      vi.mocked(bankAccountApi.getWithBalances).mockResolvedValue([bankAccount]);
      vi.mocked(budgetApi.getAll).mockResolvedValue([budget]);

      const store = useTransactionStore();
      store.bankAccounts = [bankAccount];
      store.budgets = [budget];
      await store.fetch({ budgetId: 3, bankAccountId: 2 });

      expect(store.transactions).toEqual(transactions);
      expect(store.allocations).toEqual(allocations);
      expect(transactionApi.getAll).toHaveBeenCalledWith({ budgetId: 3, bankAccountId: 2 });
      expect(budgetApi.getAllocations).toHaveBeenCalledWith(3);
    });

    it('fetches sink fund allocations for sink fund account', async () => {
      const transactions = [{ id: 1, description: 'Sink transfer' }];
      const sinkAllocations = [{ id: 1, name: 'Holiday Fund' }];
      const bankAccount = { id: 5, name: 'Sink Fund', is_sink_fund: true };
      const budget = { id: 3, name: 'Jan 2025' };

      vi.mocked(transactionApi.getAll).mockResolvedValue(transactions);
      vi.mocked(transactionApi.getSinkFundAllocations).mockResolvedValue(sinkAllocations);
      vi.mocked(budgetApi.getAllocations).mockResolvedValue([]);

      const store = useTransactionStore();
      store.bankAccounts = [bankAccount];
      store.budgets = [budget];
      await store.fetch({ budgetId: 3, bankAccountId: 5 });

      expect(store.sinkFundAllocations).toEqual(sinkAllocations);
      expect(transactionApi.getSinkFundAllocations).toHaveBeenCalledWith(5);
    });

    it('clears sinkFundAllocations at the start of every fetch', async () => {
      const bankAccount = { id: 2, name: 'Checking', is_sink_fund: false };
      const budget = { id: 3, name: 'Jan 2025' };

      vi.mocked(transactionApi.getAll).mockResolvedValue([]);
      vi.mocked(budgetApi.getAllocations).mockResolvedValue([]);

      const store = useTransactionStore();
      store.sinkFundAllocations = [{ id: 1, name: 'Holiday Fund', amount: 50000 }];
      store.bankAccounts = [bankAccount];
      store.budgets = [budget];
      await store.fetch({ budgetId: 3, bankAccountId: 2 });

      expect(store.sinkFundAllocations).toEqual([]);
    });

    it('syncs draftTransactions with loaded transactions', async () => {
      const transactions = [{ id: 1, description: 'Groceries' }];
      const bankAccount = { id: 2, name: 'Checking', is_sink_fund: false };
      const budget = { id: 3, name: 'Jan 2025' };

      vi.mocked(transactionApi.getAll).mockResolvedValue(transactions);
      vi.mocked(budgetApi.getAllocations).mockResolvedValue([]);

      const store = useTransactionStore();
      store.bankAccounts = [bankAccount];
      store.budgets = [budget];
      await store.fetch({ budgetId: 3, bankAccountId: 2 });

      expect(store.draftTransactions).toEqual(transactions);
    });

    it('sets selectedBankAccount and selectedBudget from loaded data', async () => {
      const bankAccount = { id: 2, name: 'Checking' };
      const budget = { id: 3, name: 'Jan 2025' };

      vi.mocked(transactionApi.getAll).mockResolvedValue([]);
      vi.mocked(budgetApi.getAllocations).mockResolvedValue([]);

      const store = useTransactionStore();
      store.bankAccounts = [bankAccount];
      store.budgets = [budget];
      await store.fetch({ budgetId: 3, bankAccountId: 2 });

      expect(store.selectedBankAccount).toEqual(bankAccount);
      expect(store.selectedBudget).toEqual(budget);
    });

    it('sets loading to true during fetch and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(transactionApi.getAll).mockImplementation(async () => {
        loadingDuringCall = useTransactionStore().loading;
        return [];
      });
      vi.mocked(budgetApi.getAllocations).mockResolvedValue([]);

      const store = useTransactionStore();
      store.bankAccounts = [{ id: 2, name: 'Checking' }];
      store.budgets = [{ id: 3, name: 'Jan 2025' }];
      await store.fetch({ budgetId: 3, bankAccountId: 2 });

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error message on failure', async () => {
      vi.mocked(transactionApi.getAll).mockRejectedValue(new Error('Fetch failed'));
      vi.mocked(budgetApi.getAllocations).mockResolvedValue([]);

      const store = useTransactionStore();
      store.bankAccounts = [{ id: 2, name: 'Checking' }];
      store.budgets = [{ id: 3, name: 'Jan 2025' }];
      await store.fetch({ budgetId: 3, bankAccountId: 2 });

      expect(store.error).toBe('Fetch failed');
      expect(store.loading).toBe(false);
    });

    it('clears error on subsequent successful fetch', async () => {
      vi.mocked(transactionApi.getAll).mockRejectedValueOnce(new Error('fail'));
      vi.mocked(budgetApi.getAllocations).mockResolvedValue([]);
      vi.mocked(transactionApi.getAll).mockResolvedValueOnce([]);

      const store = useTransactionStore();
      store.bankAccounts = [{ id: 2 }];
      store.budgets = [{ id: 3 }];
      await store.fetch({ budgetId: 3, bankAccountId: 2 });
      await store.fetch({ budgetId: 3, bankAccountId: 2 });

      expect(store.error).toBeNull();
    });
  });

  describe('save', () => {
    it('calls transactionApi.save with bank account and budget from selected state', async () => {
      const transactions = [{ id: 1, description: 'Test', withdrawal_amount: 100, deposit_amount: 0 }];
      vi.mocked(transactionApi.save).mockResolvedValue(transactions);
      vi.mocked(transactionApi.getAll).mockResolvedValue(transactions);
      vi.mocked(budgetApi.getAllocations).mockResolvedValue([]);

      const store = useTransactionStore();
      store.selectedBankAccount = { id: 2, name: 'Checking' };
      store.selectedBudget = { id: 3, name: 'Jan 2025' };
      store.transactions = transactions;
      store.bankAccounts = [{ id: 2, name: 'Checking' }];
      store.budgets = [{ id: 3, name: 'Jan 2025' }];

      await store.save(transactions);

      expect(transactionApi.save).toHaveBeenCalledWith({
        bankAccountId: 2,
        budgetId: 3,
        transactions,
      });
    });

    it('refreshes transactions after save', async () => {
      const transactions = [{ id: 1, description: 'Test' }];
      const refreshed = [{ id: 1, description: 'Updated' }];
      vi.mocked(transactionApi.save).mockResolvedValue(refreshed);
      vi.mocked(transactionApi.getAll).mockResolvedValue(refreshed);
      vi.mocked(budgetApi.getAllocations).mockResolvedValue([]);

      const store = useTransactionStore();
      store.selectedBankAccount = { id: 2, name: 'Checking' };
      store.selectedBudget = { id: 3, name: 'Jan 2025' };
      store.bankAccounts = [{ id: 2, name: 'Checking' }];
      store.budgets = [{ id: 3, name: 'Jan 2025' }];

      await store.save(transactions);

      expect(store.transactions).toEqual(refreshed);
    });

    it('sets error message and re-throws on save failure', async () => {
      vi.mocked(transactionApi.save).mockRejectedValue(new Error('Save failed'));

      const store = useTransactionStore();
      store.selectedBankAccount = { id: 2, name: 'Checking' };
      store.selectedBudget = { id: 3, name: 'Jan 2025' };

      await expect(store.save([])).rejects.toThrow('Save failed');

      expect(store.error).toBe('Save failed');
    });

    it('sets loading to true during save and false after', async () => {
      let loadingDuringSave = false;
      vi.mocked(transactionApi.save).mockImplementation(async () => {
        loadingDuringSave = useTransactionStore().loading;
        return [];
      });
      vi.mocked(transactionApi.getAll).mockResolvedValue([]);
      vi.mocked(budgetApi.getAllocations).mockResolvedValue([]);

      const store = useTransactionStore();
      store.selectedBankAccount = { id: 2 };
      store.selectedBudget = { id: 3 };
      store.bankAccounts = [{ id: 2 }];
      store.budgets = [{ id: 3 }];

      await store.save([]);

      expect(loadingDuringSave).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('does nothing when selectedBankAccount or selectedBudget is null', async () => {
      const store = useTransactionStore();
      store.selectedBankAccount = null;
      store.selectedBudget = null;

      await store.save([]);

      expect(transactionApi.save).not.toHaveBeenCalled();
    });

    it('filters out deleted transactions before calling transactionApi.save', async () => {
      const liveTransaction = { id: 1, description: 'Keep', withdrawal_amount: 100, deposit_amount: 0 };
      const deletedTransaction = { id: 2, description: 'Remove', withdrawal_amount: 50, deposit_amount: 0, deleted: true };
      vi.mocked(transactionApi.save).mockResolvedValue([liveTransaction]);
      vi.mocked(transactionApi.getAll).mockResolvedValue([liveTransaction]);
      vi.mocked(budgetApi.getAllocations).mockResolvedValue([]);

      const store = useTransactionStore();
      store.selectedBankAccount = { id: 2, name: 'Checking' };
      store.selectedBudget = { id: 3, name: 'Jan 2025' };
      store.bankAccounts = [{ id: 2, name: 'Checking' }];
      store.budgets = [{ id: 3, name: 'Jan 2025' }];

      await store.save([liveTransaction, deletedTransaction]);

      expect(transactionApi.save).toHaveBeenCalledWith({
        bankAccountId: 2,
        budgetId: 3,
        transactions: [liveTransaction],
      });
    });
  });

  describe('addImportedTransactions', () => {
    it('enters edit mode if not already in edit mode', () => {
      const store = useTransactionStore();
      store.isEditMode = false;
      store.transactions = [{ id: 1, description: 'Existing', withdrawal_amount: 0, deposit_amount: 0, status: 'paid' }];

      store.addImportedTransactions([{ description: 'Imported', withdrawal_amount: 500, deposit_amount: 0 }]);

      expect(store.isEditMode).toBe(true);
    });

    it('appends imported transactions to draftTransactions', () => {
      const store = useTransactionStore();
      store.transactions = [{ id: 1, description: 'Existing', withdrawal_amount: 0, deposit_amount: 0, status: 'paid' }];
      store.draftTransactions = [{ id: 1, description: 'Existing', withdrawal_amount: 0, deposit_amount: 0, status: 'paid' }];
      store.isEditMode = true;

      const imported = [{ description: 'Imported', withdrawal_amount: 500, deposit_amount: 0 }];
      store.addImportedTransactions(imported);

      expect(store.draftTransactions).toHaveLength(2);
      expect(store.draftTransactions[1]).toEqual(imported[0]);
    });

    it('preserves existing draft edits when already in edit mode', () => {
      const store = useTransactionStore();
      const existingDraft = { id: 1, description: 'Edited locally', withdrawal_amount: 999, deposit_amount: 0, status: 'paid' };
      store.transactions = [{ id: 1, description: 'Server', withdrawal_amount: 0, deposit_amount: 0, status: 'paid' }];
      store.draftTransactions = [existingDraft];
      store.isEditMode = true;

      store.addImportedTransactions([{ description: 'New Import', withdrawal_amount: 100, deposit_amount: 0 }]);

      expect(store.draftTransactions[0]).toEqual(existingDraft);
    });

    it('clones transactions into draft when entering edit mode on import', () => {
      const original = { id: 1, description: 'Original', withdrawal_amount: 0, deposit_amount: 0, status: 'paid' };
      const store = useTransactionStore();
      store.transactions = [original];
      store.isEditMode = false;

      store.addImportedTransactions([{ description: 'Imported', withdrawal_amount: 200, deposit_amount: 0 }]);

      // draftTransactions has both the clone and the imported row
      expect(store.draftTransactions).toHaveLength(2);
      expect(store.draftTransactions[0]).toEqual(original);
      expect(store.draftTransactions[1].description).toBe('Imported');
    });

    it('appends multiple imported transactions at once', () => {
      const store = useTransactionStore();
      store.isEditMode = true;
      store.draftTransactions = [];

      const imported = [
        { description: 'First', withdrawal_amount: 100, deposit_amount: 0 },
        { description: 'Second', withdrawal_amount: 200, deposit_amount: 0 },
      ];
      store.addImportedTransactions(imported);

      expect(store.draftTransactions).toHaveLength(2);
    });
  });

  describe('refresh', () => {
    it('re-fetches using current selectedBankAccount and selectedBudget', async () => {
      vi.mocked(transactionApi.getAll).mockResolvedValue([]);
      vi.mocked(budgetApi.getAllocations).mockResolvedValue([]);

      const store = useTransactionStore();
      store.selectedBankAccount = { id: 2, name: 'Checking' };
      store.selectedBudget = { id: 3, name: 'Jan 2025' };
      store.bankAccounts = [{ id: 2, name: 'Checking' }];
      store.budgets = [{ id: 3, name: 'Jan 2025' }];

      await store.refresh();

      expect(transactionApi.getAll).toHaveBeenCalledWith({ budgetId: 3, bankAccountId: 2 });
    });

    it('does nothing when selectedBankAccount or selectedBudget is null', async () => {
      const store = useTransactionStore();
      store.selectedBankAccount = null;
      store.selectedBudget = null;

      await store.refresh();

      expect(transactionApi.getAll).not.toHaveBeenCalled();
    });
  });

  describe('exitEditMode', () => {
    it('sets isEditMode to false', () => {
      const store = useTransactionStore();
      store.isEditMode = true;

      store.exitEditMode();

      expect(store.isEditMode).toBe(false);
    });

    it('does not reset draftTransactions', () => {
      const draft = [{ id: 1, description: 'Draft', withdrawal_amount: 0, deposit_amount: 0, status: 'paid' }];
      const store = useTransactionStore();
      store.isEditMode = true;
      store.draftTransactions = draft;

      store.exitEditMode();

      expect(store.draftTransactions).toEqual(draft);
    });
  });

  describe('enterEditMode', () => {
    it('sets isEditMode to true', () => {
      const store = useTransactionStore();
      store.transactions = [{ id: 1, description: 'Test', withdrawal_amount: 100, deposit_amount: 0, status: 'paid' }];

      store.enterEditMode();

      expect(store.isEditMode).toBe(true);
    });

    it('creates a deep copy of transactions into draftTransactions', () => {
      const transaction = { id: 1, description: 'Original', withdrawal_amount: 100, deposit_amount: 0, status: 'paid' };
      const store = useTransactionStore();
      store.transactions = [transaction];

      store.enterEditMode();

      expect(store.draftTransactions).toEqual([transaction]);
      store.draftTransactions[0].description = 'Mutated';
      expect(store.transactions[0].description).toBe('Original');
    });
  });

  describe('cancelEdit', () => {
    it('sets isEditMode to false', () => {
      const store = useTransactionStore();
      store.isEditMode = true;

      store.cancelEdit();

      expect(store.isEditMode).toBe(false);
    });

    it('resets draftTransactions from transactions', () => {
      const store = useTransactionStore();
      store.transactions = [{ id: 1, description: 'Server', withdrawal_amount: 0, deposit_amount: 0, status: 'paid' }];
      store.draftTransactions = [{ id: 1, description: 'Draft edit', withdrawal_amount: 0, deposit_amount: 0, status: 'paid' }];
      store.isEditMode = true;

      store.cancelEdit();

      expect(store.draftTransactions).toEqual(store.transactions);
    });

    it('creates a deep copy so draft is independent of transactions', () => {
      const store = useTransactionStore();
      store.transactions = [{ id: 1, description: 'Server', withdrawal_amount: 0, deposit_amount: 0, status: 'paid' }];

      store.cancelEdit();
      store.draftTransactions[0].description = 'Mutated';

      expect(store.transactions[0].description).toBe('Server');
    });
  });

  describe('addTransaction', () => {
    it('appends a new transaction to draftTransactions', () => {
      const store = useTransactionStore();
      store.selectedBankAccount = { id: 1, name: 'Checking', is_credit_card: false };
      store.draftTransactions = [];

      store.addTransaction();

      expect(store.draftTransactions).toHaveLength(1);
    });

    it('adds new transaction with status "paid" for non-credit-card accounts', () => {
      const store = useTransactionStore();
      store.selectedBankAccount = { id: 1, name: 'Checking', is_credit_card: false };

      store.addTransaction();

      expect(store.draftTransactions[0].status).toBe('paid');
    });

    it('adds new transaction with status "unpaid" for credit card accounts', () => {
      const store = useTransactionStore();
      store.selectedBankAccount = { id: 2, name: 'Credit Card', is_credit_card: true };

      store.addTransaction();

      expect(store.draftTransactions[0].status).toBe('unpaid');
    });

    it('adds new transaction with zero withdrawal and deposit amounts', () => {
      const store = useTransactionStore();
      store.selectedBankAccount = { id: 1, name: 'Checking', is_credit_card: false };

      store.addTransaction();

      expect(store.draftTransactions[0].withdrawal_amount).toBe(0);
      expect(store.draftTransactions[0].deposit_amount).toBe(0);
    });
  });

  describe('deleteTransaction', () => {
    it('sets deleted to true on the transaction', () => {
      const store = useTransactionStore();
      const transaction = { id: 1, description: 'Groceries', withdrawal_amount: 100, deposit_amount: 0, status: 'paid', deleted: false };
      store.draftTransactions = [transaction];

      store.deleteTransaction(store.draftTransactions[0]);

      expect(store.draftTransactions[0].deleted).toBe(true);
    });
  });

  describe('onAllocationChange', () => {
    it('sets allocation_id on the transaction', () => {
      const store = useTransactionStore();
      const transaction = { id: 1, description: 'Test', withdrawal_amount: 0, deposit_amount: 0, status: 'unpaid' };
      store.draftTransactions = [transaction];

      store.onAllocationChange(store.draftTransactions[0], 5);

      expect(store.draftTransactions[0].allocation_id).toBe(5);
    });

    it('sets status to "paid" when allocationId is greater than 0', () => {
      const store = useTransactionStore();
      const transaction = { id: 1, description: 'Test', withdrawal_amount: 0, deposit_amount: 0, status: 'unpaid' };
      store.draftTransactions = [transaction];

      store.onAllocationChange(store.draftTransactions[0], 3);

      expect(store.draftTransactions[0].status).toBe('paid');
    });

    it('sets status to "unpaid" when allocationId is 0', () => {
      const store = useTransactionStore();
      const transaction = { id: 1, description: 'Test', withdrawal_amount: 0, deposit_amount: 0, status: 'paid' };
      store.draftTransactions = [transaction];

      store.onAllocationChange(store.draftTransactions[0], 0);

      expect(store.draftTransactions[0].status).toBe('unpaid');
    });
  });

  describe('budgetsForDropdown computed', () => {
    it('includes the last open budget and all closed budgets', () => {
      const store = useTransactionStore();
      store.budgets = [
        { id: 1, name: 'Nov 2024', status: 'closed' },
        { id: 2, name: 'Dec 2024', status: 'closed' },
        { id: 3, name: 'Jan 2025', status: 'open' },
        { id: 4, name: 'Feb 2025', status: 'open' },
      ];

      expect(store.budgetsForDropdown).toEqual([
        { id: 4, name: 'Feb 2025', status: 'open' },
        { id: 1, name: 'Nov 2024', status: 'closed' },
        { id: 2, name: 'Dec 2024', status: 'closed' },
      ]);
    });

    it('includes only closed budgets when there are no open budgets', () => {
      const store = useTransactionStore();
      store.budgets = [
        { id: 1, name: 'Nov 2024', status: 'closed' },
        { id: 2, name: 'Dec 2024', status: 'closed' },
      ];

      expect(store.budgetsForDropdown).toEqual([
        { id: 1, name: 'Nov 2024', status: 'closed' },
        { id: 2, name: 'Dec 2024', status: 'closed' },
      ]);
    });

    it('returns empty array when budgets is empty', () => {
      const store = useTransactionStore();
      store.budgets = [];

      expect(store.budgetsForDropdown).toEqual([]);
    });
  });
});
