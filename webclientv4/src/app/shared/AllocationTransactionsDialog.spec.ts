import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import type { VueWrapper } from '@vue/test-utils';
import AllocationTransactionsDialog from './AllocationTransactionsDialog.vue';
import type { TransactionData } from '../transactions/transaction.types';

// Selectors
const LOADING_STATE = '[data-testid="loading-state"]';
const EMPTY_STATE = '[data-testid="empty-state"]';
const TRANSACTIONS_TABLE = '[data-testid="transactions-table"]';
const TRANSACTION_ROW = '[data-testid="transaction-row"]';
const TOTAL_ROW = '[data-testid="total-row"]';
const ERROR_STATE = '[data-testid="error-state"]';

// Stub PrimeVue Dialog to avoid teleport complexity in tests
const DialogStub = {
  name: 'Dialog',
  template: '<div><slot /><slot name="footer" /></div>',
  props: {
    visible: { type: Boolean },
    header: { type: String },
    modal: { type: Boolean },
    closable: { type: Boolean },
    style: { type: Object },
  },
  emits: ['update:visible'],
};

const sampleTransactions: TransactionData[] = [
  {
    id: 1,
    transaction_date: '2026-03-01',
    description: 'Supermarket',
    net_amount: -5000,
  },
  {
    id: 2,
    transaction_date: '2026-03-10',
    description: 'Corner store',
    net_amount: -1500,
  },
  {
    id: 3,
    transaction_date: '2026-03-15',
    description: 'Online groceries',
    net_amount: -3000,
  },
];

let mockFetchTransactions: ReturnType<typeof vi.fn>;

function createWrapper(props: Partial<{
  visible: boolean;
  allocationId: number;
  allocationName: string;
  fetchTransactions: (id: number) => Promise<TransactionData[]>;
}> = {}): VueWrapper<InstanceType<typeof AllocationTransactionsDialog>> {
  return mount(AllocationTransactionsDialog, {
    props: {
      visible: true,
      allocationId: 42,
      allocationName: 'Groceries',
      fetchTransactions: mockFetchTransactions,
      ...props,
    },
    global: {
      plugins: [PrimeVue, createPinia()],
      stubs: { Dialog: DialogStub },
    },
  });
}

describe('AllocationTransactionsDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockFetchTransactions = vi.fn().mockResolvedValue([]);
  });

  describe('dialog header', () => {
    it('passes the allocation name in the dialog header', () => {
      const wrapper = createWrapper({ allocationName: 'Groceries', visible: false });

      const dialog = wrapper.findComponent(DialogStub);
      expect(dialog.props('header')).toBe('Transactions for Groceries');
    });

    it('uses different allocation name in header', () => {
      const wrapper = createWrapper({ allocationName: 'Rent', visible: false });

      const dialog = wrapper.findComponent(DialogStub);
      expect(dialog.props('header')).toBe('Transactions for Rent');
    });
  });

  describe('dialog properties', () => {
    it('is modal', () => {
      const wrapper = createWrapper({ visible: false });

      const dialog = wrapper.findComponent(DialogStub);
      expect(dialog.props('modal')).toBe(true);
    });

    it('is closable', () => {
      const wrapper = createWrapper({ visible: false });

      const dialog = wrapper.findComponent(DialogStub);
      expect(dialog.props('closable')).toBe(true);
    });
  });

  describe('loading state', () => {
    it('shows loading message while fetching transactions', async () => {
      let resolvePromise: (value: TransactionData[]) => void;
      const pendingPromise = new Promise<TransactionData[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockFetchTransactions.mockReturnValue(pendingPromise);

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });

      expect(wrapper.find(LOADING_STATE).exists()).toBe(true);

      resolvePromise!(sampleTransactions);
      await flushPromises();
    });

    it('hides loading message after fetch completes', async () => {
      mockFetchTransactions.mockResolvedValue(sampleTransactions);

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect(wrapper.find(LOADING_STATE).exists()).toBe(false);
    });
  });

  describe('empty state', () => {
    it('shows empty message when no transactions exist', async () => {
      mockFetchTransactions.mockResolvedValue([]);

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect(wrapper.find(EMPTY_STATE).exists()).toBe(true);
      expect(wrapper.find(EMPTY_STATE).text()).toBe('No transactions found for this allocation.');
    });

    it('does not show table when empty', async () => {
      mockFetchTransactions.mockResolvedValue([]);

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect(wrapper.find(TRANSACTIONS_TABLE).exists()).toBe(false);
    });
  });

  describe('transaction list', () => {
    it('renders a row for each transaction', async () => {
      mockFetchTransactions.mockResolvedValue(sampleTransactions);

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      const rows = wrapper.findAll(TRANSACTION_ROW);
      expect(rows).toHaveLength(sampleTransactions.length);
    });

    it('displays transaction date', async () => {
      mockFetchTransactions.mockResolvedValue(sampleTransactions);

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      const firstRow = wrapper.findAll(TRANSACTION_ROW)[0];
      expect(firstRow.text()).toContain('01-03-2026');
    });

    it('displays transaction description', async () => {
      mockFetchTransactions.mockResolvedValue(sampleTransactions);

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      const firstRow = wrapper.findAll(TRANSACTION_ROW)[0];
      expect(firstRow.text()).toContain('Supermarket');
    });

    it('displays net_amount formatted as dollars', async () => {
      mockFetchTransactions.mockResolvedValue(sampleTransactions);

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      const firstRow = wrapper.findAll(TRANSACTION_ROW)[0];
      expect(firstRow.text()).toContain('-50.00');
    });

    it('shows three columns: Date, Description, Amount', async () => {
      mockFetchTransactions.mockResolvedValue(sampleTransactions);

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      const headers = wrapper.findAll('thead th');
      expect(headers).toHaveLength(3);
      expect(headers[0].text()).toBe('Date');
      expect(headers[1].text()).toBe('Description');
      expect(headers[2].text()).toBe('Amount');
    });
  });

  describe('total row', () => {
    it('shows the sum of all net_amounts', async () => {
      mockFetchTransactions.mockResolvedValue(sampleTransactions);

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      const totalRow = wrapper.find(TOTAL_ROW);
      expect(totalRow.text()).toContain('-95.00');
    });

    it('shows "Total" label', async () => {
      mockFetchTransactions.mockResolvedValue(sampleTransactions);

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      const totalRow = wrapper.find(TOTAL_ROW);
      expect(totalRow.text()).toContain('Total');
    });

    it('does not show total row when no transactions', async () => {
      mockFetchTransactions.mockResolvedValue([]);

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect(wrapper.find(TOTAL_ROW).exists()).toBe(false);
    });
  });

  describe('fetch interaction', () => {
    it('calls fetchTransactions when dialog becomes visible', async () => {
      const wrapper = createWrapper({ visible: false, allocationId: 42 });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect(mockFetchTransactions).toHaveBeenCalledWith(42);
    });

    it('does not fetch when dialog is hidden', () => {
      createWrapper({ visible: false });

      expect(mockFetchTransactions).not.toHaveBeenCalled();
    });

    it('clears previous transactions before fetching new ones', async () => {
      mockFetchTransactions
        .mockResolvedValueOnce(sampleTransactions)
        .mockResolvedValueOnce([]);

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect(wrapper.findAll(TRANSACTION_ROW)).toHaveLength(3);

      await wrapper.setProps({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect(wrapper.findAll(TRANSACTION_ROW)).toHaveLength(0);
    });
  });

  describe('visibility', () => {
    it('emits update:visible when dialog emits update:visible', async () => {
      const wrapper = createWrapper({ visible: true });

      const dialog = wrapper.findComponent(DialogStub);
      dialog.vm.$emit('update:visible', false);

      expect(wrapper.emitted('update:visible')).toEqual([[false]]);
    });
  });

  describe('edge cases', () => {
    it('handles transactions with undefined net_amount', async () => {
      const transactionsWithUndefined: TransactionData[] = [
        { id: 1, transaction_date: '2026-03-01', description: 'Test' },
      ];
      mockFetchTransactions.mockResolvedValue(transactionsWithUndefined);

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      const row = wrapper.find(TRANSACTION_ROW);
      expect(row.text()).toContain('0.00');
    });

    it('handles fetch error gracefully and shows error state', async () => {
      mockFetchTransactions.mockRejectedValue(new Error('Network error'));

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect(wrapper.find(LOADING_STATE).exists()).toBe(false);
      expect(wrapper.find(ERROR_STATE).exists()).toBe(true);
      expect(wrapper.find(ERROR_STATE).text()).toBe('Failed to load transactions.');
      expect(wrapper.find(EMPTY_STATE).exists()).toBe(false);
    });

    it('clears error state when dialog is reopened', async () => {
      mockFetchTransactions
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(sampleTransactions);

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect(wrapper.find(ERROR_STATE).exists()).toBe(true);

      await wrapper.setProps({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect(wrapper.find(ERROR_STATE).exists()).toBe(false);
      expect(wrapper.findAll(TRANSACTION_ROW)).toHaveLength(sampleTransactions.length);
    });
  });
});
