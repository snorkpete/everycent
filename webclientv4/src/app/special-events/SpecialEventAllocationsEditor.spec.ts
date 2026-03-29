import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import SpecialEventAllocationsEditor from './SpecialEventAllocationsEditor.vue';
import type { SpecialEventData, SpecialEventAllocationData } from './specialEvent.types';
import type { AllocationData } from '../transactions/transaction.types';
import type { BudgetData } from '../budgets/budget.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';

// --- Mock heading store ---
const mockSetHeading = vi.fn();
vi.mock('../toolbar/headingStore', () => ({
  useHeadingStore: () => ({ setHeading: mockSetHeading }),
}));

// --- Mock notifications ---
const mockNotifyError = vi.fn();
const mockNotifySuccess = vi.fn();
vi.mock('../notifications/useNotifications', () => ({
  useNotifications: () => ({
    error: mockNotifyError,
    success: mockNotifySuccess,
    info: vi.fn(),
  }),
}));

// --- Mock router ---
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRouteParams = { id: '5' };
const mockRouteQuery: Record<string, string> = {};
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useRoute: () => ({ params: mockRouteParams, query: mockRouteQuery }),
}));

// --- Test data ---
const testAllocations: SpecialEventAllocationData[] = [
  {
    id: 10,
    name: 'Venue',
    amount: 100000,
    spent: 80000,
    budget_name: 'March 2026',
    allocation_category_name: 'Entertainment',
    allocation_category_id: 1,
  },
  {
    id: 11,
    name: 'Catering',
    amount: 50000,
    spent: 45000,
    budget_name: 'March 2026',
    allocation_category_name: 'Food',
    allocation_category_id: 2,
  },
];

const testEvent: SpecialEventData = {
  id: 5,
  name: 'Company Retreat',
  budget_amount: 200000,
  actual_amount: 125000,
  allocations: testAllocations,
};

const testBudgets: BudgetData[] = [
  { id: 100, name: 'March 2026', start_date: '2026-03-01' },
  { id: 101, name: 'April 2026', start_date: '2026-04-01' },
];

const testCategories: AllocationCategoryData[] = [
  { id: 1, name: 'Entertainment' },
  { id: 2, name: 'Food' },
  { id: 3, name: 'Transport' },
];

const testBudgetAllocations: AllocationData[] = [
  {
    id: 10,
    name: 'Venue',
    amount: 100000,
    spent: 80000,
    budget_id: 100,
    allocation_category_id: 1,
    allocation_category: { id: 1, name: 'Entertainment' },
    budget_name: 'March 2026',
  },
  {
    id: 11,
    name: 'Catering',
    amount: 50000,
    spent: 45000,
    budget_id: 100,
    allocation_category_id: 2,
    allocation_category: { id: 2, name: 'Food' },
    budget_name: 'March 2026',
  },
  {
    id: 12,
    name: 'DJ',
    amount: 30000,
    spent: 25000,
    budget_id: 100,
    allocation_category_id: 1,
    allocation_category: { id: 1, name: 'Entertainment' },
    budget_name: 'March 2026',
  },
  {
    id: 13,
    name: 'Misc',
    amount: 10000,
    spent: 5000,
    budget_id: 100,
    allocation_category_id: undefined,
    allocation_category: undefined,
    budget_name: 'March 2026',
  },
];

// --- Mock special event store ---
const mockStore = reactive({
  currentSpecialEvent: testEvent as SpecialEventData | null,
  loading: false,
  error: null as string | null,
  fetchOne: vi.fn().mockResolvedValue(undefined),
  updateAllocations: vi.fn().mockResolvedValue(undefined),
});

vi.mock('./specialEventStore', () => ({
  useSpecialEventStore: () => mockStore,
}));

// --- Mock budget API ---
const mockGetAllBudgets = vi.fn().mockResolvedValue(testBudgets);
const mockGetAllocations = vi.fn().mockResolvedValue(testBudgetAllocations);
vi.mock('../budgets/budgetApi', () => ({
  budgetApi: {
    getAll: (...args: unknown[]) => mockGetAllBudgets(...args),
    getAllocations: (...args: unknown[]) => mockGetAllocations(...args),
  },
}));

// --- Mock allocation category API ---
const mockGetAllCategories = vi.fn().mockResolvedValue(testCategories);
vi.mock('../allocation-categories/allocationCategoryApi', () => ({
  allocationCategoryApi: {
    getAll: (...args: unknown[]) => mockGetAllCategories(...args),
  },
}));

function createWrapper(): VueWrapper {
  return mount(SpecialEventAllocationsEditor, {
    global: {
      plugins: [PrimeVue, createPinia()],
    },
  });
}

describe('SpecialEventAllocationsEditor', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.currentSpecialEvent = testEvent;
    mockStore.loading = false;
    mockStore.error = null;
    mockStore.fetchOne.mockResolvedValue(undefined);
    mockStore.updateAllocations.mockResolvedValue(undefined);
    mockGetAllBudgets.mockResolvedValue(testBudgets);
    mockGetAllocations.mockResolvedValue(testBudgetAllocations);
    mockGetAllCategories.mockResolvedValue(testCategories);
    mockRouteParams.id = '5';
    // Reset query
    Object.keys(mockRouteQuery).forEach((k) => delete mockRouteQuery[k]);
  });

  describe('on mount', () => {
    it('sets the page heading to "Edit Allocations"', async () => {
      createWrapper();
      await flushPromises();

      expect(mockSetHeading).toHaveBeenCalledWith('Edit Allocations');
    });

    it('loads budgets from budgetApi', async () => {
      createWrapper();
      await flushPromises();

      expect(mockGetAllBudgets).toHaveBeenCalled();
    });

    it('loads allocation categories from allocationCategoryApi', async () => {
      createWrapper();
      await flushPromises();

      expect(mockGetAllCategories).toHaveBeenCalled();
    });

    it('fetches the special event by route param id', async () => {
      createWrapper();
      await flushPromises();

      expect(mockStore.fetchOne).toHaveBeenCalledWith(5);
    });

    it('populates current allocations from the loaded special event', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const table = wrapper.find('[data-testid="current-allocations-table"]');
      expect(table.text()).toContain('Venue');
      expect(table.text()).toContain('Catering');
    });
  });

  describe('current allocations panel', () => {
    it('displays allocation names', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const table = wrapper.find('[data-testid="current-allocations-table"]');
      expect(table.text()).toContain('Venue');
      expect(table.text()).toContain('Catering');
    });

    it('displays budget names', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const table = wrapper.find('[data-testid="current-allocations-table"]');
      expect(table.text()).toContain('March 2026');
    });

    it('displays category names', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const table = wrapper.find('[data-testid="current-allocations-table"]');
      expect(table.text()).toContain('Entertainment');
      expect(table.text()).toContain('Food');
    });

    it('displays formatted amount values', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const table = wrapper.find('[data-testid="current-allocations-table"]');
      expect(table.text()).toContain('1,000.00');
      expect(table.text()).toContain('500.00');
    });

    it('displays formatted spent values', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const table = wrapper.find('[data-testid="current-allocations-table"]');
      expect(table.text()).toContain('800.00');
      expect(table.text()).toContain('450.00');
    });

    it('displays total spent in footer', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const table = wrapper.find('[data-testid="current-allocations-table"]');
      // Total: 80000 + 45000 = 125000 = 1,250.00
      expect(table.text()).toContain('1,250.00');
    });

    it('renders a remove button for each allocation', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="remove-btn-10"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="remove-btn-11"]').exists()).toBe(true);
    });

    it('remove buttons have title attributes', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const btn = wrapper.find('[data-testid="remove-btn-10"]');
      expect(btn.attributes('title')).toBeTruthy();
    });
  });

  describe('remove allocation', () => {
    it('removes the allocation from the current allocations list', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('[data-testid="remove-btn-10"]').trigger('click');
      await nextTick();

      const table = wrapper.find('[data-testid="current-allocations-table"]');
      expect(table.text()).not.toContain('Venue');
      expect(table.text()).toContain('Catering');
    });

    it('updates the total spent after removal', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('[data-testid="remove-btn-10"]').trigger('click');
      await nextTick();

      const table = wrapper.find('[data-testid="current-allocations-table"]');
      // Only Catering left: 45000 = 450.00
      expect(table.text()).toContain('450.00');
    });
  });

  describe('assign allocations panel', () => {
    it('renders a budget dropdown', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="budget-select"]').exists()).toBe(true);
    });

    it('renders a category dropdown', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="category-select"]').exists()).toBe(true);
    });

    it('loads allocations when a budget is selected', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      // Simulate selecting a budget via the component's internal method
      const vm = wrapper.vm as unknown as {
        selectedBudgetId: number | null;
        onBudgetChange: () => Promise<void>;
      };
      vm.selectedBudgetId = 100;
      await vm.onBudgetChange();
      await flushPromises();

      expect(mockGetAllocations).toHaveBeenCalledWith(100);
    });

    it('groups available allocations by category with headers', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      // Select budget to load allocations
      const vm = wrapper.vm as unknown as {
        selectedBudgetId: number | null;
        onBudgetChange: () => Promise<void>;
      };
      vm.selectedBudgetId = 100;
      await vm.onBudgetChange();
      await flushPromises();
      await nextTick();

      const table = wrapper.find('[data-testid="available-allocations-table"]');
      const text = table.text();

      // Should show "Uncategorized" header for Misc
      expect(text).toContain('Uncategorized');
      // Should show "Entertainment" header
      expect(text).toContain('Entertainment');
      // Should show "Food" header
      expect(text).toContain('Food');
      // Should show allocation names
      expect(text).toContain('Venue');
      expect(text).toContain('DJ');
      expect(text).toContain('Catering');
      expect(text).toContain('Misc');
    });

    it('shows uncategorized allocations first', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const vm = wrapper.vm as unknown as {
        selectedBudgetId: number | null;
        onBudgetChange: () => Promise<void>;
        groupedAllocations: (AllocationData & { _isCategoryHeader?: boolean })[];
      };
      vm.selectedBudgetId = 100;
      await vm.onBudgetChange();
      await flushPromises();

      // First category header should be "Uncategorized"
      const firstHeader = vm.groupedAllocations.find((a) => a._isCategoryHeader);
      expect(firstHeader?.name).toBe('Uncategorized');
    });

    it('only shows categories that have allocations', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const vm = wrapper.vm as unknown as {
        selectedBudgetId: number | null;
        onBudgetChange: () => Promise<void>;
        groupedAllocations: (AllocationData & { _isCategoryHeader?: boolean })[];
      };
      vm.selectedBudgetId = 100;
      await vm.onBudgetChange();
      await flushPromises();

      const headers = vm.groupedAllocations.filter((a) => a._isCategoryHeader).map((a) => a.name);

      // Transport has no allocations, shouldn't appear
      expect(headers).not.toContain('Transport');
      expect(headers).toContain('Uncategorized');
      expect(headers).toContain('Entertainment');
      expect(headers).toContain('Food');
    });

    it('filters by category when a category is selected', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const vm = wrapper.vm as unknown as {
        selectedBudgetId: number | null;
        selectedCategoryId: number | null;
        onBudgetChange: () => Promise<void>;
        onCategoryChange: () => void;
        groupedAllocations: (AllocationData & { _isCategoryHeader?: boolean })[];
      };
      vm.selectedBudgetId = 100;
      await vm.onBudgetChange();
      await flushPromises();

      // Filter to Entertainment only
      vm.selectedCategoryId = 1;
      vm.onCategoryChange();
      await nextTick();

      const allocationNames = vm.groupedAllocations
        .filter((a) => !a._isCategoryHeader)
        .map((a) => a.name);

      expect(allocationNames).toContain('Venue');
      expect(allocationNames).toContain('DJ');
      expect(allocationNames).not.toContain('Catering');
      expect(allocationNames).not.toContain('Misc');
    });
  });

  describe('add allocation', () => {
    it('adds the allocation to the current allocations list', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      // Load allocations
      const vm = wrapper.vm as unknown as {
        selectedBudgetId: number | null;
        onBudgetChange: () => Promise<void>;
      };
      vm.selectedBudgetId = 100;
      await vm.onBudgetChange();
      await flushPromises();
      await nextTick();

      // DJ (id=12) is not assigned yet
      await wrapper.find('[data-testid="add-btn-12"]').trigger('click');
      await nextTick();

      const table = wrapper.find('[data-testid="current-allocations-table"]');
      expect(table.text()).toContain('DJ');
    });

    it('disables the add button for already assigned allocations', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const vm = wrapper.vm as unknown as {
        selectedBudgetId: number | null;
        onBudgetChange: () => Promise<void>;
      };
      vm.selectedBudgetId = 100;
      await vm.onBudgetChange();
      await flushPromises();
      await nextTick();

      // Venue (id=10) is already assigned
      const btn = wrapper.find('[data-testid="add-btn-10"]');
      expect(btn.attributes('disabled')).toBeDefined();
    });

    it('does not add a duplicate allocation', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const vm = wrapper.vm as unknown as {
        selectedBudgetId: number | null;
        onBudgetChange: () => Promise<void>;
        currentAllocations: SpecialEventAllocationData[];
      };
      vm.selectedBudgetId = 100;
      await vm.onBudgetChange();
      await flushPromises();
      await nextTick();

      const countBefore = vm.currentAllocations.length;

      // Try adding Venue (id=10, already assigned) via internal fn
      const addFn = (wrapper.vm as unknown as { addAllocation: (a: AllocationData) => void })
        .addAllocation;
      addFn(testBudgetAllocations[0]);
      await nextTick();

      expect(vm.currentAllocations.length).toBe(countBefore);
    });

    it('add buttons have title attributes', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const vm = wrapper.vm as unknown as {
        selectedBudgetId: number | null;
        onBudgetChange: () => Promise<void>;
      };
      vm.selectedBudgetId = 100;
      await vm.onBudgetChange();
      await flushPromises();
      await nextTick();

      const btn = wrapper.find('[data-testid="add-btn-12"]');
      expect(btn.attributes('title')).toBeTruthy();
    });
  });

  describe('save', () => {
    it('calls updateAllocations with allocation_ids and calculated actual_amount', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await flushPromises();

      expect(mockStore.updateAllocations).toHaveBeenCalledWith(5, {
        allocation_ids: [10, 11],
        actual_amount: 125000, // 80000 + 45000
      });
    });

    it('shows success notification after successful save', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await flushPromises();

      expect(mockNotifySuccess).toHaveBeenCalledWith('Special event allocations updated');
    });

    it('navigates to detail page after successful save', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await flushPromises();

      expect(mockPush).toHaveBeenCalledWith({
        name: 'special-event-detail',
        params: { id: 5 },
      });
    });

    it('shows error notification when save fails', async () => {
      const errorMessage = 'Allocation update failed';
      mockStore.updateAllocations.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Server error');
      });

      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await flushPromises();

      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
    });

    it('does not navigate when save fails', async () => {
      mockStore.updateAllocations.mockImplementation(async () => {
        mockStore.error = 'Failed';
        throw new Error('Server error');
      });

      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await flushPromises();

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('recalculates actual_amount after adding and removing allocations', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      // Load budget allocations
      const vm = wrapper.vm as unknown as {
        selectedBudgetId: number | null;
        onBudgetChange: () => Promise<void>;
      };
      vm.selectedBudgetId = 100;
      await vm.onBudgetChange();
      await flushPromises();
      await nextTick();

      // Remove Venue (spent 80000)
      await wrapper.find('[data-testid="remove-btn-10"]').trigger('click');
      await nextTick();

      // Add DJ (spent 25000)
      await wrapper.find('[data-testid="add-btn-12"]').trigger('click');
      await nextTick();

      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await flushPromises();

      // Remaining: Catering(45000) + DJ(25000) = 70000
      expect(mockStore.updateAllocations).toHaveBeenCalledWith(5, {
        allocation_ids: [11, 12],
        actual_amount: 70000,
      });
    });

    it('has a title attribute', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const btn = wrapper.find('[data-testid="save-btn"]');
      expect(btn.attributes('title')).toBeTruthy();
    });
  });

  describe('cancel', () => {
    it('navigates back to the special event detail page', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('[data-testid="cancel-btn"]').trigger('click');

      expect(mockPush).toHaveBeenCalledWith({
        name: 'special-event-detail',
        params: { id: 5 },
      });
    });

    it('has a title attribute', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const btn = wrapper.find('[data-testid="cancel-btn"]');
      expect(btn.attributes('title')).toBeTruthy();
    });
  });

  describe('URL query param sync', () => {
    it('updates URL when budget is selected', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const vm = wrapper.vm as unknown as {
        selectedBudgetId: number | null;
        onBudgetChange: () => Promise<void>;
      };
      vm.selectedBudgetId = 100;
      await vm.onBudgetChange();
      await flushPromises();

      expect(mockReplace).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ budget_id: '100' }),
        }),
      );
    });

    it('updates URL when category is selected', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const vm = wrapper.vm as unknown as {
        selectedBudgetId: number | null;
        selectedCategoryId: number | null;
        onBudgetChange: () => Promise<void>;
        onCategoryChange: () => void;
      };
      vm.selectedBudgetId = 100;
      vm.selectedCategoryId = 2;
      vm.onCategoryChange();
      await nextTick();

      expect(mockReplace).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            budget_id: '100',
            allocation_category_id: '2',
          }),
        }),
      );
    });

    it('restores budget_id from URL on mount', async () => {
      mockRouteQuery.budget_id = '101';

      createWrapper();
      await flushPromises();

      expect(mockGetAllocations).toHaveBeenCalledWith(101);
    });

    it('restores allocation_category_id from URL on mount', async () => {
      mockRouteQuery.budget_id = '100';
      mockRouteQuery.allocation_category_id = '2';

      const wrapper = createWrapper();
      await flushPromises();

      const vm = wrapper.vm as unknown as { selectedCategoryId: number | null };
      expect(vm.selectedCategoryId).toBe(2);
    });
  });

  describe('empty states', () => {
    it('renders empty current allocations table when event has no allocations', async () => {
      mockStore.currentSpecialEvent = {
        ...testEvent,
        allocations: [],
      };
      const wrapper = createWrapper();
      await flushPromises();

      const table = wrapper.find('[data-testid="current-allocations-table"]');
      expect(table.exists()).toBe(true);
    });

    it('renders empty available allocations table when no budget is selected', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const table = wrapper.find('[data-testid="available-allocations-table"]');
      expect(table.exists()).toBe(true);
    });

    it('clears available allocations when budget selection is cleared', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const vm = wrapper.vm as unknown as {
        selectedBudgetId: number | null;
        onBudgetChange: () => Promise<void>;
        availableAllocations: AllocationData[];
      };

      // First select a budget
      vm.selectedBudgetId = 100;
      await vm.onBudgetChange();
      await flushPromises();
      expect(vm.availableAllocations.length).toBeGreaterThan(0);

      // Now clear it
      vm.selectedBudgetId = null;
      await vm.onBudgetChange();
      await flushPromises();
      expect(vm.availableAllocations.length).toBe(0);
    });
  });
});
