import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import {mount, type VueWrapper} from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import TransactionSearchForm from './TransactionSearchForm.vue';
import type { BudgetData } from './transaction.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';

const checkingAccount: BankAccountData = { id: 1, name: 'Checking', is_sink_fund: false };
const savingsAccount: BankAccountData = { id: 2, name: 'Savings', is_sink_fund: false };
const jan2025: BudgetData = { id: 10, name: 'Jan 2025', status: 'open' };
const dec2024: BudgetData = { id: 9, name: 'Dec 2024', status: 'closed' };

const mockRoute = { query: {} as Record<string, string> };

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
}));

const mockStore = reactive({
  bankAccounts: [checkingAccount, savingsAccount] as BankAccountData[],
  budgetsForDropdown: [jan2025, dec2024] as BudgetData[],
  selectedBankAccount: checkingAccount as BankAccountData | null,
  selectedBudget: jan2025 as BudgetData | null,
});

vi.mock('./transactionStore', () => ({
  useTransactionStore: () => mockStore,
}));

function createWrapper(): VueWrapper {
  return mount(TransactionSearchForm, {
    global: {
      plugins: [PrimeVue, createPinia()],
    },
  });
}

describe('TransactionSearchForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.bankAccounts = [checkingAccount, savingsAccount];
    mockStore.budgetsForDropdown = [jan2025, dec2024];
    mockStore.selectedBankAccount = checkingAccount;
    mockStore.selectedBudget = jan2025;
    mockRoute.query = {};
  });

  describe('rendering', () => {
    it('renders bank account options from store', () => {
      const wrapper = createWrapper();

      const bankAccountSelect = wrapper.findComponent('[data-testid="bank-account-select"]');
      expect(bankAccountSelect.props('options')).toEqual([checkingAccount, savingsAccount]);
    });

    it('renders budget options from store', () => {
      const wrapper = createWrapper();

      const budgetSelect = wrapper.findComponent('[data-testid="budget-select"]');
      expect(budgetSelect.props('options')).toEqual([jan2025, dec2024]);
    });

    it('shows a "Go to Budget" link', () => {
      const wrapper = createWrapper();

      const link = wrapper.find('[data-testid="go-to-budget-link"]');
      expect(link.exists()).toBe(true);
    });
  });

  describe('Go to Budget link', () => {
    it('links to /budgets when no bank account/budget are selected yet', async () => {
      mockStore.bankAccounts = [];
      mockStore.budgetsForDropdown = [];
      const wrapper = createWrapper();
      await nextTick();

      const link = wrapper.find('[data-testid="go-to-budget-link"]');
      expect(link.attributes('href')).toBe('#/budgets');
    });

    it('links to the selected budget after initialisation', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const link = wrapper.find('[data-testid="go-to-budget-link"]');
      expect(link.attributes('href')).toContain(`${jan2025.id}`);
    });
  });

  describe('auto-fetch on initial bank account load', () => {
    it('emits fetch with first account and first budget when bankAccounts load', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const fetchEmissions = wrapper.emitted('fetch');
      expect(fetchEmissions).toBeTruthy();
      const [params] = fetchEmissions![0] as [{ budgetId: number; bankAccountId: number }];
      expect(params.bankAccountId).toBe(checkingAccount.id);
      expect(params.budgetId).toBe(jan2025.id);
    });

    it('does not emit fetch when bankAccounts are empty', async () => {
      mockStore.bankAccounts = [];
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.emitted('fetch')).toBeFalsy();
    });

    // The initialised guard prevents re-fetching when bankAccounts is re-assigned
    // (e.g. after a store refresh). The watcher is a one-time startup trigger, not
    // a subscription to bank account changes.
    it('only initialises once even if bankAccounts is re-assigned', async () => {
      const wrapper = createWrapper();
      await nextTick();

      mockStore.bankAccounts = [...mockStore.bankAccounts];
      await nextTick();

      const fetchEmissions = wrapper.emitted('fetch');
      expect(fetchEmissions!.length).toBe(1);
    });
  });

  describe('URL params on mount', () => {
    it('uses URL query params to select bank account and budget', async () => {
      mockRoute.query = { budget_id: '9', bank_account_id: '2' };
      const wrapper = createWrapper();
      await nextTick();

      const fetchEmissions = wrapper.emitted('fetch');
      expect(fetchEmissions).toBeTruthy();
      const [params] = fetchEmissions![0] as [{ budgetId: number; bankAccountId: number }];
      expect(params.bankAccountId).toBe(2);
      expect(params.budgetId).toBe(9);
    });
  });

  describe('fetch event on dropdown change', () => {
    it('emits fetch with updated bankAccountId when bank account changes', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const bankAccountSelect = wrapper.findComponent('[data-testid="bank-account-select"]');
      await bankAccountSelect.vm.$emit('update:modelValue', savingsAccount.id);
      await nextTick();

      const fetchEmissions = wrapper.emitted('fetch');
      expect(fetchEmissions).toBeTruthy();
      const [lastParams] = fetchEmissions!.at(-1)! as [{ budgetId: number; bankAccountId: number }];
      expect(lastParams.bankAccountId).toBe(savingsAccount.id);
    });

    it('emits fetch with updated budgetId when budget changes', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const budgetSelect = wrapper.findComponent('[data-testid="budget-select"]');
      await budgetSelect.vm.$emit('update:modelValue', dec2024.id);
      await nextTick();

      const fetchEmissions = wrapper.emitted('fetch');
      expect(fetchEmissions).toBeTruthy();
      const [lastParams] = fetchEmissions!.at(-1)! as [{ budgetId: number; bankAccountId: number }];
      expect(lastParams.budgetId).toBe(dec2024.id);
    });
  });
});
