import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import type { Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import TransactionsPage from './TransactionsPage.vue';
import { useTransactionStore } from './transactionStore';
import { buildTransaction } from '../../test/factories/transactionFactory';
import { buildBankAccount } from '../../test/factories/bankAccountFactory';
import { buildBudget } from '../../test/factories/budgetFactory';
import { buildAllocation } from '../../test/factories/allocationFactory';
import { buildSettings } from '../../test/factories/settingsFactory';

// Selectors
const EDIT_BTN = '[data-testid="edit-btn"]';
const SAVE_BTN = '[data-testid="save-btn"]';
const CANCEL_BTN = '[data-testid="cancel-btn"]';
const REFRESH_BTN = '[data-testid="refresh-btn"]';
const IMPORT_BTN = '[data-testid="import-btn"]';
const TRANSFER_BTN = '[data-testid="transfer-btn"]';
const WRAP_TOGGLE_BTN = '[data-testid="wrap-toggle-btn"]';
const CALCULATOR_TOGGLE_BTN = '[data-testid="calculator-toggle-btn"]';

const mockSetHeading = vi.fn();
vi.mock('../toolbar/headingStore', () => ({
  useHeadingStore: () => ({ setHeading: mockSetHeading }),
}));

const mockNotifyError = vi.fn();
const mockNotifySuccess = vi.fn();
const mockNotifyInfo = vi.fn();
vi.mock('../notifications/useNotifications', () => ({
  useNotifications: () => ({
    error: mockNotifyError,
    success: mockNotifySuccess,
    info: mockNotifyInfo,
  }),
}));

const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useRoute: () => ({ params: {}, query: {} }),
}));

// Mock all APIs used by the real stores
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

vi.mock('../bank-accounts/bankAccountApi', () => ({
  bankAccountApi: {
    getOpen: vi.fn(),
  },
}));

vi.mock('../settings/settingsApi', () => ({
  settingsApi: {
    get: vi.fn(),
  },
}));

vi.mock('../allocation-categories/allocationCategoryApi', () => ({
  allocationCategoryApi: {
    getAll: vi.fn(),
  },
}));

// Factory data
const checkingAccount = buildBankAccount({ id: 1, name: 'Checking' });
const jan2025 = buildBudget({ id: 1, name: 'Jan 2025', status: 'open' });
const sampleTransaction = buildTransaction({
  id: 1,
  description: 'Groceries',
  withdrawal_amount: 5000,
  deposit_amount: 0,
  status: 'paid',
});
const sampleAllocation = buildAllocation({ id: 1, name: 'Food', amount: 20000 });
const sampleSettings = buildSettings({ primary_budget_account_id: 1 });

const SearchFormStub = {
  name: 'TransactionSearchForm',
  template: '<div data-testid="search-form" />',
  emits: ['fetch'],
};

const ListStub = {
  name: 'TransactionList',
  template: '<div data-testid="transaction-list" />',
  props: ['wrapDescriptions', 'showCalculatorColumn'],
};

const SummaryStub = {
  name: 'TransactionSummary',
  template: '<div data-testid="transaction-summary" />',
  props: ['transactions', 'bankAccount', 'allocations'],
};

const ImportDialogStub = {
  name: 'TransactionImportDialog',
  template: '<div data-testid="import-dialog" />',
  props: ['visible'],
  emits: ['update:visible', 'imported'],
};

const TransferDialogStub = {
  name: 'AccountTransferDialog',
  template: '<div data-testid="transfer-dialog" />',
  props: ['visible'],
  emits: ['update:visible', 'transferred'],
};

let pinia: Pinia;

function createWrapper(): VueWrapper {
  return mount(TransactionsPage, {
    global: {
      plugins: [PrimeVue, pinia],
      stubs: {
        TransactionSearchForm: SearchFormStub,
        TransactionList: ListStub,
        TransactionSummary: SummaryStub,
        TransactionImportDialog: ImportDialogStub,
        AccountTransferDialog: TransferDialogStub,
      },
    },
  });
}

async function setupApis() {
  const { transactionApi } = await import('./transactionApi');
  const { budgetApi } = await import('../budgets/budgetApi');
  const { bankAccountApi } = await import('../bank-accounts/bankAccountApi');
  const { settingsApi } = await import('../settings/settingsApi');
  const { allocationCategoryApi } = await import('../allocation-categories/allocationCategoryApi');

  vi.mocked(budgetApi.getAll).mockResolvedValue([jan2025]);
  vi.mocked(bankAccountApi.getOpen).mockResolvedValue([checkingAccount]);
  vi.mocked(transactionApi.getAll).mockResolvedValue([sampleTransaction]);
  vi.mocked(transactionApi.save).mockResolvedValue([sampleTransaction]);
  vi.mocked(transactionApi.getSinkFundAllocations).mockResolvedValue([]);
  vi.mocked(budgetApi.getAllocations).mockResolvedValue([sampleAllocation]);
  vi.mocked(settingsApi.get).mockResolvedValue(sampleSettings);
  vi.mocked(allocationCategoryApi.getAll).mockResolvedValue([]);

  return { transactionApi, budgetApi, bankAccountApi, settingsApi, allocationCategoryApi };
}

describe('TransactionsPage', () => {
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
  });

  describe('on mount', () => {
    it('sets the page heading to "Transactions"', async () => {
      await setupApis();
      createWrapper();
      await flushPromises();

      expect(mockSetHeading).toHaveBeenCalledWith('Transactions');
    });

    it('calls fetchMetadata on mount (fetches budgets and bank accounts)', async () => {
      const { budgetApi, bankAccountApi } = await setupApis();
      createWrapper();
      await flushPromises();

      expect(budgetApi.getAll).toHaveBeenCalled();
      expect(bankAccountApi.getOpen).toHaveBeenCalled();
    });

    it('calls settingsStore.fetchAll on mount', async () => {
      const { settingsApi } = await setupApis();
      createWrapper();
      await flushPromises();

      expect(settingsApi.get).toHaveBeenCalled();
    });
  });

  describe('layout', () => {
    it('renders TransactionSearchForm in toolbar', async () => {
      await setupApis();
      const wrapper = createWrapper();

      expect(wrapper.findComponent({ name: 'TransactionSearchForm' }).exists()).toBe(true);
    });

    it('renders TransactionSummary', async () => {
      await setupApis();
      const wrapper = createWrapper();

      expect(wrapper.findComponent({ name: 'TransactionSummary' }).exists()).toBe(true);
    });

    it('renders TransactionList', async () => {
      await setupApis();
      const wrapper = createWrapper();

      expect(wrapper.findComponent({ name: 'TransactionList' }).exists()).toBe(true);
    });
  });

  describe('TransactionSummary props', () => {
    it('passes committed transactions when not in edit mode', async () => {
      await setupApis();
      const wrapper = createWrapper();

      const summary = wrapper.findComponent({ name: 'TransactionSummary' });
      // Before any fetch, transactions are empty
      expect(summary.props('transactions')).toEqual([]);
    });

    it('passes transactions in edit mode (same array, edited in place)', async () => {
      await setupApis();
      const wrapper = createWrapper();
      await flushPromises();

      // Trigger a fetch so the store has data
      const searchForm = wrapper.findComponent({ name: 'TransactionSearchForm' });
      await searchForm.vm.$emit('fetch', { budgetId: 1, bankAccountId: 1 });
      await flushPromises();

      const store = useTransactionStore();
      store.enterEditMode();
      await flushPromises();

      const summary = wrapper.findComponent({ name: 'TransactionSummary' });
      expect(summary.props('transactions')).toEqual(store.transactions);
      expect(store.isEditMode).toBe(true);
    });

    it('passes bankAccount to TransactionSummary', async () => {
      await setupApis();
      const wrapper = createWrapper();
      await flushPromises();

      // Trigger fetch to set selectedBankAccount
      const searchForm = wrapper.findComponent({ name: 'TransactionSearchForm' });
      await searchForm.vm.$emit('fetch', { budgetId: 1, bankAccountId: 1 });
      await flushPromises();

      const summary = wrapper.findComponent({ name: 'TransactionSummary' });
      expect(summary.props('bankAccount')).toEqual(checkingAccount);
    });

    it('passes allocations to TransactionSummary', async () => {
      await setupApis();
      const wrapper = createWrapper();
      await flushPromises();

      // Trigger fetch to load allocations
      const searchForm = wrapper.findComponent({ name: 'TransactionSearchForm' });
      await searchForm.vm.$emit('fetch', { budgetId: 1, bankAccountId: 1 });
      await flushPromises();

      const summary = wrapper.findComponent({ name: 'TransactionSummary' });
      expect(summary.props('allocations')).toEqual([sampleAllocation]);
    });
  });

  describe('TransactionList props', () => {
    it('passes wrapDescriptions=false by default', async () => {
      await setupApis();
      const wrapper = createWrapper();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('wrapDescriptions')).toBe(false);
    });

    it('passes showCalculatorColumn=false by default', async () => {
      await setupApis();
      const wrapper = createWrapper();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('showCalculatorColumn')).toBe(false);
    });
  });

  describe('toolbar — edit mode buttons', () => {
    it('shows Edit button in view mode', async () => {
      await setupApis();
      const wrapper = createWrapper();

      expect(wrapper.find(EDIT_BTN).exists()).toBe(true);
      expect(wrapper.find(SAVE_BTN).exists()).toBe(false);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(false);
    });

    it('shows Save and Cancel buttons in edit mode', async () => {
      await setupApis();
      const wrapper = createWrapper();
      await flushPromises();

      const store = useTransactionStore();
      store.enterEditMode();
      await flushPromises();

      expect(wrapper.find(SAVE_BTN).exists()).toBe(true);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(true);
      expect(wrapper.find(EDIT_BTN).exists()).toBe(false);
    });

    it('enters edit mode when Edit is clicked', async () => {
      await setupApis();
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find(EDIT_BTN).trigger('click');
      await flushPromises();

      const store = useTransactionStore();
      expect(store.isEditMode).toBe(true);
    });

    it('cancels edit mode when Cancel is clicked', async () => {
      await setupApis();
      const wrapper = createWrapper();
      await flushPromises();

      const store = useTransactionStore();
      store.enterEditMode();
      await flushPromises();

      await wrapper.find(CANCEL_BTN).trigger('click');
      await flushPromises();

      expect(store.isEditMode).toBe(false);
    });
  });

  describe('toolbar — save', () => {
    it('calls transactionApi.save when Save is clicked', async () => {
      const { transactionApi } = await setupApis();
      const wrapper = createWrapper();
      await flushPromises();

      // Fetch to populate store, then enter edit mode
      const searchForm = wrapper.findComponent({ name: 'TransactionSearchForm' });
      await searchForm.vm.$emit('fetch', { budgetId: 1, bankAccountId: 1 });
      await flushPromises();

      const store = useTransactionStore();
      store.enterEditMode();
      await flushPromises();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(transactionApi.save).toHaveBeenCalled();
    });

    it('exits edit mode after saving', async () => {
      await setupApis();
      const wrapper = createWrapper();
      await flushPromises();

      // Fetch to populate store, then enter edit mode
      const searchForm = wrapper.findComponent({ name: 'TransactionSearchForm' });
      await searchForm.vm.$emit('fetch', { budgetId: 1, bankAccountId: 1 });
      await flushPromises();

      const store = useTransactionStore();
      store.enterEditMode();
      await flushPromises();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(store.isEditMode).toBe(false);
    });

    it('shows a success notification after saving', async () => {
      await setupApis();
      const wrapper = createWrapper();
      await flushPromises();

      const searchForm = wrapper.findComponent({ name: 'TransactionSearchForm' });
      await searchForm.vm.$emit('fetch', { budgetId: 1, bankAccountId: 1 });
      await flushPromises();

      const store = useTransactionStore();
      store.enterEditMode();
      await flushPromises();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(mockNotifySuccess).toHaveBeenCalledWith('Transactions saved');
    });

    it('shows an error notification if save fails', async () => {
      const { transactionApi } = await setupApis();
      vi.mocked(transactionApi.save).mockRejectedValue(new Error('Server error'));

      const wrapper = createWrapper();
      await flushPromises();

      const searchForm = wrapper.findComponent({ name: 'TransactionSearchForm' });
      await searchForm.vm.$emit('fetch', { budgetId: 1, bankAccountId: 1 });
      await flushPromises();

      const store = useTransactionStore();
      store.enterEditMode();
      await flushPromises();

      await wrapper.find(SAVE_BTN).trigger('click');
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalled();
    });
  });

  describe('toolbar — refresh', () => {
    it('shows Refresh button', async () => {
      await setupApis();
      const wrapper = createWrapper();

      expect(wrapper.find(REFRESH_BTN).exists()).toBe(true);
    });

    it('calls store.refresh when Refresh is clicked', async () => {
      const { transactionApi } = await setupApis();
      const wrapper = createWrapper();
      await flushPromises();

      // Populate the store with a selected account/budget so refresh works
      const searchForm = wrapper.findComponent({ name: 'TransactionSearchForm' });
      await searchForm.vm.$emit('fetch', { budgetId: 1, bankAccountId: 1 });
      await flushPromises();
      vi.clearAllMocks();

      await wrapper.find(REFRESH_BTN).trigger('click');
      await flushPromises();

      // Refresh calls fetch internally, which calls transactionApi.getAll
      expect(transactionApi.getAll).toHaveBeenCalled();
    });
  });

  describe('toolbar — Import and Transfer', () => {
    it('shows Import button', async () => {
      await setupApis();
      const wrapper = createWrapper();

      const importBtn = wrapper.find(IMPORT_BTN);
      expect(importBtn.exists()).toBe(true);
    });

    it('Import button is not disabled', async () => {
      await setupApis();
      const wrapper = createWrapper();

      const importBtn = wrapper.find(IMPORT_BTN);
      expect(importBtn.attributes('disabled')).toBeUndefined();
    });

    it('opens import dialog when Import button is clicked', async () => {
      await setupApis();
      const wrapper = createWrapper();

      await wrapper.find(IMPORT_BTN).trigger('click');
      await flushPromises();

      const dialog = wrapper.findComponent({ name: 'TransactionImportDialog' });
      expect(dialog.props('visible')).toBe(true);
    });

    it('adds imported transactions to draft when dialog emits "imported"', async () => {
      await setupApis();
      const wrapper = createWrapper();
      await flushPromises();

      const importedTransactions = [
        { description: 'Test Import', withdrawal_amount: 100, deposit_amount: 0 },
      ];

      const dialog = wrapper.findComponent({ name: 'TransactionImportDialog' });
      await dialog.vm.$emit('imported', importedTransactions);
      await flushPromises();

      const store = useTransactionStore();
      // addImportedTransactions enters edit mode and adds to transactions
      expect(store.isEditMode).toBe(true);
      expect(store.transactions.some((t) => t.description === 'Test Import')).toBe(true);
    });

    it('shows Transfer button', async () => {
      await setupApis();
      const wrapper = createWrapper();

      const transferBtn = wrapper.find(TRANSFER_BTN);
      expect(transferBtn.exists()).toBe(true);
    });

    it('Transfer button is not disabled', async () => {
      await setupApis();
      const wrapper = createWrapper();

      const transferBtn = wrapper.find(TRANSFER_BTN);
      expect(transferBtn.attributes('disabled')).toBeUndefined();
    });

    it('opens transfer dialog when Transfer button is clicked', async () => {
      await setupApis();
      const wrapper = createWrapper();

      await wrapper.find(TRANSFER_BTN).trigger('click');
      await flushPromises();

      const dialog = wrapper.findComponent({ name: 'AccountTransferDialog' });
      expect(dialog.props('visible')).toBe(true);
    });

    it('calls store.fetch when transfer dialog emits "transferred"', async () => {
      const { transactionApi } = await setupApis();
      const wrapper = createWrapper();
      await flushPromises();

      // First fetch so selectedBudget/selectedBankAccount are set
      const searchForm = wrapper.findComponent({ name: 'TransactionSearchForm' });
      await searchForm.vm.$emit('fetch', { budgetId: 1, bankAccountId: 1 });
      await flushPromises();
      vi.clearAllMocks();

      const dialog = wrapper.findComponent({ name: 'AccountTransferDialog' });
      await dialog.vm.$emit('transferred');
      await flushPromises();

      expect(transactionApi.getAll).toHaveBeenCalledWith({
        budgetId: jan2025.id,
        bankAccountId: checkingAccount.id,
      });
    });
  });

  describe('toolbar — wrap toggle', () => {
    it('shows wrap toggle button', async () => {
      await setupApis();
      const wrapper = createWrapper();

      expect(wrapper.find(WRAP_TOGGLE_BTN).exists()).toBe(true);
    });

    it('passes wrapDescriptions=true to TransactionList after toggle', async () => {
      await setupApis();
      const wrapper = createWrapper();

      await wrapper.find(WRAP_TOGGLE_BTN).trigger('click');
      await flushPromises();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('wrapDescriptions')).toBe(true);
    });

    it('toggles wrapDescriptions back to false on second click', async () => {
      await setupApis();
      const wrapper = createWrapper();

      await wrapper.find(WRAP_TOGGLE_BTN).trigger('click');
      await wrapper.find(WRAP_TOGGLE_BTN).trigger('click');
      await flushPromises();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('wrapDescriptions')).toBe(false);
    });
  });

  describe('toolbar — calculator toggle', () => {
    it('shows calculator toggle button', async () => {
      await setupApis();
      const wrapper = createWrapper();

      expect(wrapper.find(CALCULATOR_TOGGLE_BTN).exists()).toBe(true);
    });

    it('passes showCalculatorColumn=true to TransactionList after toggle', async () => {
      await setupApis();
      const wrapper = createWrapper();

      await wrapper.find(CALCULATOR_TOGGLE_BTN).trigger('click');
      await flushPromises();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('showCalculatorColumn')).toBe(true);
    });

    it('toggles showCalculatorColumn back to false on second click', async () => {
      await setupApis();
      const wrapper = createWrapper();

      await wrapper.find(CALCULATOR_TOGGLE_BTN).trigger('click');
      await wrapper.find(CALCULATOR_TOGGLE_BTN).trigger('click');
      await flushPromises();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('showCalculatorColumn')).toBe(false);
    });

    it('clears selections when toggling calculator column off', async () => {
      await setupApis();
      const wrapper = createWrapper();
      await flushPromises();

      // Fetch so store has transactions with draft data
      const searchForm = wrapper.findComponent({ name: 'TransactionSearchForm' });
      await searchForm.vm.$emit('fetch', { budgetId: 1, bankAccountId: 1 });
      await flushPromises();

      const store = useTransactionStore();
      store.enterEditMode();
      // Mark a transaction as selected
      store.transactions[0].selected = true;

      await wrapper.find(CALCULATOR_TOGGLE_BTN).trigger('click');
      await wrapper.find(CALCULATOR_TOGGLE_BTN).trigger('click');
      await flushPromises();

      expect(store.transactions[0].selected).toBe(false);
    });

    it('does not clear selections when toggling calculator column on', async () => {
      await setupApis();
      const wrapper = createWrapper();
      await flushPromises();

      // Fetch so store has transactions with draft data
      const searchForm = wrapper.findComponent({ name: 'TransactionSearchForm' });
      await searchForm.vm.$emit('fetch', { budgetId: 1, bankAccountId: 1 });
      await flushPromises();

      const store = useTransactionStore();
      store.enterEditMode();
      store.transactions[0].selected = true;

      await wrapper.find(CALCULATOR_TOGGLE_BTN).trigger('click');
      await flushPromises();

      // Selected status should not be cleared when toggling ON
      expect(store.transactions[0].selected).toBe(true);
    });
  });

  describe('fetch event from TransactionSearchForm', () => {
    it('calls transactionApi.getAll with the given params', async () => {
      const { transactionApi } = await setupApis();
      const wrapper = createWrapper();
      await flushPromises();

      const searchForm = wrapper.findComponent({ name: 'TransactionSearchForm' });
      await searchForm.vm.$emit('fetch', { budgetId: 1, bankAccountId: 1 });
      await flushPromises();

      expect(transactionApi.getAll).toHaveBeenCalledWith({ budgetId: 1, bankAccountId: 1 });
    });
  });
});
