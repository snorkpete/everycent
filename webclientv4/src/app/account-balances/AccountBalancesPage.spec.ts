import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import type { Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import type { VueWrapper } from '@vue/test-utils';
import AccountBalancesPage from './AccountBalancesPage.vue';
import { buildAccountBalance } from '../../test/factories/accountBalanceFactory';

// Selectors
const INCLUDE_CLOSED_TOGGLE = '[data-testid="include-closed-toggle"]';
const ADJUST_BALANCES_BTN = '[data-testid="adjust-balances-btn"]';
const DASH_ZERO_TOGGLE = '[data-testid="dash-zero-toggle"]';
const CURRENT_ACCOUNTS_TABLE = '[data-testid="current-accounts-table"]';
const CASH_ASSETS_TABLE = '[data-testid="cash-assets-table"]';
const NON_CASH_ASSETS_TABLE = '[data-testid="non-cash-assets-table"]';
const CREDIT_CARDS_TABLE = '[data-testid="credit-cards-table"]';
const LOANS_TABLE = '[data-testid="loans-table"]';

vi.mock('./accountBalanceApi', () => ({
  accountBalanceApi: {
    getAll: vi.fn(),
    adjustBalances: vi.fn(),
  },
}));

const mockSetHeading = vi.fn();
vi.mock('../toolbar/headingStore', () => ({
  useHeadingStore: () => ({ setHeading: mockSetHeading }),
}));

const currentAccount = buildAccountBalance({
  id: 1,
  name: 'Joint Checking',
  account_type: 'checking_account',
  account_category: 'current',
  is_cash: true,
  closing_balance: 100000,
  expected_closing_balance: 90000,
  current_balance: 100000,
});

const creditCardAccount = buildAccountBalance({
  id: 2,
  name: 'Amro Credit Card',
  account_type: 'credit_card',
  account_category: 'liability',
  is_cash: true,
  closing_balance: 0,
  expected_closing_balance: 0,
  current_balance: 0,
});

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
  props: ['heading', 'accounts', 'dashIfZero'],
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

describe('AccountBalancesPage', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
  });

  async function setupApi(accounts = [currentAccount]) {
    const { accountBalanceApi } = await import('./accountBalanceApi');
    vi.mocked(accountBalanceApi.getAll).mockResolvedValue(accounts);
    vi.mocked(accountBalanceApi.adjustBalances).mockResolvedValue({ success: true });
    return accountBalanceApi;
  }

  function createWrapper(): VueWrapper {
    return mount(AccountBalancesPage, {
      global: {
        plugins: [PrimeVue, pinia],
        stubs: {
          ToggleSwitch: ToggleSwitchStub,
          AccountCategoryTable: CategoryTableStub,
          AdjustBalancesDialog: AdjustDialogStub,
          AccountBalanceSummaryStrip: SummaryStripStub,
        },
      },
    });
  }

  describe('on mount', () => {
    it('sets the page heading to "Account Balances"', async () => {
      await setupApi();
      createWrapper();
      await flushPromises();

      expect(mockSetHeading).toHaveBeenCalledWith('Account Balances');
    });

    it('calls accountBalanceApi.getAll on mount', async () => {
      const api = await setupApi();
      createWrapper();
      await flushPromises();

      expect(api.getAll).toHaveBeenCalledWith(false);
    });
  });

  describe('layout', () => {
    it('renders include closed accounts toggle', async () => {
      await setupApi();
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(INCLUDE_CLOSED_TOGGLE).exists()).toBe(true);
    });

    it('renders Adjust Account Balances button', async () => {
      await setupApi();
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(ADJUST_BALANCES_BTN).exists()).toBe(true);
    });

    it('renders summary strip', async () => {
      await setupApi();
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="account-balance-summary-strip"]').exists()).toBe(true);
    });

    it('hides summary strip when loading', async () => {
      const { accountBalanceApi } = await import('./accountBalanceApi');
      let resolveGetAll!: (value: never[]) => void;
      vi.mocked(accountBalanceApi.getAll).mockImplementation(
        () => new Promise((resolve) => (resolveGetAll = resolve)),
      );

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="account-balance-summary-strip"]').exists()).toBe(false);

      resolveGetAll([]);
      await flushPromises();
    });

    it('hides summary strip when error', async () => {
      const { accountBalanceApi } = await import('./accountBalanceApi');
      vi.mocked(accountBalanceApi.getAll).mockRejectedValue(new Error('Failed'));
      // Store re-throws after setting error — suppress the unhandled rejection from the
      // fire-and-forget store.fetch() call in onMounted.
      const suppress = () => {};
      process.on('unhandledRejection', suppress);

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="account-balance-summary-strip"]').exists()).toBe(false);
      process.off('unhandledRejection', suppress);
    });

    it('renders category tables that have accounts', async () => {
      await setupApi([currentAccount]);
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(CURRENT_ACCOUNTS_TABLE).exists()).toBe(true);
    });

    it('hides category tables with no accounts', async () => {
      await setupApi([currentAccount]);
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(CASH_ASSETS_TABLE).exists()).toBe(false);
      expect(wrapper.find(NON_CASH_ASSETS_TABLE).exists()).toBe(false);
      expect(wrapper.find(CREDIT_CARDS_TABLE).exists()).toBe(false);
      expect(wrapper.find(LOANS_TABLE).exists()).toBe(false);
    });

    it('shows category tables when accounts are populated', async () => {
      await setupApi([currentAccount, creditCardAccount]);
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(CREDIT_CARDS_TABLE).exists()).toBe(true);
    });
  });

  describe('category table props', () => {
    it('passes currentAccounts to Current Accounts table', async () => {
      await setupApi([currentAccount]);
      const wrapper = createWrapper();
      await flushPromises();

      const tables = wrapper.findAllComponents({ name: 'AccountCategoryTable' });
      expect(tables[0].props('heading')).toBe('Current Accounts');
      expect(tables[0].props('accounts')).toEqual([currentAccount]);
    });
  });

  describe('loading state', () => {
    it('shows loading message when loading', async () => {
      const { accountBalanceApi } = await import('./accountBalanceApi');
      let resolveGetAll!: (value: never[]) => void;
      vi.mocked(accountBalanceApi.getAll).mockImplementation(
        () => new Promise((resolve) => (resolveGetAll = resolve)),
      );

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="status-message"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="status-message"]').text()).toBe('Loading...');

      resolveGetAll([]);
      await flushPromises();
    });

    it('hides content when loading', async () => {
      const { accountBalanceApi } = await import('./accountBalanceApi');
      let resolveGetAll!: (value: never[]) => void;
      vi.mocked(accountBalanceApi.getAll).mockImplementation(
        () => new Promise((resolve) => (resolveGetAll = resolve)),
      );

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(CURRENT_ACCOUNTS_TABLE).exists()).toBe(false);

      resolveGetAll([]);
      await flushPromises();
    });
  });

  describe('error state', () => {
    it('shows error message when error is set', async () => {
      const { accountBalanceApi } = await import('./accountBalanceApi');
      vi.mocked(accountBalanceApi.getAll).mockRejectedValue(new Error('Failed to load'));
      // Store re-throws after setting error — suppress the unhandled rejection from the
      // fire-and-forget store.fetch() call in onMounted.
      const suppress = () => {};
      process.on('unhandledRejection', suppress);

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="status-message"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="status-message"]').text()).toBe('Failed to load');
      process.off('unhandledRejection', suppress);
    });
  });

  describe('toolbar -- include closed toggle', () => {
    it('calls accountBalanceApi.getAll when toggle is changed', async () => {
      const api = await setupApi();
      const wrapper = createWrapper();
      await flushPromises();
      vi.clearAllMocks();
      vi.mocked(api.getAll).mockResolvedValue([currentAccount]);

      await wrapper.find(INCLUDE_CLOSED_TOGGLE).trigger('click');
      await flushPromises();

      expect(api.getAll).toHaveBeenCalledWith(true);
    });
  });

  describe('toolbar -- dash-if-zero toggle', () => {
    it('renders the dash-if-zero toggle button', async () => {
      await setupApi();
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find(DASH_ZERO_TOGGLE).exists()).toBe(true);
    });

    it('defaults dashIfZero to true on category tables', async () => {
      await setupApi([currentAccount]);
      const wrapper = createWrapper();
      await flushPromises();

      const table = wrapper.findComponent({ name: 'AccountCategoryTable' });
      expect(table.props('dashIfZero')).toBe(true);
    });

    it('toggles dashIfZero to false when clicked', async () => {
      await setupApi([currentAccount]);
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(DASH_ZERO_TOGGLE).trigger('click');
      await flushPromises();

      const table = wrapper.findComponent({ name: 'AccountCategoryTable' });
      expect(table.props('dashIfZero')).toBe(false);
    });
  });

  describe('toolbar -- adjust balances button', () => {
    it('opens adjust balances dialog when button is clicked', async () => {
      await setupApi();
      const wrapper = createWrapper();
      await flushPromises();

      const dialog = wrapper.findComponent({ name: 'AdjustBalancesDialog' });
      expect(dialog.props('visible')).toBe(false);

      await wrapper.find(ADJUST_BALANCES_BTN).trigger('click');
      await flushPromises();

      expect(dialog.props('visible')).toBe(true);
    });

    it('passes store.accounts to adjust balances dialog', async () => {
      await setupApi([currentAccount]);
      const wrapper = createWrapper();
      await flushPromises();

      const dialog = wrapper.findComponent({ name: 'AdjustBalancesDialog' });
      expect(dialog.props('accounts')).toEqual([currentAccount]);
    });

    it('closes adjust balances dialog when update:visible emits false', async () => {
      await setupApi();
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(ADJUST_BALANCES_BTN).trigger('click');
      await flushPromises();

      const dialog = wrapper.findComponent({ name: 'AdjustBalancesDialog' });
      await dialog.vm.$emit('update:visible', false);
      await flushPromises();

      expect(dialog.props('visible')).toBe(false);
    });
  });
});
