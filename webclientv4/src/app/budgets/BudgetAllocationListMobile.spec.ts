import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import BudgetAllocationListMobile from './BudgetAllocationListMobile.vue';
import EcMoneyDisplay from '../shared/form/money-field/EcMoneyDisplay.vue';
import { useBudgetStore } from './budgetStore';
import {
  buildBudgetDetail,
  buildAllocation,
  buildVariableAllocation,
  buildAllocationCategory,
} from '../../test/factories';
import { getTooltipValue } from '../../test/tooltip-helper';
import { DialogStub } from '../../test/stubs';

// Selectors
const CATEGORY_HEADER = (id: number) => `[data-testid="category-header-${id}"]`;
const ALLOCATION_ROW = '[data-testid="allocation-row"]';
const TOTAL_ROW = '[data-testid="total-row"]';
const ADD_ALLOCATION_BTN = (id: number) => `[data-testid="add-allocation-btn-${id}"]`;
const ADD_ALLOCATION_ROW = (id: number) => `[data-testid="add-allocation-row-${id}"]`;
const DELETE_BTN = '[data-testid="allocation-delete-btn"]';
const UNDO_DELETE_BTN = '[data-testid="allocation-restore-btn"]';
const NAME_INPUT = 'input[data-testid="allocation-name-input"]';
const VARIABLE_ONLY_TOGGLE = '[data-testid="variable-only-toggle"]';
const FIXED_SUBTOTAL = (id: number) => `[data-testid="fixed-subtotal-${id}"]`;

const categoryEssentials = buildAllocationCategory({ id: 10, name: 'Essentials' });
const categoryLifestyle = buildAllocationCategory({ id: 20, name: 'Lifestyle' });

vi.mock('./budgetApi', () => ({
  budgetApi: {
    getTransactionsForAllocation: vi.fn().mockResolvedValue([]),
  },
}));

let pinia: Pinia;
let store: ReturnType<typeof useBudgetStore>;

function createWrapper(): VueWrapper {
  return mount(BudgetAllocationListMobile, {
    global: {
      plugins: [PrimeVue, pinia],
      stubs: { Dialog: DialogStub },
    },
  });
}

async function createWrapperWithFixedCollapsed(): Promise<VueWrapper> {
  const wrapper = createWrapper();
  await wrapper.find(VARIABLE_ONLY_TOGGLE).trigger('click');
  await nextTick();
  return wrapper;
}

function findRowByName(wrapper: VueWrapper, name: string) {
  return wrapper.findAll(ALLOCATION_ROW).find((r) => {
    if (r.text().includes(name)) return true;
    const nameInput = r.find(NAME_INPUT);
    if (nameInput.exists() && (nameInput.element as HTMLInputElement).value === name) return true;
    return false;
  });
}

describe('BudgetAllocationListMobile', () => {
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    store = useBudgetStore();
    store.budget = buildBudgetDetail({
      id: 100,
      name: 'Test Budget',
      incomes: [
        { id: 1, name: 'Salary', amount: 200000, budget_id: 100, comment: '' },
        { id: 2, name: 'Freelance', amount: 50000, budget_id: 100, comment: '' },
      ],
      allocations: [
        buildAllocation({
          id: 1,
          name: 'Groceries',
          amount: 50000,
          spent: 30000,
          allocation_category_id: 10,
          allocation_class: 'need',
          is_fixed_amount: false,
          comment: 'Weekly shop',
          budget_id: 100,
        }),
        buildAllocation({
          id: 2,
          name: 'Rent',
          amount: 100000,
          spent: 100000,
          allocation_category_id: 10,
          allocation_class: 'need',
          is_fixed_amount: true,
          comment: '',
          budget_id: 100,
        }),
        buildVariableAllocation({
          id: 3,
          name: 'Entertainment',
          amount: 20000,
          spent: 25000,
          allocation_category_id: 20,
          allocation_class: 'want',
          is_fixed_amount: false,
          comment: 'Movies etc',
          budget_id: 100,
        }),
      ],
    });
    store.allocationCategories = [categoryEssentials, categoryLifestyle];
    store.isEditMode = false;
    vi.clearAllMocks();
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

    it('renders three columns in view mode (Name, Amount, Remaining)', () => {
      const wrapper = createWrapper();

      const headerCells = wrapper.findAll('thead tr:last-child th');
      expect(headerCells).toHaveLength(3);
      const texts = headerCells.map((h) => h.text());
      expect(texts).toContain('Name');
      expect(texts).toContain('Amount');
      expect(texts).toContain('Remaining');
    });

    it('does not render Spent column header', () => {
      const wrapper = createWrapper();

      const headerCells = wrapper.findAll('thead tr:last-child th');
      const texts = headerCells.map((h) => h.text());
      expect(texts).not.toContain('Spent');
    });
  });

  describe('view mode — allocation data display', () => {
    it('shows allocation name', () => {
      const wrapper = createWrapper();

      const groceriesRow = findRowByName(wrapper, 'Groceries');
      expect(groceriesRow).toBeDefined();
    });

    it('shows allocation amount in dollars', () => {
      const wrapper = createWrapper();

      const groceriesRow = findRowByName(wrapper, 'Groceries')!;
      expect(groceriesRow.text()).toContain('500.00');
    });

    it('shows allocation remaining (amount - spent)', () => {
      const wrapper = createWrapper();

      // 50000 - 30000 = 20000 cents = 200.00
      const groceriesRow = findRowByName(wrapper, 'Groceries')!;
      expect(groceriesRow.text()).toContain('200.00');
    });

    it('does not show spent amount in the row cells (mobile hides spent column)', () => {
      const wrapper = createWrapper();

      const groceriesRow = findRowByName(wrapper, 'Groceries')!;
      const cells = groceriesRow.findAll('td');
      // Only 3 cells: name, amount, remaining
      expect(cells).toHaveLength(3);
    });
  });

  describe('view mode — remaining uses EcMoneyDisplay with balance highlight', () => {
    it('passes remaining value to EcMoneyDisplay in remaining column', () => {
      const wrapper = createWrapper();

      const groceriesRow = findRowByName(wrapper, 'Groceries')!;
      // 3rd td (index 2) is remaining
      const remainingDisplay = groceriesRow.findAll('td')[2].findComponent(EcMoneyDisplay);
      expect(remainingDisplay.props('modelValue')).toBe(20000);
    });

    it('uses balance highlight mode for remaining', () => {
      const wrapper = createWrapper();

      const groceriesRow = findRowByName(wrapper, 'Groceries')!;
      const remainingDisplay = groceriesRow.findAll('td')[2].findComponent(EcMoneyDisplay);
      expect(remainingDisplay.props('highlightMode')).toBe('balance');
    });
  });

  describe('view mode — chevron expand/collapse', () => {
    it('shows a chevron on each allocation row', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      rows.forEach((row) => {
        expect(row.find('.mobile-chevron').exists()).toBe(true);
      });
    });

    it('starts with rows collapsed (no detail row visible)', () => {
      const wrapper = createWrapper();

      const detailRows = wrapper.findAll('.mobile-detail-row');
      expect(detailRows).toHaveLength(0);
    });

    it('shows detail row when chevron is clicked', async () => {
      const wrapper = createWrapper();

      const groceriesRow = findRowByName(wrapper, 'Groceries')!;
      const chevron = groceriesRow.find('.mobile-chevron');
      await chevron.trigger('click');
      await nextTick();

      expect(wrapper.findAll('.mobile-detail-row')).toHaveLength(1);
    });

    it('detail row shows spent amount', async () => {
      const wrapper = createWrapper();

      const groceriesRow = findRowByName(wrapper, 'Groceries')!;
      await groceriesRow.find('.mobile-chevron').trigger('click');
      await nextTick();

      const detailRow = wrapper.find('.mobile-detail-row');
      // Groceries spent: 300.00
      expect(detailRow.text()).toContain('300.00');
    });

    it('detail row shows category name', async () => {
      const wrapper = createWrapper();

      const groceriesRow = findRowByName(wrapper, 'Groceries')!;
      await groceriesRow.find('.mobile-chevron').trigger('click');
      await nextTick();

      const detailRow = wrapper.find('.mobile-detail-row');
      expect(detailRow.text()).toContain('Essentials');
    });

    it('collapses row when chevron is clicked again', async () => {
      const wrapper = createWrapper();

      const groceriesRow = findRowByName(wrapper, 'Groceries')!;
      const chevron = groceriesRow.find('.mobile-chevron');
      await chevron.trigger('click');
      await nextTick();
      await chevron.trigger('click');
      await nextTick();

      expect(wrapper.findAll('.mobile-detail-row')).toHaveLength(0);
    });
  });

  describe('view mode — category subtotals', () => {
    it('shows category amount subtotal', () => {
      const wrapper = createWrapper();
      // Essentials: Groceries 500 + Rent 1000 = 1500.00
      const header = wrapper.find(CATEGORY_HEADER(10));
      const amountCell = header.findAll('td')[1];
      expect(amountCell.text()).toBe('1,500.00');
    });

    it('shows category remaining subtotal', () => {
      const wrapper = createWrapper();
      // Essentials: (500-300) + (1000-1000) = 200.00
      const header = wrapper.find(CATEGORY_HEADER(10));
      const remainingCell = header.findAll('td')[2];
      expect(remainingCell.text()).toBe('200.00');
    });
  });

  describe('view mode — grand total footer', () => {
    it('shows total amount across all allocations', () => {
      const wrapper = createWrapper();
      // 500 + 1000 + 200 = 1700.00
      const footer = wrapper.find(TOTAL_ROW);
      const amountCell = footer.findAll('th')[1];
      expect(amountCell.text()).toBe('1,700.00');
    });

    it('shows total remaining across all allocations', () => {
      const wrapper = createWrapper();
      // 1700 - 1550 = 150.00
      const footer = wrapper.find(TOTAL_ROW);
      const remainingCell = footer.findAll('th')[2];
      expect(remainingCell.text()).toBe('150.00');
    });
  });

  describe('edit mode — inputs', () => {
    beforeEach(() => {
      store.isEditMode = true;
    });

    it('renders four columns in edit mode (includes action column)', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const headerCells = wrapper.findAll('thead tr:last-child th');
      expect(headerCells).toHaveLength(4);
    });

    it('shows name as text input for adjustable allocations', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const groceriesRow = findRowByName(wrapper, 'Groceries')!;
      const input = groceriesRow.find(NAME_INPUT);
      expect(input.exists()).toBe(true);
      expect((input.element as HTMLInputElement).value).toBe('Groceries');
    });

    it('shows remaining as read-only even in edit mode', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const groceriesRow = findRowByName(wrapper, 'Groceries')!;
      const remainingCell = groceriesRow.findAll('td')[2];
      expect(remainingCell.find('input').exists()).toBe(false);
      expect(remainingCell.text()).toContain('200.00');
    });
  });

  describe('edit mode — delete', () => {
    beforeEach(() => {
      store.isEditMode = true;
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
      expect(getTooltipValue(button)).toBe('Delete this allocation');
    });

    it('toggles deleted flag when delete button is clicked', async () => {
      const wrapper = createWrapper();
      await nextTick();

      const groceriesRow = findRowByName(wrapper, 'Groceries')!;
      const deleteBtn = groceriesRow.find(DELETE_BTN);
      await deleteBtn.trigger('click');

      expect(store.budget!.allocations[0].deleted).toBe(true);
    });

    it('shows undo icon when allocation is deleted', async () => {
      store.budget!.allocations[0].deleted = true;
      const wrapper = createWrapper();
      await nextTick();

      const undoBtn = wrapper.find(UNDO_DELETE_BTN);
      expect(undoBtn.exists()).toBe(true);
      expect(getTooltipValue(undoBtn)).toBe('Restore this deleted allocation');
    });

    it('applies deleted-row class to deleted allocations', async () => {
      store.budget!.allocations[0].deleted = true;
      const wrapper = createWrapper();
      await nextTick();

      const groceriesRow = findRowByName(wrapper, 'Groceries')!;
      expect(groceriesRow.classes()).toContain('ec-deleted');
    });
  });

  describe('edit mode — add allocation', () => {
    beforeEach(() => {
      store.isEditMode = true;
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
      store.isEditMode = false;
      const wrapper = createWrapper();

      expect(wrapper.find(ADD_ALLOCATION_ROW(10)).exists()).toBe(false);
    });

    it('adds a new allocation to the store when clicked', async () => {
      const wrapper = createWrapper();
      await nextTick();
      const initialCount = store.budget!.allocations.length;

      await wrapper.find(ADD_ALLOCATION_BTN(10)).trigger('click');

      expect(store.budget!.allocations).toHaveLength(initialCount + 1);
    });

    it('new allocation has correct defaults', async () => {
      const wrapper = createWrapper();
      await nextTick();

      await wrapper.find(ADD_ALLOCATION_BTN(10)).trigger('click');

      const newAllocation = store.budget!.allocations[store.budget!.allocations.length - 1];
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
      const wrapper = await createWrapperWithFixedCollapsed();

      const rows = wrapper.findAll(ALLOCATION_ROW);
      expect(rows).toHaveLength(2);
      expect(rows.map((r) => r.text()).join()).not.toContain('Rent');
    });

    it('shows a per-category "Fixed" subtotal row', async () => {
      const wrapper = await createWrapperWithFixedCollapsed();

      const fixedRow = wrapper.find(FIXED_SUBTOTAL(10));
      expect(fixedRow.exists()).toBe(true);
      expect(fixedRow.text()).toContain('1,000.00');
    });

    it('category totals still sum all allocations (fixed + variable)', async () => {
      const wrapper = await createWrapperWithFixedCollapsed();

      // Essentials: Groceries 500 + Rent 1000 = 1500.00
      const header = wrapper.find(CATEGORY_HEADER(10));
      const amountCell = header.findAll('td')[1];
      expect(amountCell.text()).toBe('1,500.00');
    });

    it('footer totals still reflect full budget', async () => {
      const wrapper = await createWrapperWithFixedCollapsed();

      const footer = wrapper.find(TOTAL_ROW);
      const amountCell = footer.findAll('th')[1];
      expect(amountCell.text()).toBe('1,700.00');
    });

    it('shows overall fixed total row in footer', async () => {
      const wrapper = await createWrapperWithFixedCollapsed();

      const fixedTotalRow = wrapper.find('[data-testid="fixed-total-row"]');
      expect(fixedTotalRow.exists()).toBe(true);
      expect(fixedTotalRow.text()).toContain('1,000.00');
    });
  });

  describe('edge cases', () => {
    it('renders nothing when budget is null', () => {
      store.budget = null;
      const wrapper = createWrapper();

      expect(wrapper.findAll(ALLOCATION_ROW)).toHaveLength(0);
    });

    it('renders empty categories with header but no allocation rows', () => {
      store.budget = buildBudgetDetail({
        id: 100,
        name: 'Empty',
        incomes: [],
        allocations: [],
      });
      const wrapper = createWrapper();

      expect(wrapper.find(CATEGORY_HEADER(10)).exists()).toBe(true);
      expect(wrapper.findAll(ALLOCATION_ROW)).toHaveLength(0);
    });

    it('handles allocations with zero amounts gracefully', () => {
      store.budget = buildBudgetDetail({
        id: 100,
        name: 'Test',
        incomes: [],
        allocations: [buildAllocation({ id: 1, allocation_category_id: 10, amount: 0, spent: 0 })],
      });
      const wrapper = createWrapper();

      const row = wrapper.find(ALLOCATION_ROW);
      expect(row.exists()).toBe(true);
      expect(row.text()).toContain('0.00');
    });
  });
});
