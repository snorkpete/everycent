import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reactive } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import TransactionSummary from './TransactionSummary.vue';
import type { TransactionData, AllocationData } from './transaction.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';

const LAST_BANK_BALANCE = '[data-testid="last-bank-balance"]';
const TRANSACTION_TOTAL = '[data-testid="transaction-total"]';
const CURRENT_BANK_BALANCE = '[data-testid="current-bank-balance"]';
const SUMMARY_ROW_2 = '[data-testid="summary-row-2"]';
const CURRENT_BUDGET_BALANCE = '[data-testid="current-budget-balance"]';
const BUDGET_DIFFERENCE = '[data-testid="budget-difference"]';
const UNPAID_BALANCE = '[data-testid="unpaid-balance"]';
const UNPAID_DIFFERENCE = '[data-testid="unpaid-difference"]';
const CALCULATOR_TOTAL = '[data-testid="calculator-total"]';
const CALCULATOR_CLEAR_BTN = '[data-testid="calculator-clear-btn"]';

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

const mockTransactionStore = reactive({
  selectedTransactions: [] as { net_amount?: number; selected?: boolean }[],
  selectedTotal: 0,
  clearSelections: vi.fn(),
});

vi.mock('./transactionStore', () => ({
  useTransactionStore: () => mockTransactionStore,
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

function createWrapper(props: {
  bankAccount?: BankAccountData;
  transactions?: TransactionData[];
  allocations?: AllocationData[];
} = {}): VueWrapper {
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
    mockTransactionStore.selectedTransactions = [];
    mockTransactionStore.selectedTotal = 0;
  });

  describe('layout', () => {
    it('renders three columns in row 1', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(LAST_BANK_BALANCE).exists()).toBe(true);
      expect(wrapper.find(TRANSACTION_TOTAL).exists()).toBe(true);
      expect(wrapper.find(CURRENT_BANK_BALANCE).exists()).toBe(true);
    });

    it('always renders row 2', () => {
      const wrapper = createWrapper({ bankAccount: normalAccount });

      expect(wrapper.find(SUMMARY_ROW_2).exists()).toBe(true);
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

  describe('budget balance fields (primary account)', () => {
    it('shows budget balance when bankAccount is the primary budget account', () => {
      const wrapper = createWrapper({ bankAccount: primaryAccount });

      expect(wrapper.find(CURRENT_BUDGET_BALANCE).exists()).toBe(true);
    });

    it('hides budget balance for non-primary accounts', () => {
      const wrapper = createWrapper({ bankAccount: normalAccount });

      expect(wrapper.find(CURRENT_BUDGET_BALANCE).exists()).toBe(false);
    });

    it('shows current budget balance (sum of amount minus spent)', () => {
      // (20000 - 5000) + (100000 - 100000) = 15000 cents = 150.00
      const wrapper = createWrapper({ bankAccount: primaryAccount });

      expect(wrapper.find(CURRENT_BUDGET_BALANCE).text()).toContain('150.00');
    });

    it('shows budget difference (current bank balance - current budget balance)', () => {
      // 3950.00 - 150.00 = 3800.00
      const wrapper = createWrapper({ bankAccount: primaryAccount });

      expect(wrapper.find(BUDGET_DIFFERENCE).text()).toContain('3,800.00');
    });
  });

  describe('unpaid balance fields (credit card)', () => {
    it('shows unpaid balance for credit card accounts', () => {
      const wrapper = createWrapper({ bankAccount: creditCardAccount });

      expect(wrapper.find(UNPAID_BALANCE).exists()).toBe(true);
    });

    it('hides unpaid balance for non-credit-card accounts', () => {
      const wrapper = createWrapper({ bankAccount: normalAccount });

      expect(wrapper.find(UNPAID_BALANCE).exists()).toBe(false);
    });

    it('shows unpaid balance (net amount of unpaid transactions)', () => {
      const creditTransactions: TransactionData[] = [
        { id: 1, description: 'Groceries', withdrawal_amount: 5000, deposit_amount: 0, status: 'unpaid', deleted: false },
        { id: 2, description: 'Paid item', withdrawal_amount: 2000, deposit_amount: 0, status: 'paid', deleted: false },
      ];
      const wrapper = createWrapper({ bankAccount: creditCardAccount, transactions: creditTransactions });

      const unpaidEl = wrapper.find(UNPAID_BALANCE);
      expect(unpaidEl.exists()).toBe(true);
      expect(unpaidEl.text()).toContain('50.00');
    });

    it('shows unpaid difference for credit card accounts', () => {
      const wrapper = createWrapper({ bankAccount: creditCardAccount });

      expect(wrapper.find(UNPAID_DIFFERENCE).exists()).toBe(true);
    });

    it('hides unpaid difference for non-credit-card accounts', () => {
      const wrapper = createWrapper({ bankAccount: normalAccount });

      expect(wrapper.find(UNPAID_DIFFERENCE).exists()).toBe(false);
    });
  });

  describe('when no bank account', () => {
    it('does not show budget balance fields', () => {
      const wrapper = createWrapper({ bankAccount: undefined });

      expect(wrapper.find(CURRENT_BUDGET_BALANCE).exists()).toBe(false);
      expect(wrapper.find(BUDGET_DIFFERENCE).exists()).toBe(false);
    });

    it('does not show unpaid balance fields', () => {
      const wrapper = createWrapper({ bankAccount: undefined });

      expect(wrapper.find(UNPAID_BALANCE).exists()).toBe(false);
      expect(wrapper.find(UNPAID_DIFFERENCE).exists()).toBe(false);
    });
  });

  describe('calculator total (inline)', () => {
    it('is hidden when no transactions are selected', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(CALCULATOR_TOTAL).exists()).toBe(false);
    });

    it('shows the selected total when transactions are selected', () => {
      mockTransactionStore.selectedTransactions = [{ net_amount: 5000, selected: true }];
      mockTransactionStore.selectedTotal = 5000;

      const wrapper = createWrapper();

      expect(wrapper.find(CALCULATOR_TOTAL).exists()).toBe(true);
      expect(wrapper.find(CALCULATOR_TOTAL).text()).toContain('50.00');
    });

    it('shows negative totals correctly', () => {
      mockTransactionStore.selectedTransactions = [{ net_amount: -15050, selected: true }];
      mockTransactionStore.selectedTotal = -15050;

      const wrapper = createWrapper();

      expect(wrapper.find(CALCULATOR_TOTAL).text()).toContain('-150.50');
    });

    it('shows clear button when transactions are selected', () => {
      mockTransactionStore.selectedTransactions = [{ net_amount: 5000, selected: true }];
      mockTransactionStore.selectedTotal = 5000;

      const wrapper = createWrapper();

      expect(wrapper.find(CALCULATOR_CLEAR_BTN).exists()).toBe(true);
    });

    it('calls clearSelections when clear button is clicked', async () => {
      mockTransactionStore.selectedTransactions = [{ net_amount: 5000, selected: true }];
      mockTransactionStore.selectedTotal = 5000;

      const wrapper = createWrapper();
      await wrapper.find(CALCULATOR_CLEAR_BTN).trigger('click');

      expect(mockTransactionStore.clearSelections).toHaveBeenCalled();
    });

    it('shows calculator total alongside budget balance fields for primary account', () => {
      mockTransactionStore.selectedTransactions = [{ net_amount: 3000, selected: true }];
      mockTransactionStore.selectedTotal = 3000;

      const wrapper = createWrapper({ bankAccount: primaryAccount });

      expect(wrapper.find(CURRENT_BUDGET_BALANCE).exists()).toBe(true);
      expect(wrapper.find(CALCULATOR_TOTAL).exists()).toBe(true);
      expect(wrapper.find(BUDGET_DIFFERENCE).exists()).toBe(true);
    });

    it('shows calculator total on a regular account with no other row 2 fields', () => {
      mockTransactionStore.selectedTransactions = [{ net_amount: 7000, selected: true }];
      mockTransactionStore.selectedTotal = 7000;

      const wrapper = createWrapper({ bankAccount: normalAccount });

      expect(wrapper.find(CURRENT_BUDGET_BALANCE).exists()).toBe(false);
      expect(wrapper.find(UNPAID_BALANCE).exists()).toBe(false);
      expect(wrapper.find(CALCULATOR_TOTAL).exists()).toBe(true);
      expect(wrapper.find(CALCULATOR_TOTAL).text()).toContain('70.00');
    });
  });
});
