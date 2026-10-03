import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import type { VueWrapper } from '@vue/test-utils';
import AllocationTransactionsDialog from './AllocationTransactionsDialog.vue';
import AllocationTransactionsSections from './AllocationTransactionsSections.vue';
import AllocationTransactionsTable from './AllocationTransactionsTable.vue';
import type { TransactionData } from '../transactions/transaction.types';
import type { TransactionsDialogAllocation } from './allocationTransactions.types';
import { DialogStub } from '../../test/stubs';

// Selectors
const LOADING_STATE = '[data-testid="loading-state"]';
const EMPTY_STATE = '[data-testid="empty-state"]';
const TRANSACTIONS_TABLE = '[data-testid="transactions-table"]';
const TRANSACTION_ROW = '[data-testid="transaction-row"]';
const TOTAL_ROW = '[data-testid="total-row"]';
const ERROR_STATE = '[data-testid="error-state"]';
const SECTION = '[data-testid="transactions-section"]';
const SECTION_HEADING = '[data-testid="section-heading"]';

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

let mockFetchTransactions: ReturnType<typeof vi.fn<(id: number) => Promise<TransactionData[]>>>;

function createWrapper(
  props: Partial<{
    visible: boolean;
    allocationId: number;
    allocationName: string;
    allocations: TransactionsDialogAllocation[];
    fetchTransactions: (id: number) => Promise<TransactionData[]>;
  }> = {},
): VueWrapper<InstanceType<typeof AllocationTransactionsDialog>> {
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
      mockFetchTransactions.mockResolvedValueOnce(sampleTransactions).mockResolvedValueOnce([]);

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

  describe('multiple allocations', () => {
    const julyAllocation: TransactionsDialogAllocation = {
      id: 1,
      name: 'Food',
      label: 'Jul 2024',
    };
    const augustAllocation: TransactionsDialogAllocation = {
      id: 2,
      name: 'Food',
      label: 'Aug 2024',
    };
    const augustTransactions: TransactionData[] = [
      { id: 10, transaction_date: '2024-08-02', description: 'Bakery', net_amount: -2000 },
    ];

    function mockByAllocation() {
      mockFetchTransactions.mockImplementation(async (id: number) =>
        id === 1 ? sampleTransactions : augustTransactions,
      );
    }

    async function openWithTwoAllocations(): Promise<
      VueWrapper<InstanceType<typeof AllocationTransactionsDialog>>
    > {
      const wrapper = createWrapper({
        visible: false,
        allocationId: 1,
        allocationName: 'Food',
        allocations: [julyAllocation, augustAllocation],
      });
      await wrapper.setProps({ visible: true });
      await flushPromises();
      return wrapper;
    }

    function deferredFetches() {
      const resolvers = new Map<number, (value: TransactionData[]) => void>();
      const rejecters = new Map<number, (reason: Error) => void>();
      mockFetchTransactions.mockImplementation(
        (id: number) =>
          new Promise<TransactionData[]>((resolve, reject) => {
            resolvers.set(id, resolve);
            rejecters.set(id, reject);
          }),
      );
      return { resolvers, rejecters };
    }

    it('fetches every allocation when opened', async () => {
      mockByAllocation();

      await openWithTwoAllocations();

      expect(mockFetchTransactions).toHaveBeenCalledTimes(2);
      expect(mockFetchTransactions).toHaveBeenCalledWith(1);
      expect(mockFetchTransactions).toHaveBeenCalledWith(2);
    });

    it('fetches in parallel', async () => {
      const { resolvers } = deferredFetches();

      const wrapper = createWrapper({
        visible: false,
        allocations: [julyAllocation, augustAllocation],
      });
      await wrapper.setProps({ visible: true });

      expect(mockFetchTransactions).toHaveBeenCalledTimes(2);

      resolvers.forEach((resolve) => resolve([]));
      await flushPromises();
    });

    it('keeps the title from allocationName', () => {
      const wrapper = createWrapper({
        visible: false,
        allocationName: 'Food',
        allocations: [julyAllocation, augustAllocation],
      });

      expect(wrapper.findComponent(DialogStub).props('header')).toBe('Transactions for Food');
    });

    it('swaps to the sectioned display, not the single table total', async () => {
      mockByAllocation();

      const wrapper = await openWithTwoAllocations();

      expect(wrapper.findComponent(AllocationTransactionsSections).exists()).toBe(true);
      expect(wrapper.findComponent(AllocationTransactionsTable).exists()).toBe(false);
      expect(wrapper.find(TOTAL_ROW).exists()).toBe(false);
    });

    it('uses the single table display when allocations is not passed', async () => {
      mockFetchTransactions.mockResolvedValue(sampleTransactions);

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect(wrapper.findComponent(AllocationTransactionsTable).exists()).toBe(true);
      expect(wrapper.findComponent(AllocationTransactionsSections).exists()).toBe(false);
      expect(wrapper.find(SECTION_HEADING).exists()).toBe(false);
    });

    it('passes one section per allocation, in the given order', async () => {
      mockByAllocation();

      const wrapper = await openWithTwoAllocations();

      const sections = wrapper.findComponent(AllocationTransactionsSections).props('sections');
      expect(sections.map((section) => section.allocation.id)).toEqual([1, 2]);
      expect(sections[1].transactions).toEqual(augustTransactions);
    });

    it('shows the error state when any fetch fails', async () => {
      mockFetchTransactions.mockImplementation(async (id: number) => {
        if (id === 2) throw new Error('Network error');
        return sampleTransactions;
      });

      const wrapper = await openWithTwoAllocations();

      expect(wrapper.find(ERROR_STATE).exists()).toBe(true);
      expect(wrapper.find(SECTION).exists()).toBe(false);
    });

    it('shows the empty state when no section has transactions', async () => {
      const wrapper = await openWithTwoAllocations();

      expect(wrapper.find(EMPTY_STATE).exists()).toBe(true);
      expect(wrapper.find(SECTION).exists()).toBe(false);
    });

    it('keeps the display chosen at open when allocations changes while open', async () => {
      mockByAllocation();
      const wrapper = await openWithTwoAllocations();

      await wrapper.setProps({ allocations: undefined });

      expect(wrapper.findComponent(AllocationTransactionsSections).exists()).toBe(true);
      expect(wrapper.findComponent(AllocationTransactionsTable).exists()).toBe(false);
    });

    it('does not fetch when allocations is empty', async () => {
      const wrapper = createWrapper({ visible: false, allocations: [] });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect(mockFetchTransactions).not.toHaveBeenCalled();
      expect(wrapper.find(EMPTY_STATE).exists()).toBe(true);
    });

    it('ignores a slower earlier request when reopened with different allocations', async () => {
      const { resolvers } = deferredFetches();

      const wrapper = createWrapper({ visible: false, allocations: [julyAllocation] });
      await wrapper.setProps({ visible: true });
      await wrapper.setProps({ visible: false });
      await wrapper.setProps({ allocations: [augustAllocation] });
      await wrapper.setProps({ visible: true });

      resolvers.get(2)!(augustTransactions);
      await flushPromises();
      resolvers.get(1)!(sampleTransactions);
      await flushPromises();

      expect(wrapper.findAll(TRANSACTION_ROW)).toHaveLength(1);
      expect(wrapper.find(LOADING_STATE).exists()).toBe(false);
    });

    it('keeps loading until the latest request settles', async () => {
      const { resolvers } = deferredFetches();

      const wrapper = createWrapper({ visible: false, allocations: [julyAllocation] });
      await wrapper.setProps({ visible: true });
      await wrapper.setProps({ visible: false });
      await wrapper.setProps({ allocations: [augustAllocation] });
      await wrapper.setProps({ visible: true });

      resolvers.get(1)!(sampleTransactions);
      await flushPromises();

      expect(wrapper.find(LOADING_STATE).exists()).toBe(true);

      resolvers.get(2)!([]);
      await flushPromises();
    });

    it('ignores a stale failure from an earlier request', async () => {
      const { resolvers, rejecters } = deferredFetches();

      const wrapper = createWrapper({ visible: false, allocations: [julyAllocation] });
      await wrapper.setProps({ visible: true });
      await wrapper.setProps({ visible: false });
      await wrapper.setProps({ allocations: [augustAllocation] });
      await wrapper.setProps({ visible: true });

      rejecters.get(1)!(new Error('late failure'));
      await flushPromises();
      resolvers.get(2)!(sampleTransactions);
      await flushPromises();

      expect(wrapper.find(ERROR_STATE).exists()).toBe(false);
      expect(wrapper.findAll(TRANSACTION_ROW)).toHaveLength(sampleTransactions.length);
    });

    it('clears previous sections when reopened with no allocations', async () => {
      mockFetchTransactions.mockResolvedValue(sampleTransactions);
      const wrapper = createWrapper({ visible: false, allocations: [julyAllocation] });
      await wrapper.setProps({ visible: true });
      await flushPromises();
      expect(wrapper.findAll(TRANSACTION_ROW)).toHaveLength(3);

      await wrapper.setProps({ visible: false });
      await wrapper.setProps({ allocations: [] });
      await wrapper.setProps({ visible: true });
      await flushPromises();

      expect(wrapper.find(TRANSACTION_ROW).exists()).toBe(false);
      expect(wrapper.find(EMPTY_STATE).exists()).toBe(true);
    });
  });

  describe('single mode reopening', () => {
    it('ignores a slower earlier request after reopening', async () => {
      const resolvers: ((value: TransactionData[]) => void)[] = [];
      mockFetchTransactions.mockImplementation(
        () =>
          new Promise<TransactionData[]>((resolve) => {
            resolvers.push(resolve);
          }),
      );

      const wrapper = createWrapper({ visible: false });
      await wrapper.setProps({ visible: true });
      await wrapper.setProps({ visible: false });
      await wrapper.setProps({ visible: true });

      resolvers[1]([]);
      await flushPromises();
      resolvers[0](sampleTransactions);
      await flushPromises();

      expect(wrapper.findAll(TRANSACTION_ROW)).toHaveLength(0);
    });
  });
});
