import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import type { VueWrapper } from '@vue/test-utils';
import AccountBalancesPage from './AccountBalancesPage.vue';
import type { AccountBalanceData } from './accountBalance.types';

// Selectors
const INCLUDE_CLOSED_TOGGLE = '[data-testid="include-closed-toggle"]';
const ADJUST_BALANCES_BTN = '[data-testid="adjust-balances-btn"]';
const CURRENT_ACCOUNTS_TABLE = '[data-testid="current-accounts-table"]';
const CASH_ASSETS_TABLE = '[data-testid="cash-assets-table"]';
const NON_CASH_ASSETS_TABLE = '[data-testid="non-cash-assets-table"]';
const CREDIT_CARDS_TABLE = '[data-testid="credit-cards-table"]';
const LOANS_TABLE = '[data-testid="loans-table"]';

const mockSetHeading = vi.fn();
vi.mock('../toolbar/headingStore', () => ({
  useHeadingStore: () => ({ setHeading: mockSetHeading }),
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
};

const creditCardAccount: AccountBalanceData = {
  id: 2,
  name: 'Amro Credit Card',
  account_type: 'credit_card',
  account_category: 'liability',
  is_cash: true,
  closing_date: '2026-03-24',
  next_closing_date: '2026-04-24',
  closing_balance: 0,
  expected_closing_balance: 0,
  current_balance: 0,
};

const mockStore = reactive({
  accounts: [currentAccount] as AccountBalanceData[],
  includeClosed: false,
  loading: false,
  error: null as string | null,
  currentAccounts: [currentAccount] as AccountBalanceData[],
  cashAssetAccounts: [] as AccountBalanceData[],
  nonCashAssetAccounts: [] as AccountBalanceData[],
  creditCardAccounts: [] as AccountBalanceData[],
  loanAccounts: [] as AccountBalanceData[],
  totalAssets: 0,
  totalLiabilities: 0,
  netCurrentCash: 100000,
  netCashAssets: 0,
  netNonCashAssets: 0,
  netWorth: 100000,
  fetch: vi.fn().mockResolvedValue(undefined),
  adjustBalances: vi.fn().mockResolvedValue(undefined),
});

vi.mock('./accountBalanceStore', () => ({
  useAccountBalanceStore: () => mockStore,
}));

const ToggleSwitchStub = {
  name: 'ToggleSwitch',
  template:
    '<button :data-testid="$attrs[\'data-testid\']" @click="$emit(\'update:modelValue\', !modelValue)" />',
  props: ['modelValue'],
  emits: ['update:modelValue'],
};

const CategoryTableStub = {
  name: 'AccountCategoryTable',
  template: '<div :data-testid="$attrs[\'data-testid\']" />',
  props: ['heading', 'accounts'],
};

const AdjustDialogStub = {
  name: 'AdjustBalancesDialog',
  template: '<div data-testid="adjust-dialog" />',
  props: ['visible', 'accounts'],
  emits: ['update:visible'],
};

const SummaryStripStub = {
  name: 'AccountBalanceSummaryStrip',
  template: '<div data-testid="account-balance-summary-strip" />',
};

function createWrapper(): VueWrapper {
  return mount(AccountBalancesPage, {
    global: {
      plugins: [PrimeVue, createPinia()],
      stubs: {
        ToggleSwitch: ToggleSwitchStub,
        AccountCategoryTable: CategoryTableStub,
        AdjustBalancesDialog: AdjustDialogStub,
        AccountBalanceSummaryStrip: SummaryStripStub,
      },
    },
  });
}

describe('AccountBalancesPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.loading = false;
    mockStore.error = null;
    mockStore.accounts = [currentAccount];
    mockStore.currentAccounts = [currentAccount];
    mockStore.cashAssetAccounts = [];
    mockStore.nonCashAssetAccounts = [];
    mockStore.creditCardAccounts = [];
    mockStore.loanAccounts = [];
    mockStore.totalAssets = 0;
    mockStore.totalLiabilities = 0;
    mockStore.netCurrentCash = 100000;
    mockStore.netCashAssets = 0;
    mockStore.netNonCashAssets = 0;
    mockStore.netWorth = 100000;
    mockStore.includeClosed = false;
    mockStore.fetch.mockResolvedValue(undefined);
  });

  describe('on mount', () => {
    it('sets the page heading to "Account Balances"', async () => {
      createWrapper();
      await nextTick();

      expect(mockSetHeading).toHaveBeenCalledWith('Account Balances');
    });

    it('calls store.fetch on mount', async () => {
      createWrapper();
      await nextTick();

      expect(mockStore.fetch).toHaveBeenCalled();
    });
  });

  describe('layout', () => {
    it('renders include closed accounts toggle', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(INCLUDE_CLOSED_TOGGLE).exists()).toBe(true);
    });

    it('renders Adjust Account Balances button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(ADJUST_BALANCES_BTN).exists()).toBe(true);
    });

    it('renders summary strip', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="account-balance-summary-strip"]').exists()).toBe(true);
    });

    it('hides summary strip when loading', () => {
      mockStore.loading = true;
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="account-balance-summary-strip"]').exists()).toBe(false);
    });

    it('hides summary strip when error', () => {
      mockStore.error = 'Failed';
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="account-balance-summary-strip"]').exists()).toBe(false);
    });

    it('renders category tables that have accounts', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(CURRENT_ACCOUNTS_TABLE).exists()).toBe(true);
    });

    it('hides category tables with no accounts', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(CASH_ASSETS_TABLE).exists()).toBe(false);
      expect(wrapper.find(NON_CASH_ASSETS_TABLE).exists()).toBe(false);
      expect(wrapper.find(CREDIT_CARDS_TABLE).exists()).toBe(false);
      expect(wrapper.find(LOANS_TABLE).exists()).toBe(false);
    });

    it('shows category tables when accounts are populated', () => {
      mockStore.creditCardAccounts = [creditCardAccount];
      const wrapper = createWrapper();

      expect(wrapper.find(CREDIT_CARDS_TABLE).exists()).toBe(true);
    });
  });

  describe('category table props', () => {
    it('passes currentAccounts to Current Accounts table', () => {
      const wrapper = createWrapper();

      const tables = wrapper.findAllComponents({ name: 'AccountCategoryTable' });
      expect(tables[0].props('heading')).toBe('Current Accounts');
      expect(tables[0].props('accounts')).toEqual([currentAccount]);
    });
  });

  describe('loading state', () => {
    it('shows loading message when loading', () => {
      mockStore.loading = true;
      const wrapper = createWrapper();

      expect(wrapper.find('.loading-message').exists()).toBe(true);
      expect(wrapper.find('.loading-message').text()).toBe('Loading...');
    });

    it('hides content when loading', () => {
      mockStore.loading = true;
      const wrapper = createWrapper();

      expect(wrapper.find(CURRENT_ACCOUNTS_TABLE).exists()).toBe(false);
    });
  });

  describe('error state', () => {
    it('shows error message when error is set', () => {
      mockStore.error = 'Failed to load';
      const wrapper = createWrapper();

      expect(wrapper.find('.error-message').exists()).toBe(true);
      expect(wrapper.find('.error-message').text()).toBe('Failed to load');
    });
  });

  describe('toolbar — include closed toggle', () => {
    it('calls store.fetch when toggle is changed', async () => {
      const wrapper = createWrapper();
      vi.clearAllMocks();

      await wrapper.find(INCLUDE_CLOSED_TOGGLE).trigger('click');
      await nextTick();

      expect(mockStore.fetch).toHaveBeenCalled();
    });
  });

  describe('toolbar — adjust balances button', () => {
    it('opens adjust balances dialog when button is clicked', async () => {
      const wrapper = createWrapper();

      const dialog = wrapper.findComponent({ name: 'AdjustBalancesDialog' });
      expect(dialog.props('visible')).toBe(false);

      await wrapper.find(ADJUST_BALANCES_BTN).trigger('click');
      await nextTick();

      expect(dialog.props('visible')).toBe(true);
    });

    it('passes store.accounts to adjust balances dialog', () => {
      const wrapper = createWrapper();

      const dialog = wrapper.findComponent({ name: 'AdjustBalancesDialog' });
      expect(dialog.props('accounts')).toEqual([currentAccount]);
    });

    it('closes adjust balances dialog when update:visible emits false', async () => {
      const wrapper = createWrapper();
      await wrapper.find(ADJUST_BALANCES_BTN).trigger('click');
      await nextTick();

      const dialog = wrapper.findComponent({ name: 'AdjustBalancesDialog' });
      await dialog.vm.$emit('update:visible', false);
      await nextTick();

      expect(dialog.props('visible')).toBe(false);
    });
  });
});
