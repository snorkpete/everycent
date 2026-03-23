import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { importApi, buildPreviewPayload } from './importApi';
import { budgetApi } from '../budgets/budgetApi';
import { bankAccountApi } from '../bank-accounts/bankAccountApi';
import type { BudgetData } from '../budgets/budget.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';
import type { CamtAccountResult } from '../transactions/importers/camt053Parser';
import type {
  PreviewBankAccount,
  ImportTransaction,
  UnmatchedIban,
  SaveResponse,
} from './import.types';

export type ImportPhase = 'idle' | 'preview' | 'saved';

export const useImportStore = defineStore('import', () => {
  const budgets = ref<BudgetData[]>([]);
  const bankAccounts = ref<BankAccountData[]>([]);
  const selectedBudget = ref<BudgetData | null>(null);

  const previewAccounts = ref<PreviewBankAccount[]>([]);
  const unmatchedIbans = ref<UnmatchedIban[]>([]);
  const saveResult = ref<SaveResponse | null>(null);

  const loading = ref(false);
  const error = ref<string | null>(null);
  const phase = ref<ImportPhase>('idle');

  const budgetsForDropdown = computed(() => {
    const open = budgets.value.filter((b) => b.status === 'open');
    const closed = budgets.value.filter((b) => b.status !== 'open');
    return [...open, ...closed];
  });

  const isBudgetCurrent = computed(() => {
    return selectedBudget.value?.status === 'open';
  });

  const confirmableTransactions = computed(() => {
    return previewAccounts.value.map((account) => ({
      ...account,
      transactions: account.transactions.filter(
        (t) => t.import_status !== 'duplicate' && !t.deleted,
      ),
    }));
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
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function selectBudget(budgetId: number) {
    selectedBudget.value = budgets.value.find((b) => b.id === budgetId) ?? null;
  }

  async function parseAndPreview(file: File) {
    if (!selectedBudget.value) {
      error.value = 'No budget selected';
      throw new Error('No budget selected');
    }

    loading.value = true;
    error.value = null;
    phase.value = 'idle';
    previewAccounts.value = [];
    unmatchedIbans.value = [];
    saveResult.value = null;

    try {
      const { parseCamt053Zip } = await import('../transactions/importers/camt053Parser');

      const parseResult = await parseCamt053Zip({
        file,
        bankAccounts: bankAccounts.value
          .filter((ba) => ba.id != null && ba.account_no != null)
          .map((ba) => ({
            id: ba.id!,
            accountNo: ba.account_no!,
            accountType: ba.account_type ?? '',
          })),
        startDate: selectedBudget.value.start_date ?? '',
        endDate: selectedBudget.value.end_date ?? '',
      });

      // Separate matched vs unmatched accounts
      const matched: CamtAccountResult[] = [];
      const unmatched: UnmatchedIban[] = [];
      for (const account of parseResult.accounts) {
        if (account.bankAccountId != null) {
          matched.push(account);
        } else {
          unmatched.push({
            iban: account.iban,
            transactionCount: account.transactions.length,
          });
        }
      }
      unmatchedIbans.value = unmatched;

      // Call preview endpoint
      const payload = buildPreviewPayload(selectedBudget.value.id!, matched);
      const response = await importApi.preview(payload);

      // Enrich preview accounts with bank account names
      previewAccounts.value = response.bank_accounts;
      phase.value = 'preview';
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to process file';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function toggleDeleteTransaction(accountIndex: number, transactionIndex: number) {
    const account = previewAccounts.value[accountIndex];
    if (!account) return;
    const transaction = account.transactions[transactionIndex];
    if (!transaction) return;
    transaction.deleted = !transaction.deleted;
  }

  async function saveImport() {
    if (!selectedBudget.value) {
      error.value = 'No budget selected';
      throw new Error('No budget selected');
    }

    loading.value = true;
    error.value = null;

    try {
      const payload = {
        budget_id: selectedBudget.value.id!,
        bank_accounts: previewAccounts.value.map((account) => ({
          bank_account_id: account.bank_account_id,
          iban: bankAccounts.value.find((ba) => ba.id === account.bank_account_id)?.account_no ?? '',
          transactions: account.transactions
            .filter((t) => t.import_status !== 'duplicate' && !t.deleted)
            .map((t) => ({
              transaction_date: t.transaction_date ?? '',
              description: t.description ?? '',
              withdrawal_amount: t.withdrawal_amount ?? 0,
              deposit_amount: t.deposit_amount ?? 0,
              bank_ref: t.bank_ref ?? '',
              status: t.status ?? 'paid',
            })),
        })),
      };

      const response = await importApi.save(payload);
      saveResult.value = response;
      phase.value = 'saved';
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to save import';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function resetPreview() {
    previewAccounts.value = [];
    unmatchedIbans.value = [];
    saveResult.value = null;
    error.value = null;
    phase.value = 'idle';
  }

  function getBankAccountName(bankAccountId: number): string {
    return bankAccounts.value.find((ba) => ba.id === bankAccountId)?.name ?? 'Unknown Account';
  }

  return {
    budgets,
    bankAccounts,
    selectedBudget,
    previewAccounts,
    unmatchedIbans,
    saveResult,
    loading,
    error,
    phase,
    budgetsForDropdown,
    isBudgetCurrent,
    confirmableTransactions,
    fetchMetadata,
    selectBudget,
    parseAndPreview,
    toggleDeleteTransaction,
    saveImport,
    resetPreview,
    getBankAccountName,
  };
});
