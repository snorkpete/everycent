import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import TransactionSummaryMobile from './TransactionSummaryMobile.vue';
import type { TransactionData, AllocationData } from './transaction.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';

const LAST_BANK_BALANCE = '[data-testid="last-bank-balance"]';
const TRANSACTION_TOTAL = '[data-testid="transaction-total"]';
const CURRENT_BANK_BALANCE = '[data-testid="current-bank-balance"]';
const BUDGET_DIFFERENCE = '[data-testid="budget-difference"]';
const UNPAID_BALANCE = '[data-testid="unpaid-balance"]';

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
  {
    id: 1,
    description: 'Groceries',
    withdrawal_amount: 5000,
    deposit_amount: 0,
    status: 'paid',
    deleted: false,
  },
  {
    id: 2,
    description: 'Salary',
    withdrawal_amount: 0,
    deposit_amount: 300000,
    status: 'paid',
    deleted: false,
  },
  {
    id: 3,
    description: 'Deleted',
    withdrawal_amount: 1000,
    deposit_amount: 0,
    status: 'paid',
    deleted: true,
  },
];

const allocations: AllocationData[] = [
  { id: 1, name: 'Food', amount: 20000, spent: 5000 },
  { id: 2, name: 'Rent', amount: 100000, spent: 100000 },
];

function createWrapper(
  props: {
    bankAccount?: BankAccountData;
    transactions?: TransactionData[];
    allocations?: AllocationData[];
  } = {},
): VueWrapper {
  return mount(TransactionSummaryMobile, {
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

describe('TransactionSummaryMobile', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockSettingsStore.settings = { primary_budget_account_id: primaryAccountId };
  });

  describe('layout', () => {
    it('renders last bank balance', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(LAST_BANK_BALANCE).exists()).toBe(true);
    });

    it('renders transaction total', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(TRANSACTION_TOTAL).exists()).toBe(true);
    });

    it('renders current bank balance', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(CURRENT_BANK_BALANCE).exists()).toBe(true);
    });
  });

  describe('last bank balance', () => {
    it('shows the closing balance of the bank account', () => {
      const wrapper = createWrapper({ bankAccount: primaryAccount });

      expect(wrapper.find(LAST_BANK_BALANCE).text()).toContain('1,000.00');
    });

    it('shows 0 when no bank account is provided', () => {
      const wrapper = createWrapper({ bankAccount: undefined });

      expect(wrapper.find(LAST_BANK_BALANCE).text()).toContain('0.00');
    });
  });

  describe('transaction total', () => {
    it('shows deposits minus withdrawals (excluding deleted)', () => {
      // total = 300000 deposit - 5000 withdrawal = 295000 cents = 2950.00
      const wrapper = createWrapper();

      expect(wrapper.find(TRANSACTION_TOTAL).text()).toContain('2,950.00');
    });

    it('shows 0.00 when transactions are empty', () => {
      const wrapper = createWrapper({ transactions: [] });

      expect(wrapper.find(TRANSACTION_TOTAL).text()).toContain('0.00');
    });
  });

  describe('current bank balance', () => {
    it('shows last bank balance + transaction total', () => {
      // 100000 + 295000 = 395000 cents = 3950.00
      const wrapper = createWrapper({ bankAccount: primaryAccount });

      expect(wrapper.find(CURRENT_BANK_BALANCE).text()).toContain('3,950.00');
    });
  });

  describe('budget difference (primary account)', () => {
    it('shows budget difference when bankAccount is the primary budget account', () => {
      const wrapper = createWrapper({ bankAccount: primaryAccount });

      expect(wrapper.find(BUDGET_DIFFERENCE).exists()).toBe(true);
    });

    it('hides budget difference for non-primary accounts', () => {
      const wrapper = createWrapper({ bankAccount: normalAccount });

      expect(wrapper.find(BUDGET_DIFFERENCE).exists()).toBe(false);
    });

    it('shows budget difference (current bank balance - current budget balance)', () => {
      // bank: 3950.00, budget: 150.00, diff: 3800.00
      const wrapper = createWrapper({ bankAccount: primaryAccount });

      expect(wrapper.find(BUDGET_DIFFERENCE).text()).toContain('3,800.00');
    });
  });

  describe('unpaid balance (credit card)', () => {
    it('shows unpaid balance for credit card accounts', () => {
      const wrapper = createWrapper({ bankAccount: creditCardAccount });

      expect(wrapper.find(UNPAID_BALANCE).exists()).toBe(true);
    });

    it('hides unpaid balance for non-credit-card accounts', () => {
      const wrapper = createWrapper({ bankAccount: normalAccount });

      expect(wrapper.find(UNPAID_BALANCE).exists()).toBe(false);
    });
  });

  describe('when no bank account', () => {
    it('does not show budget difference', () => {
      const wrapper = createWrapper({ bankAccount: undefined });

      expect(wrapper.find(BUDGET_DIFFERENCE).exists()).toBe(false);
    });

    it('does not show unpaid balance', () => {
      const wrapper = createWrapper({ bankAccount: undefined });

      expect(wrapper.find(UNPAID_BALANCE).exists()).toBe(false);
    });
  });
});
