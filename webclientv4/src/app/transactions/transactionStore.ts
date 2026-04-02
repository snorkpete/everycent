import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { transactionApi } from './transactionApi';
import { budgetApi } from '../budgets/budgetApi';
import { bankAccountApi } from '../bank-accounts/bankAccountApi';
import { useCurrentAndPastBudgets } from '../budgets/useCurrentAndPastBudgets';
import type { TransactionData, AllocationData, SinkFundAllocationData } from './transaction.types';
import type { MatchType } from '../budgets/autoAllocate.types';
import type { BudgetData } from '../budgets/budget.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';
import { useSettingsStore } from '../settings/settingsStore';

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref<TransactionData[]>([]);
  const isEditMode = ref(false);
  const allocations = ref<AllocationData[]>([]);
  const sinkFundAllocations = ref<SinkFundAllocationData[]>([]);
  const { budgets, currentAndPastBudgets, fetchBudgets } = useCurrentAndPastBudgets();
  const bankAccounts = ref<BankAccountData[]>([]);
  const selectedBankAccount = ref<BankAccountData | null>(null);
  const selectedBudget = ref<BudgetData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchMetadata() {
    loading.value = true;
    error.value = null;
    try {
      const [, loadedAccounts] = await Promise.all([fetchBudgets(), bankAccountApi.getOpen()]);
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
        transactions: transactionsToSave
          .filter((t) => !t.deleted)
          .map((t) => {
            const { newlyImported, selected, ...rest } = t;
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
    isEditMode.value = true;
  }

  function exitEditMode() {
    isEditMode.value = false;
  }

  async function cancelEdit() {
    isEditMode.value = false;
    if (selectedBankAccount.value && selectedBudget.value) {
      await fetch({
        budgetId: selectedBudget.value.id!,
        bankAccountId: selectedBankAccount.value.id!,
      });
    }
  }

  function addTransaction() {
    const status = selectedBankAccount.value?.is_credit_card ? 'unpaid' : 'paid';
    transactions.value.push({ withdrawal_amount: 0, deposit_amount: 0, status });
  }

  function deleteTransaction(transaction: TransactionData) {
    transaction.deleted = true;
  }

  function undoDeleteTransaction(transaction: TransactionData) {
    transaction.deleted = false;
  }

  function onAllocationChange(transaction: TransactionData, allocationId: number) {
    transaction.allocation_id = allocationId;
    transaction.status = allocationId > 0 ? 'paid' : 'unpaid';
  }

  function isAutoAllocateEligible(): boolean {
    const account = selectedBankAccount.value;
    if (!account) return false;
    if (account.is_credit_card) return true;
    const settingsStore = useSettingsStore();
    return account.id === settingsStore.settings.primary_budget_account_id;
  }

  async function autoAllocate() {
    if (!selectedBudget.value?.id) return;
    if (!isAutoAllocateEligible()) return;

    // Only suggest for unallocated, non-deleted transactions
    const candidates = transactions.value
      .map((tx, index) => ({ tx, index }))
      .filter(({ tx }) => !tx.allocation_id && !tx.deleted && tx.description);

    if (candidates.length === 0) return;

    const descriptions = candidates.map(({ tx }) => tx.description!);
    const response = await budgetApi.autoAllocate(selectedBudget.value.id, descriptions);

    for (let i = 0; i < response.suggestions.length; i++) {
      const suggestion = response.suggestions[i];
      if (!suggestion) continue;

      const candidate = candidates[i];
      if (!candidate) continue;
      const tx = transactions.value[candidate.index];
      if (!tx) continue;
      tx.allocation_id = suggestion.allocation_id;
      tx.auto_match_type = suggestion.match_type as MatchType;
    }
  }

  function addImportedTransactions(imported: TransactionData[]) {
    if (!isEditMode.value) {
      enterEditMode();
    }
    transactions.value.push(...imported.map((t) => ({ ...t, newlyImported: true })));
  }

  const selectedTransactions = computed(() => transactions.value.filter((t) => t.selected));

  const selectedTotal = computed(() =>
    selectedTransactions.value.reduce((sum, t) => {
      const amount = t.net_amount ?? (t.deposit_amount ?? 0) - (t.withdrawal_amount ?? 0);
      return sum + amount;
    }, 0),
  );

  function clearSelections() {
    transactions.value.forEach((t) => {
      t.selected = false;
    });
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
    isEditMode,
    allocations,
    sinkFundAllocations,
    budgets,
    bankAccounts,
    selectedBankAccount,
    selectedBudget,
    loading,
    error,
    currentAndPastBudgets,
    fetchMetadata,
    fetch,
    save,
    refresh,
    enterEditMode,
    exitEditMode,
    cancelEdit,
    addTransaction,
    deleteTransaction,
    undoDeleteTransaction,
    onAllocationChange,
    selectedTransactions,
    selectedTotal,
    clearSelections,
    addImportedTransactions,
    autoAllocate,
  };
});
