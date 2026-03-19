import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import TransactionSummary from './TransactionSummary.vue';
import type { TransactionData, AllocationData } from './transaction.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';

const primaryAccountId = 5;
const primaryAccount: BankAccountData = {
  id: primaryAccountId,
  name: 'Primary Checking',
  closing_balance: 100000,
  is_credit_card: false,
  is_sink_fund: false,
  account_type: 'normal',
};
const normalAccount: BankAccountData = {
  id: 10,
  name: 'Savings',
  closing_balance: 50000,
  is_credit_card: false,
  is_sink_fund: false,
  account_type: 'normal',
};
const creditCardAccount: BankAccountData = {
  id: 20,
  name: 'Visa',
  closing_balance: -20000,
  is_credit_card: true,
  is_sink_fund: false,
  account_type: 'credit_card',
};

const mockSettings = { primary_budget_account_id: primaryAccountId };

const mockSettingsStore = {
  settings: mockSettings,
  fetchAll: vi.fn().mockResolvedValue(undefined),
};

vi.mock('../settings/settingsStore', () => ({
  useSettingsStore: () => mockSettingsStore,
}));

const transactions: TransactionData[] = [
  { id: 1, description: 'Groceries', withdrawal_amount: 5000, deposit_amount: 0, status: 'paid', deleted: false },
  { id: 2, description: 'Salary', withdrawal_amount: 0, deposit_amount: 300000, status: 'paid', deleted: false },
  { id: 3, description: 'Deleted', withdrawal_amount: 1000, deposit_amount: 0, status: 'paid', deleted: true },
];

const allocations: AllocationData[] = [
  { id: 1, name: 'Food', amount: 20000, spent: 5000 },
  { id: 2, name: 'Rent', amount: 100000, spent: 100000 },
];

function mountSummary(props: {
  bankAccount?: BankAccountData;
  transactions?: TransactionData[];
  allocations?: AllocationData[];
} = {}) {
  return mount(TransactionSummary, {
    props: {
      bankAccount: 'bankAccount' in props ? props.bankAccount : primaryAccount,
      transactions: props.transactions ?? transactions,
      allocations: props.allocations ?? allocations,
    },
    global: {
      plugins: [PrimeVue, createPinia()],
    },
  });
}

describe('TransactionSummary', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockSettingsStore.settings = { primary_budget_account_id: primaryAccountId };
  });

  describe('layout', () => {
    it('renders three columns in row 1', () => {
      const wrapper = mountSummary();

      expect(wrapper.find('[data-testid="last-bank-balance"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="transaction-total"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="current-bank-balance"]').exists()).toBe(true);
    });
  });

  describe('last bank balance', () => {
    it('shows the closing balance of the bank account', () => {
      const wrapper = mountSummary({ bankAccount: primaryAccount });

      expect(wrapper.find('[data-testid="last-bank-balance"]').text()).toContain('1,000.00');
    });

    it('shows 0 when no bank account is provided', () => {
      const wrapper = mountSummary({ bankAccount: undefined });

      expect(wrapper.find('[data-testid="last-bank-balance"]').text()).toContain('0.00');
    });
  });

  describe('transaction total', () => {
    it('shows deposits minus withdrawals (excluding deleted)', () => {
      // total = 300000 deposit - 5000 withdrawal = 295000 cents = 2950.00
      const wrapper = mountSummary();

      expect(wrapper.find('[data-testid="transaction-total"]').text()).toContain('2,950.00');
    });

    it('shows 0.00 when transactions are empty', () => {
      const wrapper = mountSummary({ transactions: [] });

      expect(wrapper.find('[data-testid="transaction-total"]').text()).toContain('0.00');
    });
  });

  describe('current bank balance', () => {
    it('shows last bank balance + transaction total', () => {
      // 100000 + 295000 = 395000 cents = 3950.00
      const wrapper = mountSummary({ bankAccount: primaryAccount });

      expect(wrapper.find('[data-testid="current-bank-balance"]').text()).toContain('3,950.00');
    });
  });

  describe('budget balance section', () => {
    it('shows budget balance section when bankAccount is the primary budget account', () => {
      const wrapper = mountSummary({ bankAccount: primaryAccount });

      expect(wrapper.find('[data-testid="budget-balance-section"]').exists()).toBe(true);
    });

    it('hides budget balance section for non-primary accounts', () => {
      const wrapper = mountSummary({ bankAccount: normalAccount });

      expect(wrapper.find('[data-testid="budget-balance-section"]').exists()).toBe(false);
    });

    it('shows current budget balance (sum of amount minus spent)', () => {
      // (20000 - 5000) + (100000 - 100000) = 15000 cents = 150.00
      const wrapper = mountSummary({ bankAccount: primaryAccount });

      expect(wrapper.find('[data-testid="current-budget-balance"]').text()).toContain('150.00');
    });

    it('shows budget difference (current bank balance - current budget balance)', () => {
      // 3950.00 - 150.00 = 3800.00
      const wrapper = mountSummary({ bankAccount: primaryAccount });

      expect(wrapper.find('[data-testid="budget-difference"]').text()).toContain('3,800.00');
    });
  });

  describe('unpaid balance section', () => {
    it('shows unpaid balance section for credit card accounts', () => {
      const wrapper = mountSummary({ bankAccount: creditCardAccount });

      expect(wrapper.find('[data-testid="unpaid-balance-section"]').exists()).toBe(true);
    });

    it('hides unpaid balance section for non-credit-card accounts', () => {
      const wrapper = mountSummary({ bankAccount: normalAccount });

      expect(wrapper.find('[data-testid="unpaid-balance-section"]').exists()).toBe(false);
    });

    it('shows unpaid balance (net amount of unpaid transactions)', () => {
      const creditTransactions: TransactionData[] = [
        { id: 1, description: 'Groceries', withdrawal_amount: 5000, deposit_amount: 0, status: 'unpaid', deleted: false },
        { id: 2, description: 'Paid item', withdrawal_amount: 2000, deposit_amount: 0, status: 'paid', deleted: false },
      ];
      // Unpaid: only id=1 — net_amount = 0 deposit - 5000 withdrawal = -5000 cents = -50.00
      const wrapper = mountSummary({ bankAccount: creditCardAccount, transactions: creditTransactions });

      const unpaidEl = wrapper.find('[data-testid="unpaid-balance"]');
      expect(unpaidEl.exists()).toBe(true);
      expect(unpaidEl.text()).toContain('50.00');
    });
  });

  describe('when no bank account', () => {
    it('does not show budget balance section', () => {
      const wrapper = mountSummary({ bankAccount: undefined });

      expect(wrapper.find('[data-testid="budget-balance-section"]').exists()).toBe(false);
    });

    it('does not show unpaid balance section', () => {
      const wrapper = mountSummary({ bankAccount: undefined });

      expect(wrapper.find('[data-testid="unpaid-balance-section"]').exists()).toBe(false);
    });
  });
});
