import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import TransactionsPage from './TransactionsPage.vue';
import type { TransactionData, AllocationData, BudgetData } from './transaction.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';

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
  emits: ['save', 'cancel'],
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
    it('renders TransactionSearchForm', () => {
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

  describe('save event from TransactionList', () => {
    it('calls store.save with draftTransactions', async () => {
      const wrapper = mountPage();
      const draftTransactions = mockStore.draftTransactions;

      const list = wrapper.findComponent({ name: 'TransactionList' });
      await list.vm.$emit('save');
      await nextTick();

      expect(mockStore.save).toHaveBeenCalledWith(draftTransactions);
    });

    it('calls store.exitEditMode after saving', async () => {
      const wrapper = mountPage();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      await list.vm.$emit('save');
      await nextTick();

      expect(mockStore.exitEditMode).toHaveBeenCalled();
    });

    it('shows a success notification after saving', async () => {
      const wrapper = mountPage();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      await list.vm.$emit('save');
      await nextTick();

      expect(mockNotifySuccess).toHaveBeenCalledWith('Transactions saved');
    });

    it('shows an error notification if save fails', async () => {
      const errorMessage = 'Save failed';
      mockStore.save.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Server error');
      });
      const wrapper = mountPage();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      await list.vm.$emit('save');
      await nextTick();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('cancel event from TransactionList', () => {
    it('calls store.cancelEdit on cancel', async () => {
      const wrapper = mountPage();

      const list = wrapper.findComponent({ name: 'TransactionList' });
      await list.vm.$emit('cancel');
      await nextTick();

      expect(mockStore.cancelEdit).toHaveBeenCalled();
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
