import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import TransactionList from './TransactionList.vue';
import type { TransactionData, AllocationData, SinkFundAllocationData, BudgetData } from './transaction.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';

// Selectors
const EDIT_BTN = '[data-testid="edit-btn"]';
const SAVE_BTN = '[data-testid="save-btn"]';
const CANCEL_BTN = '[data-testid="cancel-btn"]';
const ADD_BTN = '[data-testid="add-btn"]';
const IMPORT_BTN = '[data-testid="import-btn"]';
const TRANSFER_BTN = '[data-testid="transfer-btn"]';
const TRANSACTION_ROW = '[data-testid="transaction-row"]';
const ALLOCATION_HEADER = '[data-testid="allocation-header"]';

const checkingAccount: BankAccountData = { id: 1, name: 'Checking', is_sink_fund: false, is_credit_card: false };
const creditCardAccount: BankAccountData = { id: 2, name: 'Credit Card', is_sink_fund: false, is_credit_card: true };
const sinkFundAccount: BankAccountData = { id: 3, name: 'Sink Fund', is_sink_fund: true, is_credit_card: false };
const jan2025: BudgetData = { id: 1, name: 'Jan 2025', status: 'open', start_date: '2025-01-01', end_date: '2025-01-31' };

const sampleTransactions: TransactionData[] = [
  { id: 1, description: 'Groceries', withdrawal_amount: 5000, deposit_amount: 0, status: 'paid', transaction_date: '2025-01-05', deleted: false },
  { id: 2, description: 'Salary', withdrawal_amount: 0, deposit_amount: 300000, status: 'paid', transaction_date: '2025-01-01', deleted: false },
];

const sampleAllocations: AllocationData[] = [
  { id: 1, name: 'Food', amount: 20000, allocation_category_id: 1, allocation_category: { id: 1, name: 'Living' } },
];

const sampleSinkFundAllocations: SinkFundAllocationData[] = [
  { id: 10, name: 'Holiday Fund', amount: 50000 },
];

function createWrapper(props: {
  transactions?: TransactionData[];
  allocations?: AllocationData[];
  sinkFundAllocations?: SinkFundAllocationData[];
  bankAccount?: BankAccountData;
  budget?: BudgetData;
} = {}) {
  return mount(TransactionList, {
    props: {
      transactions: props.transactions ?? sampleTransactions,
      allocations: props.allocations ?? sampleAllocations,
      sinkFundAllocations: props.sinkFundAllocations ?? [],
      bankAccount: props.bankAccount ?? checkingAccount,
      budget: props.budget ?? jan2025,
    },
    global: {
      plugins: [PrimeVue, createPinia()],
    },
  });
}

describe('TransactionList', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('display mode (default)', () => {
    it('renders transaction descriptions', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Groceries');
      expect(wrapper.text()).toContain('Salary');
    });

    it('shows Edit button in display mode', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(EDIT_BTN).exists()).toBe(true);
    });

    it('does not show Save or Cancel buttons in display mode', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(SAVE_BTN).exists()).toBe(false);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(false);
    });

    it('does not show Add New Transaction button in display mode', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(ADD_BTN).exists()).toBe(false);
    });
  });

  describe('edit mode', () => {
    it('switches to edit mode when Edit button is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(EDIT_BTN).trigger('click');

      expect(wrapper.find(SAVE_BTN).exists()).toBe(true);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(true);
    });

    it('shows Add New Transaction button in edit mode', async () => {
      const wrapper = createWrapper();

      await wrapper.find(EDIT_BTN).trigger('click');

      expect(wrapper.find(ADD_BTN).exists()).toBe(true);
    });

    it('adds a new transaction row when Add New Transaction is clicked', async () => {
      const wrapper = createWrapper({ transactions: sampleTransactions });

      await wrapper.find(EDIT_BTN).trigger('click');
      await wrapper.find(ADD_BTN).trigger('click');
      await nextTick();

      const rows = wrapper.findAll(TRANSACTION_ROW);
      expect(rows.length).toBe(sampleTransactions.length + 1);
    });

    it('adds new transaction with status "unpaid" for credit card accounts', async () => {
      const wrapper = createWrapper({ bankAccount: creditCardAccount, transactions: [] });

      await wrapper.find(EDIT_BTN).trigger('click');
      await wrapper.find(ADD_BTN).trigger('click');
      await nextTick();
      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      const emitted = wrapper.emitted('save')!;
      const [savedTransactions] = emitted[0] as [TransactionData[]];
      expect(savedTransactions[0].status).toBe('unpaid');
    });

    it('adds new transaction with status "paid" for non-credit-card accounts', async () => {
      const wrapper = createWrapper({ bankAccount: checkingAccount, transactions: [] });

      await wrapper.find(EDIT_BTN).trigger('click');
      await wrapper.find(ADD_BTN).trigger('click');
      await nextTick();
      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      const emitted = wrapper.emitted('save')!;
      const [savedTransactions] = emitted[0] as [TransactionData[]];
      expect(savedTransactions[0].status).toBe('paid');
    });
  });

  describe('save event', () => {
    it('emits save with the current transactions when Save is clicked', async () => {
      const transactions = [...sampleTransactions];
      const wrapper = createWrapper({ transactions });

      await wrapper.find(EDIT_BTN).trigger('click');
      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      const emitted = wrapper.emitted('save');
      expect(emitted).toBeTruthy();
      const [firstEmit] = emitted!;
      const [savedTransactions] = firstEmit as [TransactionData[]];
      expect(savedTransactions).toEqual(transactions);
    });

    it('switches back to display mode after save', async () => {
      const wrapper = createWrapper();

      await wrapper.find(EDIT_BTN).trigger('click');
      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      expect(wrapper.find(EDIT_BTN).exists()).toBe(true);
      expect(wrapper.find(SAVE_BTN).exists()).toBe(false);
    });
  });

  describe('cancel event', () => {
    it('emits cancel when Cancel is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(EDIT_BTN).trigger('click');
      await wrapper.find(CANCEL_BTN).trigger('click');
      await nextTick();

      expect(wrapper.emitted('cancel')).toBeTruthy();
    });

    it('switches back to display mode on cancel', async () => {
      const wrapper = createWrapper();

      await wrapper.find(EDIT_BTN).trigger('click');
      await wrapper.find(CANCEL_BTN).trigger('click');
      await nextTick();

      expect(wrapper.find(EDIT_BTN).exists()).toBe(true);
      expect(wrapper.find(SAVE_BTN).exists()).toBe(false);
    });
  });

  describe('allocation column header', () => {
    it('shows "Allocation" header for normal accounts', () => {
      const wrapper = createWrapper({ bankAccount: checkingAccount });

      expect(wrapper.find(ALLOCATION_HEADER).text()).toBe('Allocation');
    });

    it('shows "Sink Fund Allocation" header for sink fund accounts', () => {
      const wrapper = createWrapper({ bankAccount: sinkFundAccount });

      expect(wrapper.find(ALLOCATION_HEADER).text()).toBe('Sink Fund Allocation');
    });
  });

  describe('delete transaction', () => {
    it('marks a transaction as deleted when delete button is clicked', async () => {
      const transactions = [
        { id: 1, description: 'Groceries', withdrawal_amount: 5000, deposit_amount: 0, status: 'paid', deleted: false },
      ];
      const wrapper = createWrapper({ transactions });

      await wrapper.find(EDIT_BTN).trigger('click');
      await wrapper.find('[data-testid="delete-btn-0"]').trigger('click');
      await nextTick();

      const rows = wrapper.findAll(TRANSACTION_ROW);
      expect(rows[0].classes()).toContain('transaction-row--deleted');
    });

    it('includes deleted transaction in save payload with deleted: true', async () => {
      const transactions = [
        { id: 1, description: 'Groceries', withdrawal_amount: 5000, deposit_amount: 0, status: 'paid', deleted: false },
      ];
      const wrapper = createWrapper({ transactions });

      await wrapper.find(EDIT_BTN).trigger('click');
      await wrapper.find('[data-testid="delete-btn-0"]').trigger('click');
      await wrapper.find(SAVE_BTN).trigger('click');
      await nextTick();

      const emitted = wrapper.emitted('save');
      expect(emitted).toBeTruthy();
      const [savedTransactions] = emitted![0] as [TransactionData[]];
      expect(savedTransactions[0].deleted).toBe(true);
    });
  });

  describe('Import and Transfer buttons', () => {
    it('shows Import button in edit mode (disabled)', async () => {
      const wrapper = createWrapper();

      await wrapper.find(EDIT_BTN).trigger('click');

      const importBtn = wrapper.find(IMPORT_BTN);
      expect(importBtn.exists()).toBe(true);
      expect(importBtn.attributes('disabled')).toBeDefined();
    });

    it('shows Transfer button in edit mode (disabled)', async () => {
      const wrapper = createWrapper();

      await wrapper.find(EDIT_BTN).trigger('click');

      const transferBtn = wrapper.find(TRANSFER_BTN);
      expect(transferBtn.exists()).toBe(true);
      expect(transferBtn.attributes('disabled')).toBeDefined();
    });
  });
});
