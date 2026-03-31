import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import BudgetAllocationList from './BudgetAllocationList.vue';
import AllocationTransactionsDialog from '../shared/AllocationTransactionsDialog.vue';
import type { BudgetDetailData } from './budget.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';
import type { AllocationData } from '../transactions/transaction.types';
import { getTooltipValue } from '../../test/tooltip-helper';

import { DialogStub } from '../../test/stubs';

// Selectors
const CATEGORY_HEADER = (id: number) => `[data-testid="category-header-${id}"]`;
const ALLOCATION_ROW = '[data-testid="allocation-row"]';
const TOTAL_ROW = '[data-testid="total-row"]';
const UNALLOCATED_BADGE = '[data-testid="unallocated-badge"]';
const SHOW_TRANSACTIONS_BTN = '[data-testid="show-transactions-btn"]';
const ADD_ALLOCATION_BTN = (id: number) => `[data-testid="add-allocation-btn-${id}"]`;
const ADD_ALLOCATION_ROW = (id: number) => `[data-testid="add-allocation-row-${id}"]`;
const DELETE_BTN = '[data-testid="delete-btn"]';
const UNDO_DELETE_BTN = '[data-testid="undo-delete-btn"]';
const NAME_INPUT = '[data-testid="allocation-name-input"]';
const CLASS_SELECT = '[data-testid="allocation-class-select"]';
const FIXED_CHECKBOX = '[data-testid="allocation-fixed-checkbox"]';
const COMMENT_INPUT = '[data-testid="allocation-comment-input"]';
const VARIABLE_ONLY_TOGGLE = '[data-testid="variable-only-toggle"]';

const categories: AllocationCategoryData[] = [
  { id: 10, name: 'Essentials' },
  { id: 20, name: 'Lifestyle' },
];

function buildAllocations(): AllocationData[] {
  return [
    {
      id: 1,
      name: 'Groceries',
      amount: 50000,
      spent: 30000,
      allocation_category_id: 10,
      allocation_class: 'need',
      is_fixed_amount: false,
      comment: 'Weekly shop',
      budget_id: 100,
    },
    {
      id: 2,
      name: 'Rent',
      amount: 100000,
      spent: 100000,
      allocation_category_id: 10,
      allocation_class: 'need',
      is_fixed_amount: true,
      comment: '',
      budget_id: 100,
    },
    {
      id: 3,
      name: 'Entertainment',
      amount: 20000,
      spent: 25000,
      allocation_category_id: 20,
      allocation_class: 'want',
      is_fixed_amount: false,
      comment: 'Movies etc',
      budget_id: 100,
    },
  ];
}

function buildBudget(): BudgetDetailData {
  return {
    id: 100,
    name: 'Test Budget',
    incomes: [
      { id: 1, name: 'Salary', amount: 200000 },
      { id: 2, name: 'Freelance', amount: 50000 },
    ],
    allocations: buildAllocations(),
  };
}

const mockStore = reactive({
  budget: buildBudget() as BudgetDetailData | null,
  allocationCategories: categories,
  isEditMode: false,
  loading: false,
  error: null as string | null,
  fetch: vi.fn(),
  save: vi.fn(),
  enterEditMode: vi.fn(),
  exitEditMode: vi.fn(),
  cancelEdit: vi.fn(),
  addAllocation(allocation: AllocationData) {
    if (!this.budget) return;
    this.budget.allocations.push(allocation);
  },
});

vi.mock('./budgetStore', () => ({
  useBudgetStore: () => mockStore,
}));

vi.mock('./budgetApi', () => ({
  budgetApi: {
    getTransactionsForAllocation: vi.fn().mockResolvedValue([]),
  },
}));

function createWrapper(): VueWrapper {
  return mount(BudgetAllocationList, {
    global: {
      plugins: [PrimeVue, createPinia()],
      stubs: { Dialog: DialogStub },
    },
  });
}

async function createVariableOnlyWrapper(): Promise<VueWrapper> {
  const wrapper = createWrapper();
  await wrapper.find(VARIABLE_ONLY_TOGGLE).trigger('click');
  await nextTick();
  return wrapper;
}

describe('BudgetAllocationList', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.budget = buildBudget();
    mockStore.allocationCategories = categories;
    mockStore.isEditMode = false;
    mockStore.error = null;
  });

  describe('view mode — layout', () => {
    it('renders a category header for each allocation category', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(CATEGORY_HEADER(10)).exists()).toBe(true);
      expect(wrapper.find(CATEGORY_HEADER(20)).exists()).toBe(true);
    });

    it('renders category name in the header', () => {
      const wrapper = createWrapper();

      const header = wrapper.find(CATEGORY_HEADER(10));
      expect(header.text()).toContain('Essentials');
    });

    it('renders allocation rows grouped by category', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      expect(rows).toHaveLength(3);
    });

    it('renders total footer row', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(TOTAL_ROW).exists()).toBe(true);
    });

    it('renders seven columns in view mode (no action column)', () => {
      const wrapper = createWrapper();

      const headerCells = wrapper.findAll('thead th');
      expect(headerCells).toHaveLength(7);
    });
  });

  describe('view mode — allocation data display', () => {
    it('shows allocation name', () => {
      const wrapper = createWrapper();

      const firstRow = wrapper.findAll(ALLOCATION_ROW)[0];
      expect(firstRow.text()).toContain('Groceries');
    });

    it('shows allocation amount in dollars', () => {
      const wrapper = createWrapper();
      const expectedAmount = '500.00';

      const firstRow = wrapper.findAll(ALLOCATION_ROW)[0];
      expect(firstRow.text()).toContain(expectedAmount);
    });

    it('shows allocation spent in dollars', () => {
      const wrapper = createWrapper();
      const expectedSpent = '300.00';

      const firstRow = wrapper.findAll(ALLOCATION_ROW)[0];
      expect(firstRow.text()).toContain(expectedSpent);
    });

    it('shows allocation remaining (amount - spent)', () => {
      const wrapper = createWrapper();
      const expectedRemaining = '200.00';

      const firstRow = wrapper.findAll(ALLOCATION_ROW)[0];
      expect(firstRow.text()).toContain(expectedRemaining);
    });

    it('shows allocation class title-cased', () => {
      const wrapper = createWrapper();

      const firstRow = wrapper.findAll(ALLOCATION_ROW)[0];
      expect(firstRow.text()).toContain('Need');
    });

    it('shows "Yes" for fixed amount allocations', () => {
      const wrapper = createWrapper();

      const rentRow = wrapper.findAll(ALLOCATION_ROW)[1];
      expect(rentRow.text()).toContain('Yes');
    });

    it('shows "No" for non-fixed amount allocations', () => {
      const wrapper = createWrapper();

      const firstRow = wrapper.findAll(ALLOCATION_ROW)[0];
      expect(firstRow.text()).toContain('No');
    });

    it('shows allocation comment', () => {
      const wrapper = createWrapper();

      const firstRow = wrapper.findAll(ALLOCATION_ROW)[0];
      expect(firstRow.text()).toContain('Weekly shop');
    });
  });

  describe('view mode — remaining colour', () => {
    it('applies amount-positive class for positive remaining', () => {
      const wrapper = createWrapper();

      const firstRow = wrapper.findAll(ALLOCATION_ROW)[0];
      const remainingCell = firstRow.findAll('td')[3];
      expect(remainingCell.classes()).toContain('amount-positive');
    });

    it('applies amount-negative class for negative remaining', () => {
      const wrapper = createWrapper();

      // Entertainment: amount 200, spent 250 → remaining -50
      const entertainmentRow = wrapper.findAll(ALLOCATION_ROW)[2];
      const remainingCell = entertainmentRow.findAll('td')[3];
      expect(remainingCell.classes()).toContain('amount-negative');
    });

    it('applies amount-muted class for zero remaining', () => {
      const wrapper = createWrapper();

      // Rent: amount 1000, spent 1000 → remaining 0
      const rentRow = wrapper.findAll(ALLOCATION_ROW)[1];
      const remainingCell = rentRow.findAll('td')[3];
      expect(remainingCell.classes()).toContain('amount-muted');
    });
  });

  describe('view mode — eye icon', () => {
    it('renders an eye icon button on each allocation row', () => {
      const wrapper = createWrapper();

      const buttons = wrapper.findAll(SHOW_TRANSACTIONS_BTN);
      expect(buttons).toHaveLength(3);
    });

    it('has a title attribute on the eye button', () => {
      const wrapper = createWrapper();

      const button = wrapper.find(SHOW_TRANSACTIONS_BTN);
      expect(getTooltipValue(button)).toBe('Show transactions for this allocation');
    });

    it('opens the transactions dialog when eye icon is clicked', async () => {
      const wrapper = createWrapper();

      const button = wrapper.find(SHOW_TRANSACTIONS_BTN);
      await button.trigger('click');

      const dialog = wrapper.findComponent(AllocationTransactionsDialog);
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('allocationId')).toBe(1);
      expect(dialog.props('allocationName')).toBe('Groceries');
    });
  });

  describe('view mode — category subtotals', () => {
    it('shows category amount subtotal', () => {
      const wrapper = createWrapper();
      // Essentials: Groceries 500 + Rent 1000 = 1500.00
      const expectedCategoryAmount = '1,500.00';

      const header = wrapper.find(CATEGORY_HEADER(10));
      const amountCell = header.findAll('td')[1];
      expect(amountCell.text()).toBe(expectedCategoryAmount);
    });

    it('shows category spent subtotal', () => {
      const wrapper = createWrapper();
      // Essentials: Groceries 300 + Rent 1000 = 1300.00
      const expectedCategorySpent = '1,300.00';

      const header = wrapper.find(CATEGORY_HEADER(10));
      const spentCell = header.findAll('td')[2];
      expect(spentCell.text()).toBe(expectedCategorySpent);
    });

    it('shows category remaining subtotal', () => {
      const wrapper = createWrapper();
      // Essentials: 1500 - 1300 = 200.00
      const expectedCategoryRemaining = '200.00';

      const header = wrapper.find(CATEGORY_HEADER(10));
      const remainingCell = header.findAll('td')[3];
      expect(remainingCell.text()).toBe(expectedCategoryRemaining);
    });
  });

  describe('view mode — grand total footer', () => {
    it('shows total amount across all allocations', () => {
      const wrapper = createWrapper();
      // 500 + 1000 + 200 = 1700.00
      const expectedTotal = '1,700.00';

      const footer = wrapper.find(TOTAL_ROW);
      const amountCell = footer.findAll('th')[1];
      expect(amountCell.text()).toBe(expectedTotal);
    });

    it('shows total spent across all allocations', () => {
      const wrapper = createWrapper();
      // 300 + 1000 + 250 = 1550.00
      const expectedTotal = '1,550.00';

      const footer = wrapper.find(TOTAL_ROW);
      const spentCell = footer.findAll('th')[2];
      expect(spentCell.text()).toBe(expectedTotal);
    });

    it('shows total remaining across all allocations', () => {
      const wrapper = createWrapper();
      // 1700 - 1550 = 150.00
      const expectedTotal = '150.00';

      const footer = wrapper.find(TOTAL_ROW);
      const remainingCell = footer.findAll('th')[3];
      expect(remainingCell.text()).toBe(expectedTotal);
    });
  });

  describe('view mode — unallocated badge', () => {
    it('shows unallocated amount (total income - total allocations)', () => {
      const wrapper = createWrapper();
      // Income: 2000 + 500 = 2500. Allocations: 500 + 1000 + 200 = 1700. Unallocated: 800.00
      const expectedUnallocated = '800.00';

      const badge = wrapper.find(UNALLOCATED_BADGE);
      expect(badge.text()).toContain(expectedUnallocated);
    });

    it('displays "Unallocated:" label', () => {
      const wrapper = createWrapper();

      const badge = wrapper.find(UNALLOCATED_BADGE);
      expect(badge.text()).toContain('Unallocated:');
    });
  });

  describe('edit mode — inputs', () => {
    beforeEach(() => {
      mockStore.isEditMode = true;
    });

    it('renders eight columns in edit mode (includes action column)', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const headerCells = wrapper.findAll('thead th');
      expect(headerCells).toHaveLength(8);
    });

    it('shows name as text input', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const input = wrapper.find(NAME_INPUT);
      expect(input.exists()).toBe(true);
      expect((input.element as HTMLInputElement).value).toBe('Groceries');
    });

    it('shows class as select dropdown', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const select = wrapper.find(CLASS_SELECT);
      expect(select.exists()).toBe(true);
    });

    it('shows class dropdown with Want, Need, Savings options', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const firstRow = wrapper.findAll(ALLOCATION_ROW)[0];
      const options = firstRow.findAll(`${CLASS_SELECT} option`);
      const optionTexts = options.map((o) => o.text().trim());
      expect(optionTexts).toEqual(['Want', 'Need', 'Savings']);
    });

    it('shows fixed amount as checkbox', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const checkbox = wrapper.find(FIXED_CHECKBOX);
      expect(checkbox.exists()).toBe(true);
    });

    it('shows comment as text input', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const input = wrapper.find(COMMENT_INPUT);
      expect(input.exists()).toBe(true);
    });

    it('shows spent as read-only even in edit mode', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      const spentCell = rows[0].findAll('td')[2];
      // Spent cell should not contain an input
      expect(spentCell.find('input').exists()).toBe(false);
      expect(spentCell.text()).toContain('300.00');
    });

    it('shows remaining as read-only even in edit mode', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      const remainingCell = rows[0].findAll('td')[3];
      expect(remainingCell.find('input').exists()).toBe(false);
      expect(remainingCell.text()).toContain('200.00');
    });
  });

  describe('edit mode — delete', () => {
    beforeEach(() => {
      mockStore.isEditMode = true;
    });

    it('shows a delete button per row', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const buttons = wrapper.findAll(DELETE_BTN);
      expect(buttons).toHaveLength(3);
    });

    it('delete button has a title attribute', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const button = wrapper.find(DELETE_BTN);
      expect(getTooltipValue(button)).toBe('Delete allocation');
    });

    it('toggles deleted flag when delete button is clicked', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const deleteBtn = wrapper.find(DELETE_BTN);
      await deleteBtn.trigger('click');

      expect(mockStore.budget!.allocations[0].deleted).toBe(true);
    });

    it('shows undo icon when allocation is deleted', async () => {
      mockStore.budget!.allocations[0].deleted = true;
      const wrapper = createWrapper();
      await nextTick();

      const undoBtn = wrapper.find(UNDO_DELETE_BTN);
      expect(undoBtn.exists()).toBe(true);
      expect(getTooltipValue(undoBtn)).toBe('Undo delete');
    });

    it('applies deleted-row class to deleted allocations', async () => {
      mockStore.budget!.allocations[0].deleted = true;
      const wrapper = createWrapper();
      await nextTick();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      expect(rows[0].classes()).toContain('deleted-row');
    });

    it('excludes deleted allocations from category subtotals', async () => {
      mockStore.budget!.allocations[0].deleted = true;
      const wrapper = createWrapper();
      await nextTick();
      // Essentials with Groceries deleted: only Rent remains → 1,000.00
      const expectedAmount = '1,000.00';

      const header = wrapper.find(CATEGORY_HEADER(10));
      const amountCell = header.findAll('td')[1];
      expect(amountCell.text()).toBe(expectedAmount);
    });

    it('excludes deleted allocations from grand totals', async () => {
      mockStore.budget!.allocations[0].deleted = true;
      const wrapper = createWrapper();
      await nextTick();
      // Without Groceries: Rent 1000 + Entertainment 200 = 1200.00
      const expectedTotal = '1,200.00';

      const footer = wrapper.find(TOTAL_ROW);
      const amountCell = footer.findAll('th')[1];
      expect(amountCell.text()).toBe(expectedTotal);
    });

    it('excludes deleted allocations from unallocated calculation', async () => {
      mockStore.budget!.allocations[0].deleted = true;
      const wrapper = createWrapper();
      await nextTick();
      // Income: 2500. Allocations without Groceries: 1200. Unallocated: 1300.00
      const expectedUnallocated = '1,300.00';

      const badge = wrapper.find(UNALLOCATED_BADGE);
      expect(badge.text()).toContain(expectedUnallocated);
    });
  });

  describe('edit mode — add allocation', () => {
    beforeEach(() => {
      mockStore.isEditMode = true;
    });

    it('shows an add allocation button per category', async () => {
      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.find(ADD_ALLOCATION_BTN(10)).exists()).toBe(true);
      expect(wrapper.find(ADD_ALLOCATION_BTN(20)).exists()).toBe(true);
    });

    it('add button text includes the category name', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const button = wrapper.find(ADD_ALLOCATION_BTN(10));
      expect(button.text()).toContain('Add Essentials Allocation');
    });

    it('does not show add allocation button in view mode', () => {
      mockStore.isEditMode = false;
      const wrapper = createWrapper();

      expect(wrapper.find(ADD_ALLOCATION_ROW(10)).exists()).toBe(false);
    });

    it('adds a new allocation to the store when clicked', async () => {
      const wrapper = createWrapper();
      await nextTick();
      const initialCount = mockStore.budget!.allocations.length;

      await wrapper.find(ADD_ALLOCATION_BTN(10)).trigger('click');

      expect(mockStore.budget!.allocations).toHaveLength(initialCount + 1);
    });

    it('new allocation has correct defaults', async () => {
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(ADD_ALLOCATION_BTN(10)).trigger('click');

      const newAllocation = mockStore.budget!.allocations[mockStore.budget!.allocations.length - 1];
      expect(newAllocation.id).toBe(0);
      expect(newAllocation.name).toBe('');
      expect(newAllocation.amount).toBe(0);
      expect(newAllocation.spent).toBe(0);
      expect(newAllocation.budget_id).toBe(100);
      expect(newAllocation.allocation_category_id).toBe(10);
    });
  });

  describe('variable-only mode', () => {
    it('shows a variable-only toggle button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(VARIABLE_ONLY_TOGGLE).exists()).toBe(true);
    });

    it('defaults to "All Allocations" label', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(VARIABLE_ONLY_TOGGLE).text()).toContain('All Allocations');
    });

    it('toggles label to "Variable Only" when clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(VARIABLE_ONLY_TOGGLE).trigger('click');
      await nextTick();

      expect(wrapper.find(VARIABLE_ONLY_TOGGLE).text()).toContain('Variable Only');
    });

    it('hides individual fixed allocations when toggle is active', async () => {
      const wrapper = await createVariableOnlyWrapper();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      // Rent (is_fixed_amount=true) should be hidden; Groceries + Entertainment remain
      expect(rows).toHaveLength(2);
      expect(rows.map((r) => r.text()).join()).not.toContain('Rent');
    });

    it('shows a per-category "Fixed" subtotal row', async () => {
      const wrapper = await createVariableOnlyWrapper();

      const fixedRow = wrapper.find('[data-testid="fixed-subtotal-10"]');
      expect(fixedRow.exists()).toBe(true);
      // Rent is 1000.00
      expect(fixedRow.text()).toContain('1,000.00');
    });

    it('does not show per-category fixed subtotal row when no fixed allocations in that category', async () => {
      const wrapper = await createVariableOnlyWrapper();

      // Lifestyle (cat 20) has no fixed allocations
      const fixedRow = wrapper.find('[data-testid="fixed-subtotal-20"]');
      expect(fixedRow.exists()).toBe(false);
    });

    it('category totals still sum all allocations (fixed + variable)', async () => {
      const wrapper = await createVariableOnlyWrapper();

      // Essentials: Groceries 500 + Rent 1000 = 1500.00
      const header = wrapper.find(CATEGORY_HEADER(10));
      const amountCell = header.findAll('td')[1];
      expect(amountCell.text()).toBe('1,500.00');
    });

    it('footer totals still reflect full budget', async () => {
      const wrapper = await createVariableOnlyWrapper();

      // All: 500 + 1000 + 200 = 1700.00
      const footer = wrapper.find(TOTAL_ROW);
      const amountCell = footer.findAll('th')[1];
      expect(amountCell.text()).toBe('1,700.00');
    });

    it('shows overall fixed total row in footer', async () => {
      const wrapper = await createVariableOnlyWrapper();

      const fixedTotalRow = wrapper.find('[data-testid="fixed-total-row"]');
      expect(fixedTotalRow.exists()).toBe(true);
      // Only Rent is fixed: 1000.00
      expect(fixedTotalRow.text()).toContain('1,000.00');
    });

    it('spent column is visible in variable-only mode', async () => {
      const wrapper = await createVariableOnlyWrapper();

      const headerCells = wrapper.findAll('thead th');
      const headerTexts = headerCells.map((h) => h.text());
      expect(headerTexts).toContain('Spent');
    });

    it('new allocations can be added in variable-only mode in edit mode', async () => {
      mockStore.isEditMode = true;
      const wrapper = await createVariableOnlyWrapper();
      const initialCount = mockStore.budget!.allocations.length;

      await wrapper.find(ADD_ALLOCATION_BTN(10)).trigger('click');

      expect(mockStore.budget!.allocations).toHaveLength(initialCount + 1);
    });

    it('shows all allocations when toggle is not active (default)', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      expect(rows).toHaveLength(3);
    });

    it('does not show fixed subtotal rows when toggle is not active', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="fixed-subtotal-10"]').exists()).toBe(false);
    });

    it('does not show overall fixed total row when toggle is not active', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="fixed-total-row"]').exists()).toBe(false);
    });

    it('shows category header + fixed subtotal only when all allocations in category are fixed', async () => {
      // Make all allocations in Essentials fixed
      mockStore.budget!.allocations[0].is_fixed_amount = true; // Groceries
      mockStore.budget!.allocations[1].is_fixed_amount = true; // Rent (already true)
      const wrapper = await createVariableOnlyWrapper();

      // No variable allocation rows for Essentials
      const rows = wrapper.findAll(ALLOCATION_ROW);
      // Only Entertainment (category 20) remains
      expect(rows).toHaveLength(1);
      expect(rows[0].text()).toContain('Entertainment');

      // But Essentials category header still exists
      expect(wrapper.find(CATEGORY_HEADER(10)).exists()).toBe(true);
      // Fixed subtotal shows
      const fixedRow = wrapper.find('[data-testid="fixed-subtotal-10"]');
      expect(fixedRow.exists()).toBe(true);
      // 500 + 1000 = 1500.00
      expect(fixedRow.text()).toContain('1,500.00');
    });

    it('fixed subtotal row shows spent for fixed allocations', async () => {
      const wrapper = await createVariableOnlyWrapper();

      const fixedRow = wrapper.find('[data-testid="fixed-subtotal-10"]');
      // Rent spent: 1000.00
      expect(fixedRow.text()).toContain('1,000.00');
    });
  });

  describe('edge cases', () => {
    it('renders nothing when budget is null', () => {
      mockStore.budget = null;
      const wrapper = createWrapper();

      expect(wrapper.findAll(ALLOCATION_ROW)).toHaveLength(0);
    });

    it('renders empty categories with header but no allocation rows', () => {
      mockStore.budget = {
        id: 100,
        name: 'Empty',
        incomes: [],
        allocations: [],
      };
      const wrapper = createWrapper();

      expect(wrapper.find(CATEGORY_HEADER(10)).exists()).toBe(true);
      expect(wrapper.findAll(ALLOCATION_ROW)).toHaveLength(0);
    });

    it('handles allocations with undefined amounts gracefully', () => {
      mockStore.budget = {
        id: 100,
        name: 'Test',
        incomes: [],
        allocations: [{ id: 1, allocation_category_id: 10 }],
      };
      const wrapper = createWrapper();

      const row = wrapper.find(ALLOCATION_ROW);
      expect(row.exists()).toBe(true);
      expect(row.text()).toContain('0.00');
    });
  });
});
