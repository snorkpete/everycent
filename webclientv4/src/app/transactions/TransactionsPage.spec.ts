import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import TransactionsPage from './TransactionsPage.vue';
import type { TransactionData, AllocationData, BudgetData } from './transaction.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';

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
vi.mock('../notifications/useNotifications', () => ({
  useNotifications: () => ({
    error: mockNotifyError,
    success: mockNotifySuccess,
    info: vi.fn(),
  }),
}));

const mockSettingsFetchAll = vi.fn().mockResolvedValue(undefined);
vi.mock('../settings/settingsStore', () => ({
  useSettingsStore: () => ({
    settings: { primary_budget_account_id: 1 },
    fetchAll: mockSettingsFetchAll,
  }),
}));

const checkingAccount: BankAccountData = {
  id: 1,
  name: 'Checking',
  is_sink_fund: false,
  is_credit_card: false,
};
const jan2025: BudgetData = { id: 1, name: 'Jan 2025', status: 'open' };
const sampleTransactions: TransactionData[] = [
  { id: 1, description: 'Groceries', withdrawal_amount: 5000, deposit_amount: 0, status: 'paid' },
];
const sampleAllocations: AllocationData[] = [{ id: 1, name: 'Food', amount: 20000 }];

const mockStore = reactive({
  transactions: sampleTransactions as TransactionData[],
  draftTransactions: sampleTransactions as TransactionData[],
  isEditMode: false,
  allocations: sampleAllocations as AllocationData[],
  sinkFundAllocations: [] as unknown[],
  budgets: [jan2025] as BudgetData[],
  bankAccounts: [checkingAccount] as BankAccountData[],
  selectedBankAccount: checkingAccount as BankAccountData | null,
  selectedBudget: jan2025 as BudgetData | null,
  loading: false,
  error: null as string | null,
  budgetsForDropdown: [jan2025] as BudgetData[],
  fetchMetadata: vi.fn().mockResolvedValue(undefined),
  fetch: vi.fn().mockResolvedValue(undefined),
  save: vi.fn().mockResolvedValue(undefined),
  refresh: vi.fn().mockResolvedValue(undefined),
  cancelEdit: vi.fn(),
  exitEditMode: vi.fn(),
  enterEditMode: vi.fn(),
  addTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  onAllocationChange: vi.fn(),
  addImportedTransactions: vi.fn(),
  selectedTransactions: [] as unknown[],
  selectedTotal: 0,
  clearSelections: vi.fn(),
});

vi.mock('./transactionStore', () => ({
  useTransactionStore: () => mockStore,
}));

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

function createWrapper() {
  return mount(TransactionsPage, {
    global: {
      plugins: [PrimeVue, createPinia()],
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

describe('TransactionsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.transactions = sampleTransactions;
    mockStore.draftTransactions = sampleTransactions;
    mockStore.isEditMode = false;
    mockStore.allocations = sampleAllocations;
    mockStore.sinkFundAllocations = [];
    mockStore.selectedBankAccount = checkingAccount;
    mockStore.selectedBudget = jan2025;
    mockStore.error = null;
    mockStore.fetchMetadata.mockResolvedValue(undefined);
    mockStore.fetch.mockResolvedValue(undefined);
    mockStore.save.mockResolvedValue(undefined);
    mockStore.refresh.mockResolvedValue(undefined);
    mockStore.addImportedTransactions.mockReset();
  });

  describe('on mount', () => {
    it('sets the page heading to "Transactions"', async () => {
      createWrapper();
      await nextTick();

      expect(mockSetHeading).toHaveBeenCalledWith('Transactions');
    });

    it('calls fetchMetadata on mount', async () => {
      createWrapper();
      await nextTick();

      expect(mockStore.fetchMetadata).toHaveBeenCalled();
    });

    it('calls settingsStore.fetchAll on mount', async () => {
      createWrapper();
      await nextTick();

      expect(mockSettingsFetchAll).toHaveBeenCalled();
    });
  });

  describe('layout', () => {
    it('renders TransactionSearchForm in toolbar', () => {
      const wrapper = createWrapper();

      expect(wrapper.findComponent({ name: 'TransactionSearchForm' }).exists()).toBe(true);
    });

    it('renders TransactionSummary', () => {
      const wrapper = createWrapper();

      expect(wrapper.findComponent({ name: 'TransactionSummary' }).exists()).toBe(true);
    });

    it('renders TransactionList', () => {
      const wrapper = createWrapper();

      expect(wrapper.findComponent({ name: 'TransactionList' }).exists()).toBe(true);
    });
  });

  describe('TransactionSummary props', () => {
    it('passes committed transactions when not in edit mode', () => {
      const wrapper = createWrapper();

      const summary = wrapper.findComponent({ name: 'TransactionSummary' });
      expect(summary.props('transactions')).toEqual(sampleTransactions);
    });

    it('passes draft transactions when in edit mode', async () => {
      const draftTransactions: TransactionData[] = [
        {
          id: 1,
          description: 'Groceries',
          withdrawal_amount: 5000,
          deposit_amount: 0,
          status: 'paid',
        },
        {
          id: 2,
          description: 'New draft',
          withdrawal_amount: 1000,
          deposit_amount: 0,
          status: 'paid',
        },
      ];
      mockStore.isEditMode = true;
      mockStore.draftTransactions = draftTransactions;

      const wrapper = createWrapper();
      await nextTick();

      const summary = wrapper.findComponent({ name: 'TransactionSummary' });
      expect(summary.props('transactions')).toEqual(draftTransactions);
    });

    it('passes bankAccount to TransactionSummary', () => {
      const wrapper = createWrapper();

      const summary = wrapper.findComponent({ name: 'TransactionSummary' });
      expect(summary.props('bankAccount')).toEqual(checkingAccount);
    });

    it('passes allocations to TransactionSummary', () => {
      const wrapper = createWrapper();

      const summary = wrapper.findComponent({ name: 'TransactionSummary' });
      expect(summary.props('allocations')).toEqual(sampleAllocations);
    });
  });

  describe('TransactionList props', () => {
    it('passes wrapDescriptions=false by default', () => {
      const wrapper = createWrapper();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('wrapDescriptions')).toBe(false);
    });

    it('passes showCalculatorColumn=false by default', () => {
      const wrapper = createWrapper();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('showCalculatorColumn')).toBe(false);
    });
  });

  describe('toolbar — edit mode buttons', () => {
    it('shows Edit button in view mode', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(EDIT_BTN).exists()).toBe(true);
      expect(wrapper.find(SAVE_BTN).exists()).toBe(false);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(false);
    });

    it('shows Save and Cancel buttons in edit mode', async () => {
      mockStore.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(SAVE_BTN).exists()).toBe(true);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(true);
      expect(wrapper.find(EDIT_BTN).exists()).toBe(false);
    });

    it('calls store.enterEditMode when Edit is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(EDIT_BTN).trigger('click');

      expect(mockStore.enterEditMode).toHaveBeenCalled();
    });

    it('calls store.cancelEdit when Cancel is clicked', async () => {
      mockStore.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(CANCEL_BTN).trigger('click');

      expect(mockStore.cancelEdit).toHaveBeenCalled();
    });
  });

  describe('toolbar — save', () => {
    it('calls store.save with draftTransactions when Save is clicked', async () => {
      mockStore.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();
      const draftTransactions = mockStore.draftTransactions;

      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      expect(mockStore.save).toHaveBeenCalledWith(draftTransactions);
    });

    it('calls store.exitEditMode after saving', async () => {
      mockStore.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      expect(mockStore.exitEditMode).toHaveBeenCalled();
    });

    it('shows a success notification after saving', async () => {
      mockStore.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      expect(mockNotifySuccess).toHaveBeenCalledWith('Transactions saved');
    });

    it('shows an error notification if save fails', async () => {
      const errorMessage = 'Save failed';
      mockStore.save.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Server error');
      });
      mockStore.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('toolbar — refresh', () => {
    it('shows Refresh button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(REFRESH_BTN).exists()).toBe(true);
    });

    it('calls store.refresh when Refresh is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(REFRESH_BTN).trigger('click');
      await nextTick();

      expect(mockStore.refresh).toHaveBeenCalled();
    });
  });

  describe('toolbar — Import and Transfer', () => {
    it('shows Import button', () => {
      const wrapper = createWrapper();

      const importBtn = wrapper.find(IMPORT_BTN);
      expect(importBtn.exists()).toBe(true);
    });

    it('Import button is not disabled', () => {
      const wrapper = createWrapper();

      const importBtn = wrapper.find(IMPORT_BTN);
      expect(importBtn.attributes('disabled')).toBeUndefined();
    });

    it('opens import dialog when Import button is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(IMPORT_BTN).trigger('click');
      await nextTick();

      const dialog = wrapper.findComponent({ name: 'TransactionImportDialog' });
      expect(dialog.props('visible')).toBe(true);
    });

    it('calls store.addImportedTransactions when dialog emits "imported"', async () => {
      const wrapper = createWrapper();
      const importedTransactions = [
        { description: 'Test Import', withdrawal_amount: 100, deposit_amount: 0 },
      ];

      const dialog = wrapper.findComponent({ name: 'TransactionImportDialog' });
      await dialog.vm.$emit('imported', importedTransactions);
      await nextTick();

      expect(mockStore.addImportedTransactions).toHaveBeenCalledWith(importedTransactions);
    });

    it('shows Transfer button', () => {
      const wrapper = createWrapper();

      const transferBtn = wrapper.find(TRANSFER_BTN);
      expect(transferBtn.exists()).toBe(true);
    });

    it('Transfer button is not disabled', () => {
      const wrapper = createWrapper();

      const transferBtn = wrapper.find(TRANSFER_BTN);
      expect(transferBtn.attributes('disabled')).toBeUndefined();
    });

    it('opens transfer dialog when Transfer button is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(TRANSFER_BTN).trigger('click');
      await nextTick();

      const dialog = wrapper.findComponent({ name: 'AccountTransferDialog' });
      expect(dialog.props('visible')).toBe(true);
    });

    it('calls store.fetch when transfer dialog emits "transferred"', async () => {
      const wrapper = createWrapper();

      const dialog = wrapper.findComponent({ name: 'AccountTransferDialog' });
      await dialog.vm.$emit('transferred');
      await nextTick();

      expect(mockStore.fetch).toHaveBeenCalledWith({
        budgetId: jan2025.id,
        bankAccountId: checkingAccount.id,
      });
    });
  });

  describe('toolbar — wrap toggle', () => {
    it('shows wrap toggle button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(WRAP_TOGGLE_BTN).exists()).toBe(true);
    });

    it('passes wrapDescriptions=true to TransactionList after toggle', async () => {
      const wrapper = createWrapper();

      await wrapper.find(WRAP_TOGGLE_BTN).trigger('click');
      await nextTick();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('wrapDescriptions')).toBe(true);
    });

    it('toggles wrapDescriptions back to false on second click', async () => {
      const wrapper = createWrapper();

      await wrapper.find(WRAP_TOGGLE_BTN).trigger('click');
      await wrapper.find(WRAP_TOGGLE_BTN).trigger('click');
      await nextTick();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('wrapDescriptions')).toBe(false);
    });
  });

  describe('toolbar — calculator toggle', () => {
    it('shows calculator toggle button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(CALCULATOR_TOGGLE_BTN).exists()).toBe(true);
    });

    it('passes showCalculatorColumn=true to TransactionList after toggle', async () => {
      const wrapper = createWrapper();

      await wrapper.find(CALCULATOR_TOGGLE_BTN).trigger('click');
      await nextTick();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('showCalculatorColumn')).toBe(true);
    });

    it('toggles showCalculatorColumn back to false on second click', async () => {
      const wrapper = createWrapper();

      await wrapper.find(CALCULATOR_TOGGLE_BTN).trigger('click');
      await wrapper.find(CALCULATOR_TOGGLE_BTN).trigger('click');
      await nextTick();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('showCalculatorColumn')).toBe(false);
    });

    it('calls store.clearSelections when toggling calculator column off', async () => {
      const wrapper = createWrapper();

      await wrapper.find(CALCULATOR_TOGGLE_BTN).trigger('click');
      await wrapper.find(CALCULATOR_TOGGLE_BTN).trigger('click');

      expect(mockStore.clearSelections).toHaveBeenCalled();
    });

    it('does not call store.clearSelections when toggling calculator column on', async () => {
      const wrapper = createWrapper();

      await wrapper.find(CALCULATOR_TOGGLE_BTN).trigger('click');

      expect(mockStore.clearSelections).not.toHaveBeenCalled();
    });
  });

  describe('fetch event from TransactionSearchForm', () => {
    it('calls store.fetch with the given params', async () => {
      const wrapper = createWrapper();

      const searchForm = wrapper.findComponent({ name: 'TransactionSearchForm' });
      await searchForm.vm.$emit('fetch', { budgetId: 1, bankAccountId: 1 });
      await nextTick();

      expect(mockStore.fetch).toHaveBeenCalledWith({ budgetId: 1, bankAccountId: 1 });
    });
  });
});
