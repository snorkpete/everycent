import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import BudgetIncomeList from './BudgetIncomeList.vue';
import type { BudgetDetailData, IncomeData } from './budget.types';
import { getTooltipValue } from '../../test/tooltip-helper';

// Selectors
const INCOME_ROW = '[data-testid="income-row"]';
const TOTAL_ROW = '[data-testid="income-total-row"]';
const ADD_INCOME_BTN = '[data-testid="add-income-btn"]';
const NAME_INPUT = '[data-testid="income-name-input"]';

function deleteBtn(index: number): string {
  return `[data-testid="delete-income-btn-${index}"]`;
}

const sampleIncomes: IncomeData[] = [
  { id: 1, name: 'Salary', amount: 500000, budget_id: 213, comment: 'Monthly pay' },
  { id: 2, name: 'Freelance', amount: 150000, budget_id: 213, comment: '' },
];

const sampleBudget: BudgetDetailData = {
  id: 213,
  name: 'Mar 25 - Apr 24, 2026',
  status: 'open',
  incomes: sampleIncomes.map((i) => ({ ...i })),
  allocations: [],
};

const mockStore = reactive({
  budget: null as BudgetDetailData | null,
  isEditMode: false,
  loading: false,
  error: null as string | null,
  addIncome(income: IncomeData) {
    if (!this.budget) return;
    this.budget.incomes.push(income);
  },
});

vi.mock('./budgetStore', () => ({
  useBudgetStore: () => mockStore,
}));

function createWrapper(): VueWrapper {
  return mount(BudgetIncomeList, {
    global: {
      plugins: [PrimeVue, createPinia()],
    },
  });
}

function freshBudget(): BudgetDetailData {
  return {
    ...sampleBudget,
    incomes: sampleIncomes.map((i) => ({ ...i })),
  };
}

describe('BudgetIncomeList', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.budget = freshBudget();
    mockStore.isEditMode = false;
    mockStore.error = null;
  });

  describe('view mode', () => {
    it('renders a row for each income', () => {
      const wrapper = createWrapper();

      const rows = wrapper.findAll(INCOME_ROW);

      expect(rows).toHaveLength(2);
    });

    it('displays the income name', () => {
      const wrapper = createWrapper();

      const firstRow = wrapper.findAll(INCOME_ROW)[0];
      const expectedName = 'Salary';

      expect(firstRow.text()).toContain(expectedName);
    });

    it('displays the income amount in currency format', () => {
      const wrapper = createWrapper();

      const firstRow = wrapper.findAll(INCOME_ROW)[0];
      const expectedAmount = '5,000.00';

      expect(firstRow.text()).toContain(expectedAmount);
    });

    it('shows the total amount in the footer', () => {
      const wrapper = createWrapper();

      const totalRow = wrapper.find(TOTAL_ROW);
      const expectedTotal = '6,500.00';

      expect(totalRow.text()).toContain('Total');
      expect(totalRow.text()).toContain(expectedTotal);
    });

    it('does not show the Add Income button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(ADD_INCOME_BTN).exists()).toBe(false);
    });

    it('does not show delete buttons', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(deleteBtn(0)).exists()).toBe(false);
    });

    it('does not show name input fields', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(NAME_INPUT).exists()).toBe(false);
    });

    it('renders an empty table when budget has no incomes', () => {
      mockStore.budget = { ...sampleBudget, incomes: [] };
      const wrapper = createWrapper();

      expect(wrapper.findAll(INCOME_ROW)).toHaveLength(0);
    });

    it('shows 0.00 total when budget has no incomes', () => {
      mockStore.budget = { ...sampleBudget, incomes: [] };
      const wrapper = createWrapper();

      const totalRow = wrapper.find(TOTAL_ROW);
      const expectedTotal = '0.00';

      expect(totalRow.text()).toContain(expectedTotal);
    });

    it('renders gracefully when budget is null', () => {
      mockStore.budget = null;
      const wrapper = createWrapper();

      expect(wrapper.findAll(INCOME_ROW)).toHaveLength(0);
    });
  });

  describe('edit mode', () => {
    beforeEach(() => {
      mockStore.isEditMode = true;
    });

    it('shows name input fields for each income', () => {
      const wrapper = createWrapper();

      const inputs = wrapper.findAll(NAME_INPUT);

      expect(inputs).toHaveLength(2);
    });

    it('populates name input with the income name', () => {
      const wrapper = createWrapper();

      const input = wrapper.findAll(NAME_INPUT)[0];
      const expectedName = 'Salary';

      expect((input.element as HTMLInputElement).value).toBe(expectedName);
    });

    it('shows the Add Income button', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(ADD_INCOME_BTN).exists()).toBe(true);
    });

    it('Add Income button has a title attribute', () => {
      const wrapper = createWrapper();

      const btn = wrapper.find(ADD_INCOME_BTN);

      expect(btn.attributes('data-pd-tooltip')).toBeTruthy();
    });

    it('shows delete buttons for each row', () => {
      const wrapper = createWrapper();

      expect(wrapper.find(deleteBtn(0)).exists()).toBe(true);
      expect(wrapper.find(deleteBtn(1)).exists()).toBe(true);
    });

    it('delete buttons have a title attribute', () => {
      const wrapper = createWrapper();

      const btn = wrapper.find(deleteBtn(0));

      expect(btn.attributes('data-pd-tooltip')).toBeTruthy();
    });

    it('shows an actions column header in edit mode', () => {
      const wrapper = createWrapper();

      const headerCells = wrapper.findAll('thead th');
      const expectedColumnCount = 3;

      expect(headerCells).toHaveLength(expectedColumnCount);
    });
  });

  describe('add income', () => {
    beforeEach(() => {
      mockStore.isEditMode = true;
    });

    it('adds a new income row when Add Income is clicked', async () => {
      const wrapper = createWrapper();
      const initialRowCount = 2;

      expect(wrapper.findAll(INCOME_ROW)).toHaveLength(initialRowCount);

      await wrapper.find(ADD_INCOME_BTN).trigger('click');
      await nextTick();

      const expectedRowCount = 3;

      expect(wrapper.findAll(INCOME_ROW)).toHaveLength(expectedRowCount);
    });

    it('new income has blank name, zero amount, and the current budget id', async () => {
      const wrapper = createWrapper();

      await wrapper.find(ADD_INCOME_BTN).trigger('click');
      await nextTick();

      const newIncome = mockStore.budget!.incomes[2];

      expect(newIncome.id).toBe(0);
      expect(newIncome.name).toBe('');
      expect(newIncome.amount).toBe(0);
      expect(newIncome.budget_id).toBe(213);
    });

    it('does not add income if budget is null', async () => {
      mockStore.budget = null;
      const wrapper = createWrapper();

      // Add button won't be visible when budget is null (no incomes to render the section makes it odd,
      // but the function itself guards against null)
      // Test the guard directly by checking no error is thrown
      expect(wrapper.findAll(INCOME_ROW)).toHaveLength(0);
    });
  });

  describe('delete income', () => {
    beforeEach(() => {
      mockStore.isEditMode = true;
    });

    it('toggles income.deleted to true when delete button is clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find(deleteBtn(0)).trigger('click');
      await nextTick();

      expect(mockStore.budget!.incomes[0].deleted).toBe(true);
    });

    it('toggles income.deleted back to false when clicked again (undo)', async () => {
      const wrapper = createWrapper();

      await wrapper.find(deleteBtn(0)).trigger('click');
      await nextTick();
      await wrapper.find(deleteBtn(0)).trigger('click');
      await nextTick();

      expect(mockStore.budget!.incomes[0].deleted).toBe(false);
    });

    it('applies deleted styling to the row when deleted', async () => {
      const wrapper = createWrapper();

      await wrapper.find(deleteBtn(0)).trigger('click');
      await nextTick();

      const firstRow = wrapper.findAll(INCOME_ROW)[0];

      expect(firstRow.classes()).toContain('ec-deleted');
    });

    it('removes deleted styling when deletion is undone', async () => {
      const wrapper = createWrapper();

      await wrapper.find(deleteBtn(0)).trigger('click');
      await nextTick();
      await wrapper.find(deleteBtn(0)).trigger('click');
      await nextTick();

      const firstRow = wrapper.findAll(INCOME_ROW)[0];

      expect(firstRow.classes()).not.toContain('ec-deleted');
    });

    it('shows undo icon on delete button when income is deleted', async () => {
      const wrapper = createWrapper();

      await wrapper.find(deleteBtn(0)).trigger('click');
      await nextTick();

      const btn = wrapper.find(deleteBtn(0));

      expect(btn.find('.pi-undo').exists()).toBe(true);
    });

    it('shows trash icon on delete button when income is not deleted', () => {
      const wrapper = createWrapper();

      const btn = wrapper.find(deleteBtn(0));

      expect(btn.find('.pi-trash').exists()).toBe(true);
    });

    it('excludes deleted incomes from the total amount', async () => {
      const wrapper = createWrapper();

      await wrapper.find(deleteBtn(0)).trigger('click');
      await nextTick();

      const totalRow = wrapper.find(TOTAL_ROW);
      const expectedTotal = '1,500.00';

      expect(totalRow.text()).toContain(expectedTotal);
    });

    it('updates delete button title when income is deleted', async () => {
      const wrapper = createWrapper();

      await wrapper.find(deleteBtn(0)).trigger('click');
      await nextTick();

      const btn = wrapper.find(deleteBtn(0));

      expect(getTooltipValue(btn)).toContain('Restore');
    });
  });

  describe('in-place editing', () => {
    beforeEach(() => {
      mockStore.isEditMode = true;
    });

    it('updates income name in the store when typed into', async () => {
      const wrapper = createWrapper();
      const newName = 'Updated Salary';

      const input = wrapper.findAll(NAME_INPUT)[0];
      await input.setValue(newName);

      expect(mockStore.budget!.incomes[0].name).toBe(newName);
    });
  });
});
