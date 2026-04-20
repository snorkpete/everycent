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
    autoAllocate: vi.fn(),
  },
}));

const mockSettings = { primary_budget_account_id: 1 };
vi.mock('../settings/settingsStore', () => ({
  useSettingsStore: () => ({ settings: mockSettings }),
}));

vi.mock('../bank-accounts/bankAccountApi', () => ({
  bankAccountApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    getOpen: vi.fn(),
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
      vi.mocked(bankAccountApi.getOpen).mockResolvedValue(accounts);

      const store = useTransactionStore();
      await store.fetchMetadata();

      expect(store.budgets).toEqual(budgets);
      expect(store.bankAccounts).toEqual(accounts);
    });

    it('sets error message on failure', async () => {
      vi.mocked(budgetApi.getAll).mockRejectedValue(new Error('Network error'));
      vi.mocked(bankAccountApi.getOpen).mockResolvedValue([]);

      const store = useTransactionStore();
      await store.fetchMetadata();

      expect(store.error).toBe('Network error');
    });

    it('clears error on subsequent successful fetch', async () => {
      vi.mocked(budgetApi.getAll).mockRejectedValueOnce(new Error('fail'));
      vi.mocked(bankAccountApi.getOpen).mockResolvedValue([]);
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
      vi.mocked(bankAccountApi.getOpen).mockResolvedValue([bankAccount]);
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

    it('sets error message on failure', async () => {
      vi.mocked(transactionApi.getAll).mockRejectedValue(new Error('Fetch failed'));
      vi.mocked(budgetApi.getAllocations).mockResolvedValue([]);

      const store = useTransactionStore();
      store.bankAccounts = [{ id: 2, name: 'Checking' }];
      store.budgets = [{ id: 3, name: 'Jan 2025' }];
      await store.fetch({ budgetId: 3, bankAccountId: 2 });

      expect(store.error).toBe('Fetch failed');
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
      const transactions = [
        { id: 1, description: 'Test', withdrawal_amount: 100, deposit_amount: 0 },
      ];
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

    it('does nothing when selectedBankAccount or selectedBudget is null', async () => {
      const store = useTransactionStore();
      store.selectedBankAccount = null;
      store.selectedBudget = null;

      await store.save([]);

      expect(transactionApi.save).not.toHaveBeenCalled();
    });

    it('strips selected flag before calling transactionApi.save', async () => {
      const selectedTransaction = {
        description: 'Selected',
        withdrawal_amount: 200,
        deposit_amount: 0,
        selected: true,
      };
      vi.mocked(transactionApi.save).mockResolvedValue([]);
      vi.mocked(transactionApi.getAll).mockResolvedValue([]);
      vi.mocked(budgetApi.getAllocations).mockResolvedValue([]);

      const store = useTransactionStore();
      store.selectedBankAccount = { id: 2, name: 'Checking' };
      store.selectedBudget = { id: 3, name: 'Jan 2025' };
      store.bankAccounts = [{ id: 2, name: 'Checking' }];
      store.budgets = [{ id: 3, name: 'Jan 2025' }];

      await store.save([selectedTransaction]);

      const saved = vi.mocked(transactionApi.save).mock.calls[0][0].transactions;
      expect(saved[0]).not.toHaveProperty('selected');
    });

    it('strips newlyImported flag before calling transactionApi.save', async () => {
      const importedTransaction = {
        description: 'Imported',
        withdrawal_amount: 100,
        deposit_amount: 0,
        newlyImported: true,
      };
      vi.mocked(transactionApi.save).mockResolvedValue([]);
      vi.mocked(transactionApi.getAll).mockResolvedValue([]);
      vi.mocked(budgetApi.getAllocations).mockResolvedValue([]);

      const store = useTransactionStore();
      store.selectedBankAccount = { id: 2, name: 'Checking' };
      store.selectedBudget = { id: 3, name: 'Jan 2025' };
      store.bankAccounts = [{ id: 2, name: 'Checking' }];
      store.budgets = [{ id: 3, name: 'Jan 2025' }];

      await store.save([importedTransaction]);

      const saved = vi.mocked(transactionApi.save).mock.calls[0][0].transactions;
      expect(saved[0]).not.toHaveProperty('newlyImported');
    });

    it('filters out deleted transactions before calling transactionApi.save', async () => {
      const liveTransaction = {
        id: 1,
        description: 'Keep',
        withdrawal_amount: 100,
        deposit_amount: 0,
      };
      const deletedTransaction = {
        id: 2,
        description: 'Remove',
        withdrawal_amount: 50,
        deposit_amount: 0,
        deleted: true,
      };
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
      store.transactions = [
        { id: 1, description: 'Existing', withdrawal_amount: 0, deposit_amount: 0, status: 'paid' },
      ];

      store.addImportedTransactions([
        { description: 'Imported', withdrawal_amount: 500, deposit_amount: 0 },
      ]);

      expect(store.isEditMode).toBe(true);
    });

    it('appends imported transactions to transactions', () => {
      const store = useTransactionStore();
      store.transactions = [
        { id: 1, description: 'Existing', withdrawal_amount: 0, deposit_amount: 0, status: 'paid' },
      ];
      store.isEditMode = true;

      const imported = [{ description: 'Imported', withdrawal_amount: 500, deposit_amount: 0 }];
      store.addImportedTransactions(imported);

      expect(store.transactions).toHaveLength(2);
      expect(store.transactions[1]).toEqual({ ...imported[0], newlyImported: true });
    });

    it('marks imported transactions with newlyImported: true', () => {
      const store = useTransactionStore();
      store.isEditMode = true;
      store.transactions = [];

      store.addImportedTransactions([
        { description: 'Imported', withdrawal_amount: 100, deposit_amount: 0 },
      ]);

      expect(store.transactions[0].newlyImported).toBe(true);
    });

    it('does not mark newlyImported on pre-existing draft transactions', () => {
      const store = useTransactionStore();
      const existing = {
        id: 1,
        description: 'Existing',
        withdrawal_amount: 0,
        deposit_amount: 0,
        status: 'paid',
      };
      store.transactions = [existing];
      store.isEditMode = true;

      store.addImportedTransactions([
        { description: 'New', withdrawal_amount: 50, deposit_amount: 0 },
      ]);

      expect(store.transactions[0].newlyImported).toBeUndefined();
    });

    it('preserves existing edits when already in edit mode', () => {
      const store = useTransactionStore();
      const existing = {
        id: 1,
        description: 'Edited locally',
        withdrawal_amount: 999,
        deposit_amount: 0,
        status: 'paid',
      };
      store.transactions = [existing];
      store.isEditMode = true;

      store.addImportedTransactions([
        { description: 'New Import', withdrawal_amount: 100, deposit_amount: 0 },
      ]);

      expect(store.transactions[0]).toEqual(existing);
    });

    it('enters edit mode and appends when not in edit mode', () => {
      const original = {
        id: 1,
        description: 'Original',
        withdrawal_amount: 0,
        deposit_amount: 0,
        status: 'paid',
      };
      const store = useTransactionStore();
      store.transactions = [original];
      store.isEditMode = false;

      store.addImportedTransactions([
        { description: 'Imported', withdrawal_amount: 200, deposit_amount: 0 },
      ]);

      expect(store.transactions).toHaveLength(2);
      expect(store.transactions[0]).toEqual(original);
      expect(store.transactions[1].description).toBe('Imported');
    });

    it('appends multiple imported transactions at once', () => {
      const store = useTransactionStore();
      store.isEditMode = true;
      store.transactions = [];

      const imported = [
        { description: 'First', withdrawal_amount: 100, deposit_amount: 0 },
        { description: 'Second', withdrawal_amount: 200, deposit_amount: 0 },
      ];
      store.addImportedTransactions(imported);

      expect(store.transactions).toHaveLength(2);
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

    it('does not reset transactions', () => {
      const draft = [
        { id: 1, description: 'Draft', withdrawal_amount: 0, deposit_amount: 0, status: 'paid' },
      ];
      const store = useTransactionStore();
      store.isEditMode = true;
      store.transactions = draft;

      store.exitEditMode();

      expect(store.transactions).toEqual(draft);
    });
  });

  describe('enterEditMode', () => {
    it('sets isEditMode to true', () => {
      const store = useTransactionStore();
      store.transactions = [
        { id: 1, description: 'Test', withdrawal_amount: 100, deposit_amount: 0, status: 'paid' },
      ];

      store.enterEditMode();

      expect(store.isEditMode).toBe(true);
    });

    it('does not modify transactions', () => {
      const transaction = {
        id: 1,
        description: 'Original',
        withdrawal_amount: 100,
        deposit_amount: 0,
        status: 'paid',
      };
      const store = useTransactionStore();
      store.transactions = [transaction];

      store.enterEditMode();

      expect(store.transactions).toEqual([transaction]);
    });
  });

  describe('cancelEdit', () => {
    it('sets isEditMode to false', async () => {
      const store = useTransactionStore();
      store.isEditMode = true;
      store.selectedBankAccount = { id: 2, name: 'Checking' };
      store.selectedBudget = { id: 3, name: 'Jan 2025' };

      vi.mocked(transactionApi.getAll).mockResolvedValue([]);
      vi.mocked(budgetApi.getAllocations).mockResolvedValue([]);

      await store.cancelEdit();

      expect(store.isEditMode).toBe(false);
    });

    it('re-fetches transactions from the server', async () => {
      const serverTransactions = [
        { id: 1, description: 'Server', withdrawal_amount: 0, deposit_amount: 0, status: 'paid' },
      ];
      const store = useTransactionStore();
      store.isEditMode = true;
      store.selectedBankAccount = { id: 2, name: 'Checking' };
      store.selectedBudget = { id: 3, name: 'Jan 2025' };
      store.bankAccounts = [{ id: 2, name: 'Checking' }];
      store.budgets = [{ id: 3, name: 'Jan 2025' }];

      vi.mocked(transactionApi.getAll).mockResolvedValue(serverTransactions);
      vi.mocked(budgetApi.getAllocations).mockResolvedValue([]);

      await store.cancelEdit();

      expect(transactionApi.getAll).toHaveBeenCalledWith({ budgetId: 3, bankAccountId: 2 });
      expect(store.transactions).toEqual(serverTransactions);
    });

    it('does nothing if no account/budget selected', async () => {
      const store = useTransactionStore();
      store.isEditMode = true;

      await store.cancelEdit();

      expect(store.isEditMode).toBe(false);
      expect(transactionApi.getAll).not.toHaveBeenCalled();
    });
  });

  describe('addTransaction', () => {
    it('appends a new transaction to transactions', () => {
      const store = useTransactionStore();
      store.selectedBankAccount = { id: 1, name: 'Checking', is_credit_card: false };
      store.transactions = [];

      store.addTransaction();

      expect(store.transactions).toHaveLength(1);
    });

    it('adds new transaction with status "paid" for non-credit-card accounts', () => {
      const store = useTransactionStore();
      store.selectedBankAccount = { id: 1, name: 'Checking', is_credit_card: false };

      store.addTransaction();

      expect(store.transactions[0].status).toBe('paid');
    });

    it('adds new transaction with status "unpaid" for credit card accounts', () => {
      const store = useTransactionStore();
      store.selectedBankAccount = { id: 2, name: 'Credit Card', is_credit_card: true };

      store.addTransaction();

      expect(store.transactions[0].status).toBe('unpaid');
    });

    it('adds new transaction with zero withdrawal and deposit amounts', () => {
      const store = useTransactionStore();
      store.selectedBankAccount = { id: 1, name: 'Checking', is_credit_card: false };

      store.addTransaction();

      expect(store.transactions[0].withdrawal_amount).toBe(0);
      expect(store.transactions[0].deposit_amount).toBe(0);
    });
  });

  describe('deleteTransaction', () => {
    it('sets deleted to true on the transaction', () => {
      const store = useTransactionStore();
      const transaction = {
        id: 1,
        description: 'Groceries',
        withdrawal_amount: 100,
        deposit_amount: 0,
        status: 'paid',
        deleted: false,
      };
      store.transactions = [transaction];

      store.deleteTransaction(store.transactions[0]);

      expect(store.transactions[0].deleted).toBe(true);
    });
  });

  describe('undoDeleteTransaction', () => {
    it('sets deleted to false on the transaction', () => {
      const store = useTransactionStore();
      const transaction = {
        id: 1,
        description: 'Groceries',
        withdrawal_amount: 100,
        deposit_amount: 0,
        status: 'paid',
        deleted: true,
      };
      store.transactions = [transaction];

      store.undoDeleteTransaction(store.transactions[0]);

      expect(store.transactions[0].deleted).toBe(false);
    });
  });

  describe('onAllocationChange', () => {
    it('sets allocation_id on the transaction', () => {
      const store = useTransactionStore();
      const transaction = {
        id: 1,
        description: 'Test',
        withdrawal_amount: 0,
        deposit_amount: 0,
        status: 'unpaid',
      };
      store.transactions = [transaction];

      store.onAllocationChange(store.transactions[0], 5);

      expect(store.transactions[0].allocation_id).toBe(5);
    });

    it('sets status to "paid" when allocationId is greater than 0', () => {
      const store = useTransactionStore();
      const transaction = {
        id: 1,
        description: 'Test',
        withdrawal_amount: 0,
        deposit_amount: 0,
        status: 'unpaid',
      };
      store.transactions = [transaction];

      store.onAllocationChange(store.transactions[0], 3);

      expect(store.transactions[0].status).toBe('paid');
    });

    it('sets status to "unpaid" and clears allocation_id when allocationId is 0', () => {
      const store = useTransactionStore();
      const transaction = {
        id: 1,
        description: 'Test',
        withdrawal_amount: 0,
        deposit_amount: 0,
        status: 'paid',
        allocation_id: 5,
      };
      store.transactions = [transaction];

      store.onAllocationChange(store.transactions[0], 0);

      expect(store.transactions[0].status).toBe('unpaid');
      expect(store.transactions[0].allocation_id).toBeUndefined();
    });

    it('sets status to "unpaid" and clears allocation_id when allocationId is null (show-clear path)', () => {
      const store = useTransactionStore();
      const transaction = {
        id: 1,
        description: 'Test',
        withdrawal_amount: 0,
        deposit_amount: 0,
        status: 'paid',
        allocation_id: 5,
      };
      store.transactions = [transaction];

      store.onAllocationChange(store.transactions[0], null);

      expect(store.transactions[0].status).toBe('unpaid');
      expect(store.transactions[0].allocation_id).toBeUndefined();
    });
  });

  describe('selectedTransactions', () => {
    it('returns only transactions with selected === true', () => {
      const store = useTransactionStore();
      store.transactions = [
        { id: 1, description: 'A', selected: true },
        { id: 2, description: 'B', selected: false },
        { id: 3, description: 'C', selected: true },
        { id: 4, description: 'D' },
      ];

      expect(store.selectedTransactions).toHaveLength(2);
      expect(store.selectedTransactions.map((t) => t.id)).toEqual([1, 3]);
    });

    it('returns empty array when no transactions are selected', () => {
      const store = useTransactionStore();
      store.transactions = [
        { id: 1, description: 'A' },
        { id: 2, description: 'B', selected: false },
      ];

      expect(store.selectedTransactions).toEqual([]);
    });
  });

  describe('selectedTotal', () => {
    it('sums net_amount of selected transactions', () => {
      const store = useTransactionStore();
      store.transactions = [
        { id: 1, net_amount: 5000, selected: true },
        { id: 2, net_amount: -2000, selected: true },
        { id: 3, net_amount: 9999, selected: false },
      ];

      expect(store.selectedTotal).toBe(3000);
    });

    it('returns 0 when no transactions are selected', () => {
      const store = useTransactionStore();
      store.transactions = [{ id: 1, net_amount: 5000 }];

      expect(store.selectedTotal).toBe(0);
    });

    it('computes from withdrawal/deposit amounts when net_amount is missing', () => {
      const store = useTransactionStore();
      store.transactions = [
        { id: 1, withdrawal_amount: 5000, deposit_amount: 0, selected: true },
        { id: 2, withdrawal_amount: 0, deposit_amount: 3000, selected: true },
      ];

      expect(store.selectedTotal).toBe(-2000);
    });

    it('treats fully missing amounts as 0', () => {
      const store = useTransactionStore();
      store.transactions = [
        { id: 1, selected: true },
        { id: 2, net_amount: 3000, selected: true },
      ];

      expect(store.selectedTotal).toBe(3000);
    });
  });

  describe('clearSelections', () => {
    it('sets selected to false on all draft transactions', () => {
      const store = useTransactionStore();
      store.transactions = [
        { id: 1, selected: true },
        { id: 2, selected: true },
        { id: 3, selected: false },
      ];

      store.clearSelections();

      expect(store.transactions.every((t) => t.selected === false)).toBe(true);
    });
  });

  describe('autoAllocate', () => {
    it('calls the API when account is the primary budget account', async () => {
      const store = useTransactionStore();
      mockSettings.primary_budget_account_id = 1;
      store.selectedBankAccount = { id: 1, name: 'Checking', is_credit_card: false };
      store.selectedBudget = { id: 10, name: 'Jan 2025' };
      store.isEditMode = true;
      store.transactions = [
        {
          id: 0,
          description: 'Groceries',
          bank_account_id: 1,
          withdrawal_amount: 5000,
          deposit_amount: 0,
        },
      ];

      vi.mocked(budgetApi.autoAllocate).mockResolvedValue({ suggestions: [] });
      await store.autoAllocate();

      expect(budgetApi.autoAllocate).toHaveBeenCalled();
    });

    it('calls the API when account is a credit card', async () => {
      const store = useTransactionStore();
      mockSettings.primary_budget_account_id = 1;
      store.selectedBankAccount = { id: 5, name: 'Credit Card', is_credit_card: true };
      store.selectedBudget = { id: 10, name: 'Jan 2025' };
      store.isEditMode = true;
      store.transactions = [
        {
          id: 0,
          description: 'Coffee',
          bank_account_id: 5,
          withdrawal_amount: 500,
          deposit_amount: 0,
        },
      ];

      vi.mocked(budgetApi.autoAllocate).mockResolvedValue({ suggestions: [] });
      await store.autoAllocate();

      expect(budgetApi.autoAllocate).toHaveBeenCalled();
    });

    it('does not call the API when account is not primary or credit card', async () => {
      const store = useTransactionStore();
      mockSettings.primary_budget_account_id = 1;
      store.selectedBankAccount = { id: 99, name: 'Savings', is_credit_card: false };
      store.selectedBudget = { id: 10, name: 'Jan 2025' };
      store.isEditMode = true;
      store.transactions = [
        {
          id: 0,
          description: 'Transfer',
          bank_account_id: 99,
          withdrawal_amount: 10000,
          deposit_amount: 0,
        },
      ];

      await store.autoAllocate();

      expect(budgetApi.autoAllocate).not.toHaveBeenCalled();
    });
  });

  describe('currentAndPastBudgets computed', () => {
    it('is wired to useCurrentAndPastBudgets composable and reflects budgets', () => {
      const store = useTransactionStore();
      store.budgets = [
        { id: 1, name: 'Jan 2025', status: 'open' },
        { id: 2, name: 'Dec 2024', status: 'closed' },
      ];

      expect(store.currentAndPastBudgets).toEqual([
        { id: 1, name: 'Jan 2025', status: 'open' },
        { id: 2, name: 'Dec 2024', status: 'closed' },
      ]);
    });
  });
});
