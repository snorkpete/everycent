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

const checkingAccount: BankAccountData = { id: 1, name: 'Checking', is_sink_fund: false, is_credit_card: false };
const jan2025: BudgetData = { id: 1, name: 'Jan 2025', status: 'open' };
const sampleTransactions: TransactionData[] = [
  { id: 1, description: 'Groceries', withdrawal_amount: 5000, deposit_amount: 0, status: 'paid' },
];
const sampleAllocations: AllocationData[] = [
  { id: 1, name: 'Food', amount: 20000 },
];

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

function mountPage() {
  return mount(TransactionsPage, {
    global: {
      plugins: [PrimeVue, createPinia()],
      stubs: {
        TransactionSearchForm: SearchFormStub,
        TransactionList: ListStub,
        TransactionSummary: SummaryStub,
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
  });

  describe('on mount', () => {
    it('sets the page heading to "Transactions"', async () => {
      mountPage();
      await nextTick();

      expect(mockSetHeading).toHaveBeenCalledWith('Transactions');
    });

    it('calls fetchMetadata on mount', async () => {
      mountPage();
      await nextTick();

      expect(mockStore.fetchMetadata).toHaveBeenCalled();
    });
  });

  describe('layout', () => {
    it('renders TransactionSearchForm in toolbar', () => {
      const wrapper = mountPage();

      expect(wrapper.findComponent({ name: 'TransactionSearchForm' }).exists()).toBe(true);
    });

    it('renders TransactionSummary', () => {
      const wrapper = mountPage();

      expect(wrapper.findComponent({ name: 'TransactionSummary' }).exists()).toBe(true);
    });

    it('renders TransactionList', () => {
      const wrapper = mountPage();

      expect(wrapper.findComponent({ name: 'TransactionList' }).exists()).toBe(true);
    });
  });

  describe('TransactionSummary props', () => {
    it('passes transactions to TransactionSummary', () => {
      const wrapper = mountPage();

      const summary = wrapper.findComponent({ name: 'TransactionSummary' });
      expect(summary.props('transactions')).toEqual(sampleTransactions);
    });

    it('passes bankAccount to TransactionSummary', () => {
      const wrapper = mountPage();

      const summary = wrapper.findComponent({ name: 'TransactionSummary' });
      expect(summary.props('bankAccount')).toEqual(checkingAccount);
    });

    it('passes allocations to TransactionSummary', () => {
      const wrapper = mountPage();

      const summary = wrapper.findComponent({ name: 'TransactionSummary' });
      expect(summary.props('allocations')).toEqual(sampleAllocations);
    });
  });

  describe('TransactionList props', () => {
    it('passes wrapDescriptions=false by default', () => {
      const wrapper = mountPage();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('wrapDescriptions')).toBe(false);
    });

    it('passes showCalculatorColumn=false by default', () => {
      const wrapper = mountPage();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('showCalculatorColumn')).toBe(false);
    });
  });

  describe('toolbar — edit mode buttons', () => {
    it('shows Edit button in view mode', () => {
      const wrapper = mountPage();

      expect(wrapper.find(EDIT_BTN).exists()).toBe(true);
      expect(wrapper.find(SAVE_BTN).exists()).toBe(false);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(false);
    });

    it('shows Save and Cancel buttons in edit mode', async () => {
      mockStore.isEditMode = true;
      const wrapper = mountPage();
      await nextTick();

      expect(wrapper.find(SAVE_BTN).exists()).toBe(true);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(true);
      expect(wrapper.find(EDIT_BTN).exists()).toBe(false);
    });

    it('calls store.enterEditMode when Edit is clicked', async () => {
      const wrapper = mountPage();

      await wrapper.find(EDIT_BTN).trigger('click');

      expect(mockStore.enterEditMode).toHaveBeenCalled();
    });

    it('calls store.cancelEdit when Cancel is clicked', async () => {
      mockStore.isEditMode = true;
      const wrapper = mountPage();
      await nextTick();

      await wrapper.find(CANCEL_BTN).trigger('click');

      expect(mockStore.cancelEdit).toHaveBeenCalled();
    });
  });

  describe('toolbar — save', () => {
    it('calls store.save with draftTransactions when Save is clicked', async () => {
      mockStore.isEditMode = true;
      const wrapper = mountPage();
      await nextTick();
      const draftTransactions = mockStore.draftTransactions;

      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      expect(mockStore.save).toHaveBeenCalledWith(draftTransactions);
    });

    it('calls store.exitEditMode after saving', async () => {
      mockStore.isEditMode = true;
      const wrapper = mountPage();
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      expect(mockStore.exitEditMode).toHaveBeenCalled();
    });

    it('shows a success notification after saving', async () => {
      mockStore.isEditMode = true;
      const wrapper = mountPage();
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
      const wrapper = mountPage();
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('toolbar — refresh', () => {
    it('shows Refresh button', () => {
      const wrapper = mountPage();

      expect(wrapper.find(REFRESH_BTN).exists()).toBe(true);
    });

    it('calls store.refresh when Refresh is clicked', async () => {
      const wrapper = mountPage();

      await wrapper.find(REFRESH_BTN).trigger('click');
      await nextTick();

      expect(mockStore.refresh).toHaveBeenCalled();
    });
  });

  describe('toolbar — Import and Transfer', () => {
    it('shows Import button (disabled)', () => {
      const wrapper = mountPage();

      const importBtn = wrapper.find(IMPORT_BTN);
      expect(importBtn.exists()).toBe(true);
      expect(importBtn.attributes('disabled')).toBeDefined();
    });

    it('shows Transfer button (disabled)', () => {
      const wrapper = mountPage();

      const transferBtn = wrapper.find(TRANSFER_BTN);
      expect(transferBtn.exists()).toBe(true);
      expect(transferBtn.attributes('disabled')).toBeDefined();
    });
  });

  describe('toolbar — wrap toggle', () => {
    it('shows wrap toggle button', () => {
      const wrapper = mountPage();

      expect(wrapper.find(WRAP_TOGGLE_BTN).exists()).toBe(true);
    });

    it('passes wrapDescriptions=true to TransactionList after toggle', async () => {
      const wrapper = mountPage();

      await wrapper.find(WRAP_TOGGLE_BTN).trigger('click');
      await nextTick();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('wrapDescriptions')).toBe(true);
    });

    it('toggles wrapDescriptions back to false on second click', async () => {
      const wrapper = mountPage();

      await wrapper.find(WRAP_TOGGLE_BTN).trigger('click');
      await wrapper.find(WRAP_TOGGLE_BTN).trigger('click');
      await nextTick();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('wrapDescriptions')).toBe(false);
    });
  });

  describe('toolbar — calculator toggle', () => {
    it('shows calculator toggle button', () => {
      const wrapper = mountPage();

      expect(wrapper.find(CALCULATOR_TOGGLE_BTN).exists()).toBe(true);
    });

    it('passes showCalculatorColumn=true to TransactionList after toggle', async () => {
      const wrapper = mountPage();

      await wrapper.find(CALCULATOR_TOGGLE_BTN).trigger('click');
      await nextTick();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('showCalculatorColumn')).toBe(true);
    });

    it('toggles showCalculatorColumn back to false on second click', async () => {
      const wrapper = mountPage();

      await wrapper.find(CALCULATOR_TOGGLE_BTN).trigger('click');
      await wrapper.find(CALCULATOR_TOGGLE_BTN).trigger('click');
      await nextTick();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      expect(list.props('showCalculatorColumn')).toBe(false);
    });
  });

  describe('fetch event from TransactionSearchForm', () => {
    it('calls store.fetch with the given params', async () => {
      const wrapper = mountPage();

      const searchForm = wrapper.findComponent({ name: 'TransactionSearchForm' });
      await searchForm.vm.$emit('fetch', { budgetId: 1, bankAccountId: 1 });
      await nextTick();

      expect(mockStore.fetch).toHaveBeenCalledWith({ budgetId: 1, bankAccountId: 1 });
    });
  });
});
