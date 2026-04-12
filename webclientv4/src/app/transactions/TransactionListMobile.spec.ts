import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import TransactionListMobile from './TransactionListMobile.vue';
import EcListField from '../shared/form/list-field/EcListField.vue';
import { useTransactionStore } from './transactionStore';
import type { TransactionData, AllocationData, SinkFundAllocationData } from './transaction.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';

const TRANSACTION_CARD = '[data-testid="transaction-card"]';
const ADD_BTN = '[data-testid="add-btn"]';
const CARD_DETAIL = '[data-testid="card-detail"]';
const CARD_EDIT_DETAIL = '[data-testid="card-edit-detail"]';
const EMPTY_STATE = '[data-testid="empty-state"]';

const checkingAccount: BankAccountData = {
  id: 1,
  name: 'Checking',
  is_sink_fund: false,
  is_credit_card: false,
};
const sinkFundAccount: BankAccountData = {
  id: 3,
  name: 'Sink Fund',
  is_sink_fund: true,
  is_credit_card: false,
};

const sampleTransactions: TransactionData[] = [
  {
    id: 1,
    description: 'Groceries',
    withdrawal_amount: 5000,
    deposit_amount: 0,
    status: 'paid',
    transaction_date: '2025-01-05',
    deleted: false,
  },
  {
    id: 2,
    description: 'Salary',
    withdrawal_amount: 0,
    deposit_amount: 300000,
    status: 'paid',
    transaction_date: '2025-01-01',
    deleted: false,
  },
];

const sampleAllocations: AllocationData[] = [
  {
    id: 1,
    name: 'Food',
    amount: 20000,
    allocation_category_id: 1,
    allocation_category: { id: 1, name: 'Living' },
  },
];

const sampleSinkFundAllocations: SinkFundAllocationData[] = [
  { id: 10, name: 'Holiday Fund', amount: 50000 },
];

let pinia: Pinia;
let store: ReturnType<typeof useTransactionStore>;

function createWrapper(props: { dashIfZero?: boolean } = {}): VueWrapper {
  return mount(TransactionListMobile, {
    props,
    global: {
      plugins: [PrimeVue, pinia],
    },
  });
}

describe('TransactionListMobile', () => {
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    store = useTransactionStore();
    store.transactions = [...sampleTransactions];
    store.isEditMode = false;
    store.allocations = sampleAllocations;
    store.sinkFundAllocations = sampleSinkFundAllocations;
    store.selectedBankAccount = checkingAccount;
    vi.clearAllMocks();
  });

  describe('display mode', () => {
    it('renders transaction cards', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Groceries');
      expect(wrapper.text()).toContain('Salary');
    });

    it('shows correct number of transaction cards', () => {
      const wrapper = createWrapper();

      expect(wrapper.findAll(TRANSACTION_CARD)).toHaveLength(sampleTransactions.length);
    });

    it('shows short date format (DD/MM)', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('05/01');
      expect(wrapper.text()).toContain('01/01');
    });

    it('does not show Add New Transaction button in display mode', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(ADD_BTN).exists()).toBe(false);
    });

    it('shows empty state when no transactions', () => {
      store.transactions = [];
      const wrapper = createWrapper();

      expect(wrapper.find(EMPTY_STATE).exists()).toBe(true);
      expect(wrapper.text()).toContain('No transactions to display.');
    });
  });

  describe('card expand/collapse', () => {
    it('does not show detail section by default', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(false);
    });

    it('expands detail section when card is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.findAll(TRANSACTION_CARD)[0].trigger('click');
      await nextTick();

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(true);
    });

    it('collapses detail section when same card is clicked again', async () => {
      const wrapper = createWrapper();

      await wrapper.findAll(TRANSACTION_CARD)[0].trigger('click');
      await nextTick();
      await wrapper.findAll(TRANSACTION_CARD)[0].trigger('click');
      await nextTick();

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(false);
    });

    it('shows allocation name in expanded detail', async () => {
      store.transactions = [
        {
          id: 1,
          description: 'Groceries',
          withdrawal_amount: 5000,
          deposit_amount: 0,
          status: 'paid',
          transaction_date: '2025-01-05',
          deleted: false,
          allocation_id: 1,
        },
      ];
      const wrapper = createWrapper();

      await wrapper.findAll(TRANSACTION_CARD)[0].trigger('click');
      await nextTick();

      expect(wrapper.find('[data-testid="detail-allocation"]').text()).toContain('Food');
    });

    it('shows status in expanded detail', async () => {
      const wrapper = createWrapper();

      await wrapper.findAll(TRANSACTION_CARD)[0].trigger('click');
      await nextTick();

      const statusEl = wrapper.find('[data-testid="detail-status"]');
      expect(statusEl.exists()).toBe(true);
    });
  });

  describe('edit mode', () => {
    beforeEach(() => {
      store.isEditMode = true;
    });

    it('shows Add New Transaction button in edit mode', async () => {
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(ADD_BTN).exists()).toBe(true);
    });

    it('shows edit detail section for each card', async () => {
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.findAll(CARD_EDIT_DETAIL)).toHaveLength(sampleTransactions.length);
    });

    it('does not expand view detail on card click in edit mode', async () => {
      const wrapper = createWrapper();

      await wrapper.findAll(TRANSACTION_CARD)[0].trigger('click');
      await nextTick();

      expect(wrapper.find(CARD_DETAIL).exists()).toBe(false);
    });

    it('calls store.addTransaction when Add New Transaction is clicked', async () => {
      const wrapper = createWrapper();
      await nextTick();
      vi.spyOn(store, 'addTransaction');

      await wrapper.find(ADD_BTN).trigger('click');

      expect(store.addTransaction).toHaveBeenCalled();
    });
  });

  describe('edit mode — allocation dropdown', () => {
    beforeEach(() => {
      store.isEditMode = true;
    });

    it('shows the regular allocation dropdown for a normal account', async () => {
      store.selectedBankAccount = checkingAccount;
      store.transactions = [
        {
          id: 1,
          description: 'Groceries',
          withdrawal_amount: 5000,
          deposit_amount: 0,
          status: 'paid',
          deleted: false,
          allocation_id: 1,
        },
      ];
      const wrapper = createWrapper();
      await nextTick();

      const editDetail = wrapper.find(CARD_EDIT_DETAIL);
      const listField = editDetail.findComponent(EcListField);
      expect(listField.exists()).toBe(true);
      expect(listField.props('modelValue')).toBe(1);
      expect(listField.props('items')).toEqual(
        sampleAllocations
          .filter((a) => a.id != null && a.name != null)
          .map((a) => ({ ...a, id: a.id, name: a.name })),
      );
    });

    it('calls store.onAllocationChange when regular allocation is changed', async () => {
      store.selectedBankAccount = checkingAccount;
      store.transactions = [
        {
          id: 1,
          description: 'Groceries',
          withdrawal_amount: 5000,
          deposit_amount: 0,
          status: 'paid',
          deleted: false,
          allocation_id: undefined,
        },
      ];
      vi.spyOn(store, 'onAllocationChange');
      const wrapper = createWrapper();
      await nextTick();

      const editDetail = wrapper.find(CARD_EDIT_DETAIL);
      const listField = editDetail.findComponent(EcListField);
      await listField.vm.$emit('update:modelValue', 1);

      expect(store.onAllocationChange).toHaveBeenCalledWith(store.transactions[0], 1);
    });

    it('shows the sink fund allocation dropdown for a sink fund account', async () => {
      store.selectedBankAccount = sinkFundAccount;
      store.transactions = [
        {
          id: 1,
          description: 'Groceries',
          withdrawal_amount: 5000,
          deposit_amount: 0,
          status: 'paid',
          deleted: false,
          sink_fund_allocation_id: 10,
        },
      ];
      const wrapper = createWrapper();
      await nextTick();

      const editDetail = wrapper.find(CARD_EDIT_DETAIL);
      const listField = editDetail.findComponent(EcListField);
      expect(listField.exists()).toBe(true);
      expect(listField.props('modelValue')).toBe(10);
      expect(listField.props('items')).toEqual(
        sampleSinkFundAllocations
          .filter((a) => a.id != null && a.name != null)
          .map((a) => ({ ...a, id: a.id, name: a.name })),
      );
    });

    it('updates sink_fund_allocation_id when sink fund allocation is changed', async () => {
      store.selectedBankAccount = sinkFundAccount;
      store.transactions = [
        {
          id: 1,
          description: 'Groceries',
          withdrawal_amount: 5000,
          deposit_amount: 0,
          status: 'paid',
          deleted: false,
          sink_fund_allocation_id: undefined,
        },
      ];
      const wrapper = createWrapper();
      await nextTick();

      const editDetail = wrapper.find(CARD_EDIT_DETAIL);
      const listField = editDetail.findComponent(EcListField);
      await listField.vm.$emit('update:modelValue', 10);
      await nextTick();

      expect(store.transactions[0].sink_fund_allocation_id).toBe(10);
    });
  });

  describe('delete button', () => {
    beforeEach(() => {
      store.isEditMode = true;
    });

    it('calls store.deleteTransaction when delete button is clicked', async () => {
      store.transactions = [
        {
          id: 1,
          description: 'Groceries',
          withdrawal_amount: 5000,
          deposit_amount: 0,
          status: 'paid',
          deleted: false,
        },
      ];
      const wrapper = createWrapper();
      await nextTick();
      vi.spyOn(store, 'deleteTransaction');

      await wrapper.find('[data-testid="transaction-0-delete-btn"]').trigger('click');

      expect(store.deleteTransaction).toHaveBeenCalledWith(store.transactions[0]);
    });

    it('shows undo button for deleted transactions', async () => {
      store.transactions = [
        {
          id: 1,
          description: 'Groceries',
          withdrawal_amount: 5000,
          deposit_amount: 0,
          status: 'paid',
          deleted: true,
        },
      ];
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find('[data-testid="transaction-0-restore-btn"]').exists()).toBe(true);
    });

    it('calls store.undoDeleteTransaction when undo button is clicked', async () => {
      store.transactions = [
        {
          id: 1,
          description: 'Groceries',
          withdrawal_amount: 5000,
          deposit_amount: 0,
          status: 'paid',
          deleted: true,
        },
      ];
      const wrapper = createWrapper();
      await nextTick();
      vi.spyOn(store, 'undoDeleteTransaction');

      await wrapper.find('[data-testid="transaction-0-restore-btn"]').trigger('click');

      expect(store.undoDeleteTransaction).toHaveBeenCalledWith(store.transactions[0]);
    });
  });

  describe('deleted transaction display', () => {
    it('applies deleted class to cards where deleted is true', async () => {
      store.isEditMode = true;
      store.transactions = [
        {
          id: 1,
          description: 'Groceries',
          withdrawal_amount: 5000,
          deposit_amount: 0,
          status: 'paid',
          deleted: true,
        },
      ];
      const wrapper = createWrapper();
      await nextTick();

      const cards = wrapper.findAll(TRANSACTION_CARD);
      expect(cards[0].classes()).toContain('ec-deleted');
    });
  });
});
