import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
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

function mountForm() {
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
      const wrapper = mountForm();

      expect(wrapper.text()).toContain('Checking');
      expect(wrapper.text()).toContain('Savings');
    });

    it('renders budget options from store', () => {
      const wrapper = mountForm();

      expect(wrapper.text()).toContain('Jan 2025');
      expect(wrapper.text()).toContain('Dec 2024');
    });

    it('shows a "Go to Budget" link', () => {
      const wrapper = mountForm();

      const link = wrapper.find('[data-testid="go-to-budget-link"]');
      expect(link.exists()).toBe(true);
    });
  });

  describe('Go to Budget link', () => {
    it('links to /budgets when no bank account/budget are selected yet', async () => {
      mockStore.bankAccounts = [];
      mockStore.budgetsForDropdown = [];
      const wrapper = mountForm();
      await nextTick();

      const link = wrapper.find('[data-testid="go-to-budget-link"]');
      expect(link.attributes('href')).toBe('#/budgets');
    });

    it('links to the selected budget after initialisation', async () => {
      const wrapper = mountForm();
      await nextTick();

      const link = wrapper.find('[data-testid="go-to-budget-link"]');
      expect(link.attributes('href')).toContain(`${jan2025.id}`);
    });
  });

  describe('auto-fetch on initial bank account load', () => {
    it('emits fetch with first account and first budget when bankAccounts load', async () => {
      const wrapper = mountForm();
      await nextTick();

      const fetchEmissions = wrapper.emitted('fetch');
      expect(fetchEmissions).toBeTruthy();
      const emitted = fetchEmissions![0][0] as { budgetId: number; bankAccountId: number };
      expect(emitted.bankAccountId).toBe(checkingAccount.id);
      expect(emitted.budgetId).toBe(jan2025.id);
    });

    it('does not emit fetch when bankAccounts are empty', async () => {
      mockStore.bankAccounts = [];
      const wrapper = mountForm();
      await nextTick();

      expect(wrapper.emitted('fetch')).toBeFalsy();
    });

    it('only initialises once even if bankAccounts changes again', async () => {
      const wrapper = mountForm();
      await nextTick();

      mockStore.bankAccounts = [...mockStore.bankAccounts]; // trigger watcher again
      await nextTick();

      const fetchEmissions = wrapper.emitted('fetch');
      expect(fetchEmissions!.length).toBe(1);
    });
  });

  describe('URL params on mount', () => {
    it('uses URL query params to select bank account and budget', async () => {
      mockRoute.query = { budget_id: '9', bank_account_id: '2' };
      const wrapper = mountForm();
      await nextTick();

      const fetchEmissions = wrapper.emitted('fetch');
      expect(fetchEmissions).toBeTruthy();
      const emitted = fetchEmissions![0][0] as { budgetId: number; bankAccountId: number };
      expect(emitted.bankAccountId).toBe(2);
      expect(emitted.budgetId).toBe(9);
    });
  });

  describe('fetch event on dropdown change', () => {
    it('emits fetch with updated bankAccountId when bank account changes', async () => {
      const wrapper = mountForm();
      await nextTick();

      const selects = wrapper.findAllComponents({ name: 'Select' });
      const bankAccountSelect = selects[0];
      await bankAccountSelect.vm.$emit('update:modelValue', savingsAccount.id);
      await nextTick();

      const fetchEmissions = wrapper.emitted('fetch');
      expect(fetchEmissions).toBeTruthy();
      const lastEmit = fetchEmissions![fetchEmissions!.length - 1][0] as { budgetId: number; bankAccountId: number };
      expect(lastEmit.bankAccountId).toBe(savingsAccount.id);
    });

    it('emits fetch with updated budgetId when budget changes', async () => {
      const wrapper = mountForm();
      await nextTick();

      const selects = wrapper.findAllComponents({ name: 'Select' });
      const budgetSelect = selects[1];
      await budgetSelect.vm.$emit('update:modelValue', dec2024.id);
      await nextTick();

      const fetchEmissions = wrapper.emitted('fetch');
      expect(fetchEmissions).toBeTruthy();
      const lastEmit = fetchEmissions![fetchEmissions!.length - 1][0] as { budgetId: number; bankAccountId: number };
      expect(lastEmit.budgetId).toBe(dec2024.id);
    });
  });
});
