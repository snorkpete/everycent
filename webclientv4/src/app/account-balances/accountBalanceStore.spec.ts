import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAccountBalanceStore } from './accountBalanceStore';
import { accountBalanceApi } from './accountBalanceApi';
import type { AccountBalanceData } from './accountBalance.types';

vi.mock('./accountBalanceApi', () => ({
  accountBalanceApi: {
    getAll: vi.fn(),
    adjustBalances: vi.fn(),
  },
}));

const currentAccount: AccountBalanceData = {
  id: 1,
  name: 'Joint Checking',
  account_type: 'checking_account',
  account_category: 'current',
  is_cash: true,
  closing_date: '2026-03-24',
  next_closing_date: '2026-04-24',
  closing_balance: 100000,
  expected_closing_balance: 90000,
  current_balance: 100000,
  asset_bank_account_id: null,
};

const cashAsset: AccountBalanceData = {
  id: 2,
  name: 'Savings',
  account_type: 'savings_account',
  account_category: 'asset',
  is_cash: true,
  closing_date: '2026-03-24',
  next_closing_date: '2026-04-24',
  closing_balance: 200000,
  expected_closing_balance: 200000,
  current_balance: 200000,
  asset_bank_account_id: null,
};

const nonCashAsset: AccountBalanceData = {
  id: 3,
  name: 'Real Estate',
  account_type: 'asset',
  account_category: 'asset',
  is_cash: false,
  closing_date: '2026-03-24',
  next_closing_date: '2026-04-24',
  closing_balance: 500000,
  expected_closing_balance: 500000,
  current_balance: 500000,
  asset_bank_account_id: null,
};

const creditCard: AccountBalanceData = {
  id: 4,
  name: 'Visa Credit',
  account_type: 'credit_card',
  account_category: 'liability',
  is_cash: true,
  closing_date: '2026-03-24',
  next_closing_date: '2026-04-24',
  closing_balance: -30000,
  expected_closing_balance: -25000,
  current_balance: -30000,
  asset_bank_account_id: null,
};

const loan: AccountBalanceData = {
  id: 5,
  name: 'Mortgage',
  account_type: 'normal',
  account_category: 'liability',
  is_cash: false,
  closing_date: '2026-03-24',
  next_closing_date: '2026-04-24',
  closing_balance: -1000000,
  expected_closing_balance: -1000000,
  current_balance: -1000000,
  asset_bank_account_id: null,
};

const allAccounts = [currentAccount, cashAsset, nonCashAsset, creditCard, loan];

describe('accountBalanceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has empty accounts array', () => {
      const store = useAccountBalanceStore();
      expect(store.accounts).toEqual([]);
    });

    it('has includeClosed false', () => {
      const store = useAccountBalanceStore();
      expect(store.includeClosed).toBe(false);
    });

    it('has loading false', () => {
      const store = useAccountBalanceStore();
      expect(store.loading).toBe(false);
    });

    it('has null error', () => {
      const store = useAccountBalanceStore();
      expect(store.error).toBeNull();
    });
  });

  describe('fetch', () => {
    it('calls getAll with includeClosed value', async () => {
      vi.mocked(accountBalanceApi.getAll).mockResolvedValue([]);
      const store = useAccountBalanceStore();

      await store.fetch();

      expect(accountBalanceApi.getAll).toHaveBeenCalledWith(false);
    });

    it('calls getAll with includeClosed=true when toggled', async () => {
      vi.mocked(accountBalanceApi.getAll).mockResolvedValue([]);
      const store = useAccountBalanceStore();
      store.includeClosed = true;

      await store.fetch();

      expect(accountBalanceApi.getAll).toHaveBeenCalledWith(true);
    });

    it('sets accounts from API response', async () => {
      vi.mocked(accountBalanceApi.getAll).mockResolvedValue(allAccounts);
      const store = useAccountBalanceStore();

      await store.fetch();

      expect(store.accounts).toEqual(allAccounts);
    });

    it('sets loading to true while fetching', async () => {
      let resolve: (value: AccountBalanceData[]) => void;
      vi.mocked(accountBalanceApi.getAll).mockImplementation(
        () =>
          new Promise((r) => {
            resolve = r;
          }),
      );
      const store = useAccountBalanceStore();

      const fetchPromise = store.fetch();
      expect(store.loading).toBe(true);

      resolve!([]);
      await fetchPromise;
      expect(store.loading).toBe(false);
    });

    it('sets error and re-throws on failure', async () => {
      const apiError = new Error('Network error');
      vi.mocked(accountBalanceApi.getAll).mockRejectedValue(apiError);
      const store = useAccountBalanceStore();

      await expect(store.fetch()).rejects.toThrow('Network error');
      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });

    it('clears error before fetching', async () => {
      vi.mocked(accountBalanceApi.getAll).mockRejectedValueOnce(new Error('First error'));
      const store = useAccountBalanceStore();

      await expect(store.fetch()).rejects.toThrow();
      expect(store.error).toBe('First error');

      vi.mocked(accountBalanceApi.getAll).mockResolvedValue([]);
      await store.fetch();
      expect(store.error).toBeNull();
    });
  });

  describe('adjustBalances', () => {
    it('filters out unchanged adjustments before posting', async () => {
      vi.mocked(accountBalanceApi.adjustBalances).mockResolvedValue({ success: true });
      vi.mocked(accountBalanceApi.getAll).mockResolvedValue([]);
      const store = useAccountBalanceStore();

      await store.adjustBalances([
        { bank_account_id: 1, new_balance: 100000, currentBalance: 100000 }, // unchanged
        { bank_account_id: 2, new_balance: 250000, currentBalance: 200000 }, // changed
      ]);

      expect(accountBalanceApi.adjustBalances).toHaveBeenCalledWith([
        { bank_account_id: 2, new_balance: 250000, currentBalance: 200000 },
      ]);
    });

    it('does nothing when all adjustments are unchanged', async () => {
      const store = useAccountBalanceStore();

      await store.adjustBalances([
        { bank_account_id: 1, new_balance: 100000, currentBalance: 100000 },
      ]);

      expect(accountBalanceApi.adjustBalances).not.toHaveBeenCalled();
    });

    it('re-fetches accounts on success', async () => {
      vi.mocked(accountBalanceApi.adjustBalances).mockResolvedValue({ success: true });
      vi.mocked(accountBalanceApi.getAll).mockResolvedValue(allAccounts);
      const store = useAccountBalanceStore();

      await store.adjustBalances([
        { bank_account_id: 1, new_balance: 110000, currentBalance: 100000 },
      ]);

      expect(accountBalanceApi.getAll).toHaveBeenCalled();
    });

    it('sets error and re-throws on failure', async () => {
      const apiError = new Error('Adjust failed');
      vi.mocked(accountBalanceApi.adjustBalances).mockRejectedValue(apiError);
      const store = useAccountBalanceStore();

      await expect(
        store.adjustBalances([{ bank_account_id: 1, new_balance: 110000, currentBalance: 100000 }]),
      ).rejects.toThrow('Adjust failed');
      expect(store.error).toBe('Adjust failed');
    });
  });

  describe('computed categories', () => {
    beforeEach(async () => {
      vi.mocked(accountBalanceApi.getAll).mockResolvedValue(allAccounts);
      const store = useAccountBalanceStore();
      await store.fetch();
      return store;
    });

    it('currentAccounts filters by account_category === current', async () => {
      const store = useAccountBalanceStore();
      expect(store.currentAccounts).toEqual([currentAccount]);
    });

    it('cashAssetAccounts filters by asset + is_cash', async () => {
      const store = useAccountBalanceStore();
      expect(store.cashAssetAccounts).toEqual([cashAsset]);
    });

    it('physicalAssetAccounts filters by asset + !is_cash', async () => {
      const store = useAccountBalanceStore();
      expect(store.physicalAssetAccounts).toEqual([nonCashAsset]);
    });

    it('creditCardAccounts filters by liability + is_cash', async () => {
      const store = useAccountBalanceStore();
      expect(store.creditCardAccounts).toEqual([creditCard]);
    });

    it('loanAccounts filters by liability + !is_cash', async () => {
      const store = useAccountBalanceStore();
      expect(store.loanAccounts).toEqual([loan]);
    });
  });

  describe('computed totals', () => {
    beforeEach(async () => {
      vi.mocked(accountBalanceApi.getAll).mockResolvedValue(allAccounts);
      const store = useAccountBalanceStore();
      await store.fetch();
      return store;
    });

    it('totalAssets sums current_balance for assets', async () => {
      const store = useAccountBalanceStore();
      // cashAsset(200000) + nonCashAsset(500000)
      expect(store.totalAssets).toBe(700000);
    });

    it('totalLiabilities sums current_balance for liabilities', async () => {
      const store = useAccountBalanceStore();
      // creditCard(-30000) + loan(-1000000)
      expect(store.totalLiabilities).toBe(-1030000);
    });

    it('netCurrentCash sums current accounts and cash liabilities', async () => {
      const store = useAccountBalanceStore();
      // current(100000) + creditCard(-30000)
      expect(store.netCurrentCash).toBe(70000);
    });

    it('netCashAssets sums asset + is_cash', async () => {
      const store = useAccountBalanceStore();
      // cashAsset(200000)
      expect(store.netCashAssets).toBe(200000);
    });

    it('netNonCashAssets sums (asset or liability) where !is_cash', async () => {
      const store = useAccountBalanceStore();
      // nonCashAsset(500000) + loan(-1000000)
      expect(store.netNonCashAssets).toBe(-500000);
    });

    it('netWorth sums all accounts', async () => {
      const store = useAccountBalanceStore();
      // 100000 + 200000 + 500000 + (-30000) + (-1000000) = -230000
      expect(store.netWorth).toBe(-230000);
    });
  });

  describe('nested loan totals', () => {
    // House asset with one nested loan (loan is excluded from top-level by backend)
    const house: AccountBalanceData = {
      id: 10,
      name: 'House',
      account_type: 'normal',
      account_category: 'asset',
      is_cash: false,
      closing_date: '2026-03-24',
      next_closing_date: '2026-04-24',
      closing_balance: 500000,
      expected_closing_balance: 500000,
      current_balance: 500000,
      asset_bank_account_id: null,
      loans: [
        {
          id: 11,
          name: 'Mortgage',
          account_type: 'normal',
          account_category: 'liability',
          is_cash: false,
          closing_date: '2026-03-24',
          next_closing_date: '2026-04-24',
          closing_balance: -300000,
          expected_closing_balance: -300000,
          current_balance: -300000,
          asset_bank_account_id: 10,
        },
      ],
    };

    beforeEach(async () => {
      vi.mocked(accountBalanceApi.getAll).mockResolvedValue([house]);
      const store = useAccountBalanceStore();
      await store.fetch();
    });

    it('includes nested loan balances in totalLiabilities', () => {
      const store = useAccountBalanceStore();
      expect(store.totalLiabilities).toBe(-300000);
    });

    it('includes nested loan balances in netNonCashAssets', () => {
      const store = useAccountBalanceStore();
      // house(500000) + mortgage(-300000) = 200000
      expect(store.netNonCashAssets).toBe(200000);
    });

    it('includes nested loan balances in netWorth', () => {
      const store = useAccountBalanceStore();
      // house(500000) + mortgage(-300000) = 200000
      expect(store.netWorth).toBe(200000);
    });

    it('totalAssets remains only asset-category accounts', () => {
      const store = useAccountBalanceStore();
      expect(store.totalAssets).toBe(500000);
    });
  });
});
