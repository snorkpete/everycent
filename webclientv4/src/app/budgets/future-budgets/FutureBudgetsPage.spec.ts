import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import type { Pinia } from 'pinia';
import PrimeVue from 'primevue/config';
import FutureBudgetsPage from './FutureBudgetsPage.vue';
import { futureBudgetsApi } from './futureBudgetsApi';
import { allocationCategoryApi } from '../../allocation-categories/allocationCategoryApi';
import { useSettingsStore } from '../../settings/settingsStore';
import type { FutureBudgetData, MassUpdatePayload } from './futureBudgets.types';
import type { AllocationCategoryData } from '../../allocation-categories/allocationCategory.types';
import type { SettingsData } from '../../settings/settings.types';
import {
  buildFutureBudget,
  buildFutureAllocation,
  buildFutureIncome,
  buildAllocationCategory,
  buildSettings,
} from '../../../test/factories';

const mockSetHeading = vi.fn();
vi.mock('../../toolbar/headingStore', () => ({
  useHeadingStore: () => ({ setHeading: mockSetHeading }),
}));

const mockNotifyError = vi.fn();
const mockNotifySuccess = vi.fn();
vi.mock('../../notifications/useNotifications', () => ({
  useNotifications: () => ({
    error: mockNotifyError,
    success: mockNotifySuccess,
    info: vi.fn(),
  }),
}));

vi.mock('./futureBudgetsApi', () => ({
  futureBudgetsApi: {
    getFutureBudgets: vi.fn(),
    massUpdate: vi.fn(),
  },
}));

vi.mock('../../allocation-categories/allocationCategoryApi', () => ({
  allocationCategoryApi: {
    getAll: vi.fn(),
  },
}));

const fixedCategory: AllocationCategoryData = buildAllocationCategory({ id: 3, name: 'Fixed' });

const jan2025: FutureBudgetData = buildFutureBudget({
  id: 1,
  name: 'Jan 2025',
  start_date: '2025-01-01',
  end_date: '2025-01-31',
  incomes: [buildFutureIncome({ id: 10, name: 'Salary', amount: 500000, budget_id: 1 })],
  allocations: [
    buildFutureAllocation({
      id: 50,
      name: 'Rent',
      amount: 150000,
      budget_id: 1,
      allocation_category_id: 3,
      is_fixed_amount: false,
    }),
  ],
});

const feb2025: FutureBudgetData = buildFutureBudget({
  id: 2,
  name: 'Feb 2025',
  start_date: '2025-02-01',
  end_date: '2025-02-28',
  incomes: [buildFutureIncome({ id: 20, name: 'Salary', amount: 510000, budget_id: 2 })],
  allocations: [
    buildFutureAllocation({
      id: 60,
      name: 'Rent',
      amount: 150000,
      budget_id: 2,
      allocation_category_id: 3,
      is_fixed_amount: false,
    }),
  ],
});

const defaultSettings: SettingsData = buildSettings({
  family_type: 'couple',
  husband: 'Alice',
  wife: 'Bob',
});

const DialogStub = {
  name: 'BudgetMassEditDialog',
  template: '<div data-testid="mass-edit-dialog" />',
  props: ['visible', 'type', 'name', 'budgets', 'amountsPerBudget', 'categoryId'],
  emits: ['update:visible', 'save'],
};

function setupDefaultApiMocks(
  budgets: FutureBudgetData[] = [jan2025, feb2025],
  categories: AllocationCategoryData[] = [fixedCategory],
  settings: SettingsData = defaultSettings,
) {
  vi.mocked(futureBudgetsApi.getFutureBudgets).mockResolvedValue(budgets);
  vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(categories);
  vi.mocked(futureBudgetsApi.massUpdate).mockResolvedValue({ success: true });
  const settingsStore = useSettingsStore();
  settingsStore.settings = settings;
}

let pinia: Pinia;

function createWrapper(): VueWrapper {
  return mount(FutureBudgetsPage, {
    global: {
      plugins: [PrimeVue, pinia],
      stubs: { BudgetMassEditDialog: DialogStub },
    },
  });
}

describe('FutureBudgetsPage', () => {
  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
    setupDefaultApiMocks();
  });

  describe('on mount', () => {
    it('sets the page heading to "Future Budgets"', async () => {
      createWrapper();
      await flushPromises();

      expect(mockSetHeading).toHaveBeenCalledWith('Future Budgets');
    });

    it('calls both API endpoints on mount', async () => {
      createWrapper();
      await flushPromises();

      expect(futureBudgetsApi.getFutureBudgets).toHaveBeenCalled();
      expect(allocationCategoryApi.getAll).toHaveBeenCalled();
    });
  });

  describe('table headers', () => {
    it('shows budget names as column headers', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.text()).toContain('Jan 2025');
      expect(wrapper.text()).toContain('Feb 2025');
    });
  });

  describe('income section', () => {
    it('renders the incomes section header', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="incomes-section-header"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="incomes-section-header"]').text()).toBe('Incomes');
    });

    it('renders a row for each income name', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const rows = wrapper.findAll('[data-testid="income-row"]');
      expect(rows).toHaveLength(1);
      expect(rows[0].text()).toContain('Salary');
    });

    it('shows amounts for each budget column', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const row = wrapper.find('[data-testid="income-row"]');
      expect(row.text()).toContain('5,000.00');
      expect(row.text()).toContain('5,100.00');
    });

    it('shows an Add New Income button', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="add-income-btn"]').exists()).toBe(true);
    });

    it('shows total income row', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const totalRow = wrapper.find('[data-testid="total-income-row"]');
      expect(totalRow.exists()).toBe(true);
      expect(totalRow.text()).toContain('Total Income');
    });
  });

  describe('allocation section', () => {
    it('renders the allocations section header', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="allocations-section-header"]').exists()).toBe(true);
    });

    it('renders a category header row for each allocation category', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const header = wrapper.find('[data-testid="category-header-3"]');
      expect(header.exists()).toBe(true);
      expect(header.text()).toContain('Fixed');
    });

    it('renders allocation rows within each category', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const rows = wrapper.findAll('[data-testid="allocation-row"]');
      expect(rows).toHaveLength(1);
      expect(rows[0].text()).toContain('Rent');
    });

    it('shows allocation amounts for each budget column', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const row = wrapper.findAll('[data-testid="allocation-row"]')[0];
      expect(row.text()).toContain('1,500.00');
    });

    it('shows an add-allocation button per category', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="add-allocation-btn-3"]').exists()).toBe(true);
    });

    it('shows total allocations row', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const totalRow = wrapper.find('[data-testid="total-allocations-row"]');
      expect(totalRow.exists()).toBe(true);
      expect(totalRow.text()).toContain('Total Allocations');
    });
  });

  describe('summary footer', () => {
    it('shows total discretionary row', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="total-discretionary-row"]').exists()).toBe(true);
    });

    describe('when family_type is couple', () => {
      it('shows husband and wife rows', async () => {
        const wrapper = createWrapper();
        await flushPromises();

        expect(wrapper.find('[data-testid="husband-row"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="wife-row"]').exists()).toBe(true);
      });

      it('uses names from settings', async () => {
        const wrapper = createWrapper();
        await flushPromises();

        expect(wrapper.find('[data-testid="husband-row"]').text()).toContain("Alice's Amount");
        expect(wrapper.find('[data-testid="wife-row"]').text()).toContain("Bob's Amount");
      });
    });

    describe('when family_type is single', () => {
      beforeEach(() => {
        setupDefaultApiMocks(
          [jan2025, feb2025],
          [fixedCategory],
          buildSettings({ family_type: 'single', single_person: 'Charlie' }),
        );
      });

      it('shows a single person row', async () => {
        const wrapper = createWrapper();
        await flushPromises();

        expect(wrapper.find('[data-testid="single-person-row"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="single-person-row"]').text()).toContain(
          "Charlie's Amount",
        );
      });

      it('does not show husband or wife rows', async () => {
        const wrapper = createWrapper();
        await flushPromises();

        expect(wrapper.find('[data-testid="husband-row"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="wife-row"]').exists()).toBe(false);
      });
    });

    describe('when family_type is not set', () => {
      beforeEach(() => {
        setupDefaultApiMocks(
          [jan2025, feb2025],
          [fixedCategory],
          buildSettings({ family_type: undefined }),
        );
      });

      it('shows no per-person rows', async () => {
        const wrapper = createWrapper();
        await flushPromises();

        expect(wrapper.find('[data-testid="husband-row"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="wife-row"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="single-person-row"]').exists()).toBe(false);
      });
    });
  });

  describe('opening income dialog', () => {
    it('opens the dialog with income type when an income name is clicked', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('[data-testid="edit-income-Salary"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('type')).toBe('income');
      expect(dialog.props('name')).toBe('Salary');
    });

    it('passes the correct amountsPerBudget for the income', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('[data-testid="edit-income-Salary"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      expect(dialog.props('amountsPerBudget')).toEqual({
        1: { id: 10, amount: 500000 },
        2: { id: 20, amount: 510000 },
      });
    });

    it('opens the dialog with empty amounts for new income', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('[data-testid="add-income-btn"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      expect(dialog.props('name')).toBe('New Income');
      expect(dialog.props('amountsPerBudget')).toEqual({});
    });
  });

  describe('opening allocation dialog', () => {
    it('opens the dialog with allocation type when an allocation name is clicked', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('[data-testid="edit-allocation-Rent"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('type')).toBe('allocation');
      expect(dialog.props('name')).toBe('Rent');
    });

    it('passes the category id to the dialog', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('[data-testid="edit-allocation-Rent"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      expect(dialog.props('categoryId')).toBe(3);
    });

    it('passes the correct amountsPerBudget for the allocation', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('[data-testid="edit-allocation-Rent"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      expect(dialog.props('amountsPerBudget')).toEqual({
        1: { id: 50, amount: 150000, is_fixed_amount: false },
        2: { id: 60, amount: 150000, is_fixed_amount: false },
      });
    });

    it('opens the dialog for a new allocation when add button is clicked', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('[data-testid="add-allocation-btn-3"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      expect(dialog.props('name')).toBe('New Allocation');
      expect(dialog.props('categoryId')).toBe(3);
    });
  });

  describe('variable-only toggle', () => {
    it('shows a variable-only toggle button', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="variable-only-toggle"]').exists()).toBe(true);
    });

    it('defaults to "All Allocations" label', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="variable-only-toggle"]').text()).toContain(
        'All Allocations',
      );
    });

    it('toggles label to "Variable Only" when clicked', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('[data-testid="variable-only-toggle"]').trigger('click');

      expect(wrapper.find('[data-testid="variable-only-toggle"]').text()).toContain(
        'Variable Only',
      );
    });
  });

  describe('variable-only mode filtering', () => {
    const billsCategory: AllocationCategoryData = buildAllocationCategory({
      id: 5,
      name: 'Bills',
    });

    function setupVariableOnlyData() {
      const jan = buildFutureBudget({
        id: 1,
        name: 'Jan 2025',
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        incomes: [buildFutureIncome({ id: 10, name: 'Salary', amount: 500000, budget_id: 1 })],
        allocations: [
          buildFutureAllocation({
            id: 50,
            name: 'Rent',
            amount: 150000,
            budget_id: 1,
            allocation_category_id: 3,
            is_fixed_amount: true,
          }),
          buildFutureAllocation({
            id: 51,
            name: 'Insurance',
            amount: 50000,
            budget_id: 1,
            allocation_category_id: 3,
            is_fixed_amount: true,
          }),
          buildFutureAllocation({
            id: 70,
            name: 'Electric',
            amount: 20000,
            budget_id: 1,
            allocation_category_id: 5,
            is_fixed_amount: false,
          }),
          buildFutureAllocation({
            id: 71,
            name: 'Internet',
            amount: 10000,
            budget_id: 1,
            allocation_category_id: 5,
            is_fixed_amount: true,
          }),
        ],
      });

      const feb = buildFutureBudget({
        id: 2,
        name: 'Feb 2025',
        start_date: '2025-02-01',
        end_date: '2025-02-28',
        incomes: [buildFutureIncome({ id: 20, name: 'Salary', amount: 510000, budget_id: 2 })],
        allocations: [
          buildFutureAllocation({
            id: 60,
            name: 'Rent',
            amount: 150000,
            budget_id: 2,
            allocation_category_id: 3,
            is_fixed_amount: true,
          }),
          buildFutureAllocation({
            id: 61,
            name: 'Insurance',
            amount: 50000,
            budget_id: 2,
            allocation_category_id: 3,
            is_fixed_amount: true,
          }),
          buildFutureAllocation({
            id: 80,
            name: 'Electric',
            amount: 22000,
            budget_id: 2,
            allocation_category_id: 5,
            is_fixed_amount: false,
          }),
          buildFutureAllocation({
            id: 81,
            name: 'Internet',
            amount: 10000,
            budget_id: 2,
            allocation_category_id: 5,
            is_fixed_amount: false,
          }),
        ],
      });

      setupDefaultApiMocks([jan, feb], [fixedCategory, billsCategory], defaultSettings);
    }

    it('shows all allocation rows in default mode', async () => {
      setupVariableOnlyData();

      const wrapper = createWrapper();
      await flushPromises();
      const rows = wrapper.findAll('[data-testid="allocation-row"]');

      expect(rows).toHaveLength(4);
      expect(rows.map((r) => r.text())).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Rent'),
          expect.stringContaining('Insurance'),
          expect.stringContaining('Electric'),
          expect.stringContaining('Internet'),
        ]),
      );
    });

    it('does not show fixed subtotal rows in default mode', async () => {
      setupVariableOnlyData();

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="fixed-subtotal-3"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="fixed-subtotal-5"]').exists()).toBe(false);
    });

    it('does not show fixed total row in footer in default mode', async () => {
      setupVariableOnlyData();

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('[data-testid="fixed-total-row"]').exists()).toBe(false);
    });

    it('hides allocations that are fixed in ALL budgets when variable-only is active', async () => {
      setupVariableOnlyData();

      const wrapper = createWrapper();
      await flushPromises();
      await wrapper.find('[data-testid="variable-only-toggle"]').trigger('click');

      const rows = wrapper.findAll('[data-testid="allocation-row"]');
      const rowTexts = rows.map((r) => r.text());

      // Rent and Insurance are fixed in all budgets — hidden
      expect(rowTexts).not.toEqual(expect.arrayContaining([expect.stringContaining('Rent')]));
      expect(rowTexts).not.toEqual(expect.arrayContaining([expect.stringContaining('Insurance')]));
    });

    it('keeps allocations that are variable in at least one budget', async () => {
      setupVariableOnlyData();

      const wrapper = createWrapper();
      await flushPromises();
      await wrapper.find('[data-testid="variable-only-toggle"]').trigger('click');

      const rows = wrapper.findAll('[data-testid="allocation-row"]');
      const rowTexts = rows.map((r) => r.text());

      // Electric is variable in all budgets — visible
      expect(rowTexts).toEqual(expect.arrayContaining([expect.stringContaining('Electric')]));
      // Internet is fixed in budget 1 but variable in budget 2 — visible
      expect(rowTexts).toEqual(expect.arrayContaining([expect.stringContaining('Internet')]));
    });

    it('shows per-category fixed subtotal row with correct amounts per budget', async () => {
      setupVariableOnlyData();

      const wrapper = createWrapper();
      await flushPromises();
      await wrapper.find('[data-testid="variable-only-toggle"]').trigger('click');

      // Category 3 has Rent (150000) + Insurance (50000) = 200000 fixed in both budgets
      const fixedSubtotal3 = wrapper.find('[data-testid="fixed-subtotal-3"]');
      expect(fixedSubtotal3.exists()).toBe(true);
      expect(fixedSubtotal3.text()).toContain('2,000.00'); // 200000 cents = 2000.00

      // Category 5 has Internet fixed in budget 1 only (10000)
      const fixedSubtotal5 = wrapper.find('[data-testid="fixed-subtotal-5"]');
      expect(fixedSubtotal5.exists()).toBe(true);
      expect(fixedSubtotal5.text()).toContain('100.00'); // 10000 cents = 100.00 (budget 1)
    });

    it('shows overall fixed total row in footer with correct amounts per budget', async () => {
      setupVariableOnlyData();

      const wrapper = createWrapper();
      await flushPromises();
      await wrapper.find('[data-testid="variable-only-toggle"]').trigger('click');

      const fixedTotalRow = wrapper.find('[data-testid="fixed-total-row"]');
      expect(fixedTotalRow.exists()).toBe(true);
      // Budget 1: Rent 150000 + Insurance 50000 + Internet 10000 = 210000 = 2,100.00
      // Budget 2: Rent 150000 + Insurance 50000 = 200000 = 2,000.00
      expect(fixedTotalRow.text()).toContain('Fixed Total');
      expect(fixedTotalRow.text()).toContain('2,100.00');
      expect(fixedTotalRow.text()).toContain('2,000.00');
    });
  });

  describe('Refresh button', () => {
    it('calls fetchAll when refresh button is clicked', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('[data-testid="refresh-btn"]').trigger('click');
      await flushPromises();

      // once on mount, once on refresh
      expect(futureBudgetsApi.getFutureBudgets).toHaveBeenCalledTimes(2);
    });
  });

  describe('on save', () => {
    const payload: MassUpdatePayload = {
      type: 'income',
      name: 'Salary',
      amounts: [{ id: 10, amount: 500000, budget_id: 1 }],
    };

    it('calls futureBudgetsApi.massUpdate with the payload', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      await wrapper.find('[data-testid="edit-income-Salary"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      await dialog.vm.$emit('save', payload);
      await flushPromises();

      expect(futureBudgetsApi.massUpdate).toHaveBeenCalledWith(payload);
    });

    it('closes the dialog and shows success toast after successful save', async () => {
      const wrapper = createWrapper();
      await flushPromises();
      await wrapper.find('[data-testid="edit-income-Salary"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      await dialog.vm.$emit('save', payload);
      await flushPromises();

      expect(dialog.props('visible')).toBe(false);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Changes saved');
    });

    it('keeps dialog open and shows error toast when save fails', async () => {
      vi.mocked(futureBudgetsApi.massUpdate).mockRejectedValue(new Error('Server error'));

      const wrapper = createWrapper();
      await flushPromises();
      await wrapper.find('[data-testid="edit-income-Salary"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      await dialog.vm.$emit('save', payload);
      await flushPromises();

      expect(dialog.props('visible')).toBe(true);
      expect(mockNotifyError).toHaveBeenCalled();
    });
  });
});
