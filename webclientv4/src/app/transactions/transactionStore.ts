import { ref, computed, toRaw } from 'vue';
import { defineStore } from 'pinia';
import { transactionApi } from './transactionApi';
import { budgetApi } from '../budgets/budgetApi';
import { bankAccountApi } from '../bank-accounts/bankAccountApi';
import type { TransactionData, AllocationData, SinkFundAllocationData } from './transaction.types';
import type { BudgetData } from '../budgets/budget.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref<TransactionData[]>([]);
  const draftTransactions = ref<TransactionData[]>([]);
  const isEditMode = ref(false);
  const allocations = ref<AllocationData[]>([]);
  const sinkFundAllocations = ref<SinkFundAllocationData[]>([]);
  const budgets = ref<BudgetData[]>([]);
  const bankAccounts = ref<BankAccountData[]>([]);
  const selectedBankAccount = ref<BankAccountData | null>(null);
  const selectedBudget = ref<BudgetData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const budgetsForDropdown = computed(() => {
    const openBudgets = budgets.value.filter((b) => b.status === 'open');
    const closedBudgets = budgets.value.filter((b) => b.status !== 'open');
    return [...openBudgets.slice().reverse(), ...closedBudgets];
  });

  async function fetchMetadata() {
    loading.value = true;
    error.value = null;
    try {
      const [loadedBudgets, loadedAccounts] = await Promise.all([
        budgetApi.getAll(),
        bankAccountApi.getOpen(),
      ]);
      budgets.value = loadedBudgets;
      bankAccounts.value = loadedAccounts;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load metadata';
    } finally {
      loading.value = false;
    }
  }

  async function fetch(params: { budgetId: number; bankAccountId: number }) {
    loading.value = true;
    error.value = null;
    sinkFundAllocations.value = [];
    try {
      const account = bankAccounts.value.find((a) => a.id === params.bankAccountId) ?? null;
      const budget = budgets.value.find((b) => b.id === params.budgetId) ?? null;

      selectedBankAccount.value = account;
      selectedBudget.value = budget;

      const promises: Promise<unknown>[] = [
        transactionApi.getAll(params).then((data) => {
          transactions.value = data;
        }),
        budgetApi.getAllocations(params.budgetId).then((data) => {
          allocations.value = data;
        }),
      ];

      if (account?.is_sink_fund) {
        promises.push(
          transactionApi.getSinkFundAllocations(params.bankAccountId).then((data) => {
            sinkFundAllocations.value = data;
          }),
        );
      }

      await Promise.all(promises);
      draftTransactions.value = structuredClone(toRaw(transactions.value));
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load transactions';
    } finally {
      loading.value = false;
    }
  }

  async function save(transactionsToSave: TransactionData[]) {
    if (!selectedBankAccount.value || !selectedBudget.value) {
      return;
    }

    loading.value = true;
    error.value = null;
    try {
      await transactionApi.save({
        bankAccountId: selectedBankAccount.value.id!,
        budgetId: selectedBudget.value.id!,
        transactions: transactionsToSave.filter((t) => !t.deleted).map((t) => {
          const { newlyImported: _, selected: __, ...rest } = t;
          return rest;
        }),
      });
      await fetch({
        budgetId: selectedBudget.value.id!,
        bankAccountId: selectedBankAccount.value.id!,
      });
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to save transactions';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function enterEditMode() {
    draftTransactions.value = structuredClone(toRaw(transactions.value));
    isEditMode.value = true;
  }

  function exitEditMode() {
    isEditMode.value = false;
  }

  function cancelEdit() {
    draftTransactions.value = structuredClone(toRaw(transactions.value));
    isEditMode.value = false;
  }

  function addTransaction() {
    const status = selectedBankAccount.value?.is_credit_card ? 'unpaid' : 'paid';
    draftTransactions.value.push({ withdrawal_amount: 0, deposit_amount: 0, status });
  }

  function deleteTransaction(transaction: TransactionData) {
    transaction.deleted = true;
  }

  function onAllocationChange(transaction: TransactionData, allocationId: number) {
    transaction.allocation_id = allocationId;
    transaction.status = allocationId > 0 ? 'paid' : 'unpaid';
  }

  function addImportedTransactions(imported: TransactionData[]) {
    if (!isEditMode.value) {
      enterEditMode();
    }
    draftTransactions.value.push(...imported.map((t) => ({ ...t, newlyImported: true })));
  }

  const selectedTransactions = computed(() =>
    draftTransactions.value.filter((t) => t.selected),
  );

  const selectedTotal = computed(() =>
    selectedTransactions.value.reduce((sum, t) => {
      const amount = t.net_amount ?? (t.deposit_amount ?? 0) - (t.withdrawal_amount ?? 0);
      return sum + amount;
    }, 0),
  );

  function clearSelections() {
    draftTransactions.value.forEach((t) => { t.selected = false; });
  }

  async function refresh() {
    if (!selectedBankAccount.value || !selectedBudget.value) {
      return;
    }
    await fetch({
      budgetId: selectedBudget.value.id!,
      bankAccountId: selectedBankAccount.value.id!,
    });
  }

  return {
    transactions,
    draftTransactions,
    isEditMode,
    allocations,
    sinkFundAllocations,
    budgets,
    bankAccounts,
    selectedBankAccount,
    selectedBudget,
    loading,
    error,
    budgetsForDropdown,
    fetchMetadata,
    fetch,
    save,
    refresh,
    enterEditMode,
    exitEditMode,
    cancelEdit,
    addTransaction,
    deleteTransaction,
    onAllocationChange,
    selectedTransactions,
    selectedTotal,
    clearSelections,
    addImportedTransactions,
  };
});
