import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { accountBalanceApi } from './accountBalanceApi';
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

  const nonCashAssetAccounts = computed(() =>
    accounts.value.filter((a) => a.account_category === 'asset' && !a.is_cash),
  );

  const creditCardAccounts = computed(() =>
    accounts.value.filter((a) => a.account_category === 'liability' && a.is_cash),
  );

  const loanAccounts = computed(() =>
    accounts.value.filter((a) => a.account_category === 'liability' && !a.is_cash),
  );

  // Summary totals
  const totalAssets = computed(() =>
    accounts.value
      .filter((a) => a.account_category === 'asset')
      .reduce((sum, a) => sum + a.current_balance, 0),
  );

  const totalLiabilities = computed(() =>
    accounts.value
      .filter((a) => a.account_category === 'liability')
      .reduce((sum, a) => sum + a.current_balance, 0),
  );

  const netCurrentCash = computed(() =>
    accounts.value
      .filter(
        (a) =>
          a.account_category === 'current' || (a.account_category === 'liability' && a.is_cash),
      )
      .reduce((sum, a) => sum + a.current_balance, 0),
  );

  const netCashAssets = computed(() =>
    accounts.value
      .filter((a) => a.account_category === 'asset' && a.is_cash)
      .reduce((sum, a) => sum + a.current_balance, 0),
  );

  const netNonCashAssets = computed(() =>
    accounts.value
      .filter(
        (a) => (a.account_category === 'asset' || a.account_category === 'liability') && !a.is_cash,
      )
      .reduce((sum, a) => sum + a.current_balance, 0),
  );

  const netWorth = computed(() => accounts.value.reduce((sum, a) => sum + a.current_balance, 0));

  return {
    accounts,
    includeClosed,
    loading,
    error,
    fetch,
    adjustBalances,
    currentAccounts,
    cashAssetAccounts,
    nonCashAssetAccounts,
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
