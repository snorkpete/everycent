import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import TransactionList from './TransactionList.vue';
import { useTransactionStore } from './transactionStore';
import type { TransactionData, AllocationData, SinkFundAllocationData } from './transaction.types';
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
const sinkFundAccount: BankAccountData = { id: 3, name: 'Sink Fund', is_sink_fund: true, is_credit_card: false };

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

let pinia: Pinia;
let store: ReturnType<typeof useTransactionStore>;

function createWrapper(): VueWrapper {
  return mount(TransactionList, {
    global: {
      plugins: [PrimeVue, pinia],
    },
  });
}

describe('TransactionList', () => {
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    store = useTransactionStore();
    store.draftTransactions = [...sampleTransactions];
    store.isEditMode = false;
    store.allocations = sampleAllocations;
    store.sinkFundAllocations = sampleSinkFundAllocations;
    store.selectedBankAccount = checkingAccount;
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

    it('shows correct number of transaction rows', () => {
      const wrapper = createWrapper();

      expect(wrapper.findAll(TRANSACTION_ROW)).toHaveLength(sampleTransactions.length);
    });
  });

  describe('edit mode', () => {
    it('shows Save, Cancel, and Add buttons when store.isEditMode is true', async () => {
      store.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(SAVE_BTN).exists()).toBe(true);
      expect(wrapper.find(CANCEL_BTN).exists()).toBe(true);
      expect(wrapper.find(ADD_BTN).exists()).toBe(true);
    });

    it('hides Edit button when store.isEditMode is true', async () => {
      store.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(EDIT_BTN).exists()).toBe(false);
    });
  });

  describe('allocation column header', () => {
    it('shows "Allocation" header for normal accounts', () => {
      store.selectedBankAccount = checkingAccount;
      const wrapper = createWrapper();

      expect(wrapper.find(ALLOCATION_HEADER).text()).toBe('Allocation');
    });

    it('shows "Sink Fund Allocation" header for sink fund accounts', () => {
      store.selectedBankAccount = sinkFundAccount;
      const wrapper = createWrapper();

      expect(wrapper.find(ALLOCATION_HEADER).text()).toBe('Sink Fund Allocation');
    });
  });

  describe('Import and Transfer buttons', () => {
    it('shows Import button in edit mode (disabled)', async () => {
      store.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      const importBtn = wrapper.find(IMPORT_BTN);
      expect(importBtn.exists()).toBe(true);
      expect(importBtn.attributes('disabled')).toBeDefined();
    });

    it('shows Transfer button in edit mode (disabled)', async () => {
      store.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      const transferBtn = wrapper.find(TRANSFER_BTN);
      expect(transferBtn.exists()).toBe(true);
      expect(transferBtn.attributes('disabled')).toBeDefined();
    });
  });

  describe('delegation to store actions', () => {
    it('calls store.enterEditMode when Edit button is clicked', async () => {
      const wrapper = createWrapper();
      vi.spyOn(store, 'enterEditMode');

      await wrapper.find(EDIT_BTN).trigger('click');

      expect(store.enterEditMode).toHaveBeenCalled();
    });

    it('calls store.addTransaction when Add New Transaction is clicked', async () => {
      store.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();
      vi.spyOn(store, 'addTransaction');

      await wrapper.find(ADD_BTN).trigger('click');

      expect(store.addTransaction).toHaveBeenCalled();
    });

    it('calls store.deleteTransaction with the transaction when delete button is clicked', async () => {
      store.isEditMode = true;
      store.draftTransactions = [
        { id: 1, description: 'Groceries', withdrawal_amount: 5000, deposit_amount: 0, status: 'paid', deleted: false },
      ];
      const wrapper = createWrapper();
      await nextTick();
      vi.spyOn(store, 'deleteTransaction');

      await wrapper.find('[data-testid="delete-btn-0"]').trigger('click');

      expect(store.deleteTransaction).toHaveBeenCalledWith(store.draftTransactions[0]);
    });

    it('emits save signal (no data) when Save button is clicked', async () => {
      store.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(SAVE_BTN).trigger('click');

      expect(wrapper.emitted('save')).toBeTruthy();
      expect(wrapper.emitted('save')![0]).toEqual([]);
    });

    it('emits cancel signal (no data) when Cancel button is clicked', async () => {
      store.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(CANCEL_BTN).trigger('click');

      expect(wrapper.emitted('cancel')).toBeTruthy();
      expect(wrapper.emitted('cancel')![0]).toEqual([]);
    });
  });

  describe('deleted transaction display', () => {
    it('applies deleted class to rows where deleted is true', async () => {
      store.isEditMode = true;
      store.draftTransactions = [
        { id: 1, description: 'Groceries', withdrawal_amount: 5000, deposit_amount: 0, status: 'paid', deleted: true },
      ];
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(TRANSACTION_ROW);
      expect(rows[0].classes()).toContain('transaction-row--deleted');
    });
  });
});
