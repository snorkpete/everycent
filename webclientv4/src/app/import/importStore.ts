import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { importApi, buildPreviewPayload } from './importApi';
import { budgetApi } from '../budgets/budgetApi';
import { bankAccountApi } from '../bank-accounts/bankAccountApi';
import type { MatchType } from '../budgets/autoAllocate.types';
import type { BudgetData } from '../budgets/budget.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';
import type { CamtAccountResult } from '../transactions/importers/camt053Parser';
import type {
  PreviewBankAccount,
  ImportTransaction,
  UnmatchedIban,
  SaveResponse,
} from './import.types';

export type ImportPhase = 'idle' | 'parsed' | 'preview' | 'saved';

export interface FileSummaryRow {
  iban: string;
  matchedAccountName: string | null;
  totalTransactions: number;
  inPeriodCount: number;
  outOfPeriodCount: number;
}

export const useImportStore = defineStore('import', () => {
  const budgets = ref<BudgetData[]>([]);
  const bankAccounts = ref<BankAccountData[]>([]);
  const selectedBudget = ref<BudgetData | null>(null);

  const parsedAccounts = ref<CamtAccountResult[]>([]);
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

  const fileSummary = computed<FileSummaryRow[]>(() => {
    return parsedAccounts.value.map((account) => {
      const inPeriod = account.transactions.filter((t) => !t.deleted).length;
      const outOfPeriod = account.transactions.filter((t) => t.deleted).length;
      const matchedBa = account.bankAccountId != null
        ? bankAccounts.value.find((ba) => ba.id === account.bankAccountId)
        : null;

      return {
        iban: account.iban,
        matchedAccountName: matchedBa?.name ?? null,
        totalTransactions: account.transactions.length,
        inPeriodCount: inPeriod,
        outOfPeriodCount: outOfPeriod,
      };
    });
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

  async function parseFile(file: File) {
    if (!selectedBudget.value) {
      error.value = 'No budget selected';
      throw new Error('No budget selected');
    }

    loading.value = true;
    error.value = null;
    phase.value = 'idle';
    parsedAccounts.value = [];
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

      parsedAccounts.value = parseResult.accounts;
      phase.value = 'parsed';
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to process file';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPreview() {
    if (!selectedBudget.value) {
      error.value = 'No budget selected';
      throw new Error('No budget selected');
    }

    const matched = parsedAccounts.value.filter((a) => a.bankAccountId != null);
    const unmatched: UnmatchedIban[] = parsedAccounts.value
      .filter((a) => a.bankAccountId == null)
      .map((a) => ({ iban: a.iban, transactionCount: a.transactions.length }));

    unmatchedIbans.value = unmatched;

    if (matched.length === 0) {
      // Nothing to preview — stay on parsed phase
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const payload = buildPreviewPayload(selectedBudget.value.id!, matched);
      const response = await importApi.preview(payload);
      previewAccounts.value = response.bank_accounts;
      phase.value = 'preview';
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load preview';
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
          transactions: account.transactions.map((t) => ({
              transaction_date: t.transaction_date ?? '',
              description: t.description ?? '',
              withdrawal_amount: t.withdrawal_amount ?? 0,
              deposit_amount: t.deposit_amount ?? 0,
              bank_ref: t.bank_ref ?? '',
              status: t.status ?? 'paid',
              camt_imported: t.camt_imported ?? true,
              deleted: t.deleted ?? false,
              allocation_id: t.allocation_id ?? null,
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
    parsedAccounts.value = [];
    previewAccounts.value = [];
    unmatchedIbans.value = [];
    saveResult.value = null;
    error.value = null;
    phase.value = 'idle';
  }

  async function autoAllocate() {
    if (!selectedBudget.value?.id || previewAccounts.value.length === 0) return;

    // Collect descriptions from all new, non-deleted transactions across all accounts
    const descriptionsWithPositions: { accountIndex: number; txIndex: number; description: string }[] = [];
    for (let ai = 0; ai < previewAccounts.value.length; ai++) {
      const account = previewAccounts.value[ai];
      for (let ti = 0; ti < account.transactions.length; ti++) {
        const tx = account.transactions[ti];
        if (tx.import_status === 'new' && !tx.deleted && tx.description) {
          descriptionsWithPositions.push({ accountIndex: ai, txIndex: ti, description: tx.description });
        }
      }
    }

    if (descriptionsWithPositions.length === 0) return;

    const descriptions = descriptionsWithPositions.map((d) => d.description);
    const response = await budgetApi.autoAllocate(selectedBudget.value.id, descriptions);

    // Apply suggestions back to transactions by position
    for (let i = 0; i < response.suggestions.length; i++) {
      const suggestion = response.suggestions[i];
      if (!suggestion) continue;

      const pos = descriptionsWithPositions[i];
      const tx = previewAccounts.value[pos.accountIndex].transactions[pos.txIndex];
      tx.allocation_id = suggestion.allocation_id;
      tx.auto_match_type = suggestion.match_type as MatchType;
      tx.auto_allocation_name = suggestion.allocation_name;
    }
  }

  function getBankAccountName(bankAccountId: number): string {
    return bankAccounts.value.find((ba) => ba.id === bankAccountId)?.name ?? 'Unknown Account';
  }

  return {
    budgets,
    bankAccounts,
    selectedBudget,
    parsedAccounts,
    previewAccounts,
    unmatchedIbans,
    saveResult,
    loading,
    error,
    phase,
    budgetsForDropdown,
    isBudgetCurrent,
    fileSummary,
    fetchMetadata,
    selectBudget,
    parseFile,
    fetchPreview,
    toggleDeleteTransaction,
    saveImport,
    resetPreview,
    autoAllocate,
    getBankAccountName,
  };
});
