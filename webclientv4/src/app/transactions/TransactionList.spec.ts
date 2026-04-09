import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, ref } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import TransactionList from './TransactionList.vue';
import EcListField from '../shared/form/list-field/EcListField.vue';
import { useTransactionStore } from './transactionStore';
import type { TransactionData, AllocationData, SinkFundAllocationData } from './transaction.types';
import type { BankAccountData } from '../bank-accounts/bankAccount.types';

const isMobile = ref(false);
vi.mock('../shared/composables/useResponsive', () => ({
  useResponsive: () => ({
    isMobile,
    isCompact: ref(false),
  }),
}));

// Selectors
const ADD_BTN = '[data-testid="add-btn"]';
const TRANSACTION_ROW = '[data-testid="transaction-row"]';
const ALLOCATION_HEADER = '[data-testid="allocation-header"]';
const PAID_ICON = '[data-testid="paid-icon"]';

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

function createWrapper(
  props: { wrapDescriptions?: boolean; showCalculatorColumn?: boolean } = {},
): VueWrapper {
  return mount(TransactionList, {
    props,
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
    store.transactions = [...sampleTransactions];
    store.isEditMode = false;
    store.allocations = sampleAllocations;
    store.sinkFundAllocations = sampleSinkFundAllocations;
    store.selectedBankAccount = checkingAccount;
    isMobile.value = false;
    vi.clearAllMocks();
  });

  describe('display mode (default)', () => {
    it('renders transaction descriptions', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Groceries');
      expect(wrapper.text()).toContain('Salary');
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
    it('shows Add button in tfoot when store.isEditMode is true', async () => {
      store.isEditMode = true;
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(ADD_BTN).exists()).toBe(true);
    });

    it('hides Add button when store.isEditMode is false', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(ADD_BTN).exists()).toBe(false);
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

  describe('paid column', () => {
    it('shows checkmark icon for paid transactions in view mode', () => {
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

      expect(wrapper.find(PAID_ICON).exists()).toBe(true);
    });

    it('does not show checkmark icon for unpaid transactions in view mode', () => {
      store.transactions = [
        {
          id: 1,
          description: 'Groceries',
          withdrawal_amount: 5000,
          deposit_amount: 0,
          status: 'unpaid',
          deleted: false,
        },
      ];
      const wrapper = createWrapper();

      expect(wrapper.find(PAID_ICON).exists()).toBe(false);
    });

    it('shows checkbox in edit mode instead of icon', async () => {
      store.isEditMode = true;
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

      expect(wrapper.find(PAID_ICON).exists()).toBe(false);
    });
  });

  describe('calculator column', () => {
    it('does not show calculator checkboxes when showCalculatorColumn is false', () => {
      const wrapper = createWrapper({ showCalculatorColumn: false });

      expect(wrapper.find('[data-testid="calculator-checkbox-0"]').exists()).toBe(false);
    });

    it('does not show calculator checkboxes by default', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="calculator-checkbox-0"]').exists()).toBe(false);
    });

    it('shows calculator checkboxes when showCalculatorColumn is true', () => {
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
      const wrapper = createWrapper({ showCalculatorColumn: true });

      expect(wrapper.find('[data-testid="calculator-checkbox-0"]').exists()).toBe(true);
    });
  });

  describe('description wrap/truncate toggle', () => {
    it('applies truncate class by default', () => {
      const wrapper = createWrapper();

      const descCells = wrapper.findAll('td.col-description');
      expect(descCells[0].classes()).toContain('col-description--truncate');
    });

    it('applies truncate class when wrapDescriptions is false', () => {
      const wrapper = createWrapper({ wrapDescriptions: false });

      const descCells = wrapper.findAll('td.col-description');
      expect(descCells[0].classes()).toContain('col-description--truncate');
    });

    it('applies wrap class when wrapDescriptions is true', () => {
      const wrapper = createWrapper({ wrapDescriptions: true });

      const descCells = wrapper.findAll('td.col-description');
      expect(descCells[0].classes()).toContain('col-description--wrap');
    });
  });

  describe('delegation to store actions', () => {
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
  });

  describe('undo delete', () => {
    it('hides delete button for already-deleted transactions', async () => {
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

      expect(wrapper.find('[data-testid="transaction-0-delete-btn"]').exists()).toBe(false);
    });

    it('shows undo button for deleted transactions', async () => {
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

      expect(wrapper.find('[data-testid="transaction-0-restore-btn"]').exists()).toBe(true);
    });

    it('calls store.undoDeleteTransaction when undo button is clicked', async () => {
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
      vi.spyOn(store, 'undoDeleteTransaction');

      await wrapper.find('[data-testid="transaction-0-restore-btn"]').trigger('click');

      expect(store.undoDeleteTransaction).toHaveBeenCalledWith(store.transactions[0]);
    });
  });

  describe('deleted transaction display', () => {
    it('applies deleted class to rows where deleted is true', async () => {
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

      const rows = wrapper.findAll(TRANSACTION_ROW);
      expect(rows[0].classes()).toContain('ec-deleted');
    });
  });

  describe('mobile edit mode allocation row', () => {
    beforeEach(() => {
      isMobile.value = true;
      store.isEditMode = true;
    });

    it('shows an allocation dropdown row for each transaction in mobile edit mode', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const allocationRows = wrapper.findAll('.mobile-edit-allocation-row');
      expect(allocationRows).toHaveLength(sampleTransactions.length);
    });

    it('does not show the allocation dropdown row in mobile view mode', async () => {
      store.isEditMode = false;
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find('.mobile-edit-allocation-row').exists()).toBe(false);
    });

    it('does not show the allocation dropdown row on desktop in edit mode', async () => {
      isMobile.value = false;
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find('.mobile-edit-allocation-row').exists()).toBe(false);
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

      const allocationRow = wrapper.find('.mobile-edit-allocation-row');
      const listField = allocationRow.findComponent(EcListField);
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

      const allocationRow = wrapper.find('.mobile-edit-allocation-row');
      const listField = allocationRow.findComponent(EcListField);
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

      const allocationRow = wrapper.find('.mobile-edit-allocation-row');
      const listField = allocationRow.findComponent(EcListField);
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

      const allocationRow = wrapper.find('.mobile-edit-allocation-row');
      const listField = allocationRow.findComponent(EcListField);
      await listField.vm.$emit('update:modelValue', 10);
      await nextTick();

      expect(store.transactions[0].sink_fund_allocation_id).toBe(10);
    });
  });
});
