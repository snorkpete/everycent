import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import TransactionList from './TransactionList.vue';
import type { TransactionData, AllocationData, SinkFundAllocationData, BudgetData } from './transaction.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';

const checkingAccount: BankAccountData = { id: 1, name: 'Checking', is_sink_fund: false, is_credit_card: false };
const creditCardAccount: BankAccountData = { id: 2, name: 'Credit Card', is_sink_fund: false, is_credit_card: true };
const sinkFundAccount: BankAccountData = { id: 3, name: 'Sink Fund', is_sink_fund: true, is_credit_card: false };
const jan2025: BudgetData = { id: 1, name: 'Jan 2025', status: 'open', start_date: '2025-01-01', end_date: '2025-01-31' };

const sampleTransactions: TransactionData[] = [
  { id: 1, description: 'Groceries', withdrawal_amount: 5000, deposit_amount: 0, status: 'paid', transaction_date: '2025-01-05' },
  { id: 2, description: 'Salary', withdrawal_amount: 0, deposit_amount: 300000, status: 'paid', transaction_date: '2025-01-01' },
];

const sampleAllocations: AllocationData[] = [
  { id: 1, name: 'Food', amount: 20000, allocation_category_id: 1, allocation_category: { id: 1, name: 'Living' } },
];

const sampleSinkFundAllocations: SinkFundAllocationData[] = [
  { id: 10, name: 'Holiday Fund', amount: 50000 },
];

function mountList(props: {
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
      const wrapper = mountList();

      expect(wrapper.text()).toContain('Groceries');
      expect(wrapper.text()).toContain('Salary');
    });

    it('shows Edit button in display mode', () => {
      const wrapper = mountList();

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
    });

    it('does not show Save or Cancel buttons in display mode', () => {
      const wrapper = mountList();

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(false);
    });

    it('does not show Add New Transaction button in display mode', () => {
      const wrapper = mountList();

      expect(wrapper.find('[data-testid="add-btn"]').exists()).toBe(false);
    });
  });

  describe('edit mode', () => {
    it('switches to edit mode when Edit button is clicked', async () => {
      const wrapper = mountList();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="cancel-btn"]').exists()).toBe(true);
    });

    it('shows Add New Transaction button in edit mode', async () => {
      const wrapper = mountList();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      expect(wrapper.find('[data-testid="add-btn"]').exists()).toBe(true);
    });

    it('adds a new transaction row when Add New Transaction is clicked', async () => {
      const wrapper = mountList({ transactions: [...sampleTransactions] });

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="add-btn"]').trigger('click');
      await nextTick();

      const rows = wrapper.findAll('[data-testid="transaction-row"]');
      expect(rows.length).toBe(sampleTransactions.length + 1);
    });

    it('adds new transaction with status "unpaid" for credit card accounts', async () => {
      const wrapper = mountList({ bankAccount: creditCardAccount, transactions: [] });

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="add-btn"]').trigger('click');
      await nextTick();

      const rows = wrapper.findAll('[data-testid="transaction-row"]');
      expect(rows.length).toBe(1);
    });

    it('adds new transaction with status "paid" for non-credit-card accounts', async () => {
      const wrapper = mountList({ bankAccount: checkingAccount, transactions: [] });

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="add-btn"]').trigger('click');
      await nextTick();

      const rows = wrapper.findAll('[data-testid="transaction-row"]');
      expect(rows.length).toBe(1);
    });
  });

  describe('save event', () => {
    it('emits save with the current transactions when Save is clicked', async () => {
      const transactions = [...sampleTransactions];
      const wrapper = mountList({ transactions });

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await nextTick();

      const saveEmissions = wrapper.emitted('save');
      expect(saveEmissions).toBeTruthy();
      expect(saveEmissions![0][0]).toEqual(transactions);
    });

    it('switches back to display mode after save', async () => {
      const wrapper = mountList();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await nextTick();

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(false);
    });
  });

  describe('cancel event', () => {
    it('emits cancel when Cancel is clicked', async () => {
      const wrapper = mountList();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');
      await nextTick();

      expect(wrapper.emitted('cancel')).toBeTruthy();
    });

    it('switches back to display mode on cancel', async () => {
      const wrapper = mountList();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');
      await nextTick();

      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(false);
    });
  });

  describe('allocation column header', () => {
    it('shows "Allocation" header for normal accounts', () => {
      const wrapper = mountList({ bankAccount: checkingAccount });

      expect(wrapper.find('[data-testid="allocation-header"]').text()).toBe('Allocation');
    });

    it('shows "Sink Fund Allocation" header for sink fund accounts', () => {
      const wrapper = mountList({ bankAccount: sinkFundAccount });

      expect(wrapper.find('[data-testid="allocation-header"]').text()).toBe('Sink Fund Allocation');
    });
  });

  describe('delete transaction', () => {
    it('marks a transaction as deleted when delete button is clicked', async () => {
      const transactions = [
        { id: 1, description: 'Groceries', withdrawal_amount: 5000, deposit_amount: 0, status: 'paid', deleted: false },
      ];
      const wrapper = mountList({ transactions });

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="delete-btn-0"]').trigger('click');
      await nextTick();

      // Verify both the visual state and the underlying data mutation
      const rows = wrapper.findAll('[data-testid="transaction-row"]');
      expect(rows[0].classes()).toContain('transaction-row--deleted');
    });

    it('includes deleted transaction in save payload with deleted: true', async () => {
      const transactions = [
        { id: 1, description: 'Groceries', withdrawal_amount: 5000, deposit_amount: 0, status: 'paid', deleted: false },
      ];
      const wrapper = mountList({ transactions });

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="delete-btn-0"]').trigger('click');
      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await nextTick();

      const saveEmissions = wrapper.emitted('save');
      expect(saveEmissions).toBeTruthy();
      const savedTransactions = saveEmissions![0][0] as TransactionData[];
      expect(savedTransactions[0].deleted).toBe(true);
    });
  });

  describe('Import and Transfer buttons', () => {
    it('shows Import button in edit mode (disabled)', async () => {
      const wrapper = mountList();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      const importBtn = wrapper.find('[data-testid="import-btn"]');
      expect(importBtn.exists()).toBe(true);
      expect(importBtn.attributes('disabled')).toBeDefined();
    });

    it('shows Transfer button in edit mode (disabled)', async () => {
      const wrapper = mountList();

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');

      const transferBtn = wrapper.find('[data-testid="transfer-btn"]');
      expect(transferBtn.exists()).toBe(true);
      expect(transferBtn.attributes('disabled')).toBeDefined();
    });
  });
});
