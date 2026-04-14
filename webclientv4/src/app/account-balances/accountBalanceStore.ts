import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { accountBalanceApi } from './accountBalanceApi';
import { useReadyStatus } from '../shared/composables/useReadyStatus';
import type { AccountBalanceData, BalanceAdjustmentData } from './accountBalance.types';

export const useAccountBalanceStore = defineStore('accountBalance', () => {
  const accounts = ref<AccountBalanceData[]>([]);
  const includeClosed = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetch() {
    loading.value = true;
    error.value = null;
    try {
      accounts.value = await accountBalanceApi.getAll(includeClosed.value);
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load account balances';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function adjustBalances(adjustments: BalanceAdjustmentData[]) {
    const changed = adjustments.filter((a) => a.new_balance !== a.currentBalance);
    if (changed.length === 0) return;

    loading.value = true;
    error.value = null;
    try {
      await accountBalanceApi.adjustBalances(changed);
      await fetch();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to adjust balances';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // Category computeds
  const currentAccounts = computed(() =>
    accounts.value.filter((a) => a.account_category === 'current'),
  );

  const cashAssetAccounts = computed(() =>
    accounts.value.filter((a) => a.account_category === 'asset' && a.is_cash),
  );

  const physicalAssetAccounts = computed(() =>
    accounts.value.filter((a) => a.account_category === 'asset' && !a.is_cash),
  );

  const creditCardAccounts = computed(() =>
    accounts.value.filter((a) => a.account_category === 'liability' && a.is_cash),
  );

  const loanAccounts = computed(() =>
    accounts.value.filter((a) => a.account_category === 'liability' && !a.is_cash),
  );

  // Flatten top-level accounts + nested loans so totals include loan balances
  // that the backend has nested under their parent asset. Only flattens one
  // level: nested loans do not themselves carry a loans array.
  const flatAccounts = computed<AccountBalanceData[]>(() =>
    accounts.value.flatMap((a) => [a, ...(a.loans ?? [])]),
  );

  // Summary totals
  const totalAssets = computed(() =>
    flatAccounts.value
      .filter((a) => a.account_category === 'asset')
      .reduce((sum, a) => sum + a.current_balance, 0),
  );

  const totalLiabilities = computed(() =>
    flatAccounts.value
      .filter((a) => a.account_category === 'liability')
      .reduce((sum, a) => sum + a.current_balance, 0),
  );

  const netCurrentCash = computed(() =>
    flatAccounts.value
      .filter(
        (a) =>
          a.account_category === 'current' || (a.account_category === 'liability' && a.is_cash),
      )
      .reduce((sum, a) => sum + a.current_balance, 0),
  );

  const netCashAssets = computed(() =>
    flatAccounts.value
      .filter((a) => a.account_category === 'asset' && a.is_cash)
      .reduce((sum, a) => sum + a.current_balance, 0),
  );

  const netNonCashAssets = computed(() =>
    flatAccounts.value
      .filter(
        (a) => (a.account_category === 'asset' || a.account_category === 'liability') && !a.is_cash,
      )
      .reduce((sum, a) => sum + a.current_balance, 0),
  );

  const netWorth = computed(() =>
    flatAccounts.value.reduce((sum, a) => sum + a.current_balance, 0),
  );

  const ready = useReadyStatus({ loading, error });

  return {
    accounts,
    includeClosed,
    loading,
    error,
    ready,
    fetch,
    adjustBalances,
    currentAccounts,
    cashAssetAccounts,
    physicalAssetAccounts,
    creditCardAccounts,
    loanAccounts,
    totalAssets,
    totalLiabilities,
    netCurrentCash,
    netCashAssets,
    netNonCashAssets,
    netWorth,
  };
});
