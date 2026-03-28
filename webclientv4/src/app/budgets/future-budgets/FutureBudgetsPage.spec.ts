import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import FutureBudgetsPage from './FutureBudgetsPage.vue';
import type { FutureBudgetData } from './futureBudgets.types';
import type { AllocationCategoryData } from '../../allocation-categories/allocationCategory.types';
import type { MassUpdatePayload } from './futureBudgets.types';

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

const jan2025: FutureBudgetData = {
  id: 1,
  name: 'Jan 2025',
  start_date: '2025-01-01',
  end_date: '2025-01-31',
  status: 'open',
  incomes: [{ id: 10, name: 'Salary', amount: 500000, budget_id: 1, bank_account_id: 1 }],
  allocations: [
    { id: 50, name: 'Rent', amount: 150000, budget_id: 1, allocation_category_id: 3 },
  ],
};

const feb2025: FutureBudgetData = {
  id: 2,
  name: 'Feb 2025',
  start_date: '2025-02-01',
  end_date: '2025-02-28',
  status: 'open',
  incomes: [{ id: 20, name: 'Salary', amount: 510000, budget_id: 2, bank_account_id: 1 }],
  allocations: [
    { id: 60, name: 'Rent', amount: 150000, budget_id: 2, allocation_category_id: 3 },
  ],
};

const fixedCategory: AllocationCategoryData = { id: 3, name: 'Fixed' };

const mockStore = reactive({
  budgets: [jan2025, feb2025] as FutureBudgetData[],
  allocationCategories: [fixedCategory] as AllocationCategoryData[],
  settings: { family_type: 'couple', husband: 'Alice', wife: 'Bob' } as {
    family_type?: string;
    husband?: string;
    wife?: string;
    single_person?: string;
  },
  loading: false,
  error: null as string | null,
  incomeDisplayData: {
    Salary: {
      1: { id: 10, amount: 500000 },
      2: { id: 20, amount: 510000 },
    },
  } as Record<string, Record<number, { id: number; amount: number }>>,
  incomeNames: ['Salary'],
  allocationDisplayData: {
    3: {
      Rent: {
        1: { id: 50, amount: 150000, is_fixed_amount: false },
        2: { id: 60, amount: 150000, is_fixed_amount: false },
      },
    },
  } as Record<number, Record<string, Record<number, { id: number; amount: number; is_fixed_amount: boolean }>>>,
  fetchAll: vi.fn().mockResolvedValue(undefined),
  massUpdate: vi.fn().mockResolvedValue(undefined),
  totalIncomeForBudget: vi.fn((b: FutureBudgetData) => (b.id === 1 ? 500000 : 510000)),
  totalAllocationsForBudget: vi.fn((_b: FutureBudgetData) => 150000),
  discretionaryForBudget: vi.fn((b: FutureBudgetData) => (b.id === 1 ? 350000 : 360000)),
});

vi.mock('./futureBudgetsStore', () => ({
  useFutureBudgetsStore: () => mockStore,
}));

const DialogStub = {
  name: 'BudgetMassEditDialog',
  template: '<div data-testid="mass-edit-dialog" />',
  props: ['visible', 'type', 'name', 'budgets', 'amountsPerBudget', 'categoryId'],
  emits: ['update:visible', 'save'],
};

function mountPage() {
  return mount(FutureBudgetsPage, {
    global: {
      plugins: [PrimeVue, createPinia()],
      stubs: { BudgetMassEditDialog: DialogStub },
    },
  });
}

describe('FutureBudgetsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStore.fetchAll.mockResolvedValue(undefined);
    mockStore.massUpdate.mockResolvedValue(undefined);
    mockStore.error = null;
    mockStore.settings = { family_type: 'couple', husband: 'Alice', wife: 'Bob' };
  });

  describe('on mount', () => {
    it('sets the page heading to "Future Budgets"', async () => {
      mountPage();
      await nextTick();

      expect(mockSetHeading).toHaveBeenCalledWith('Future Budgets');
    });

    it('calls fetchAll on mount', async () => {
      mountPage();
      await nextTick();

      expect(mockStore.fetchAll).toHaveBeenCalled();
    });
  });

  describe('table headers', () => {
    it('shows budget names as column headers', () => {
      const wrapper = mountPage();

      expect(wrapper.text()).toContain('Jan 2025');
      expect(wrapper.text()).toContain('Feb 2025');
    });
  });

  describe('income section', () => {
    it('renders the incomes section header', () => {
      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="incomes-section-header"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="incomes-section-header"]').text()).toBe('Incomes');
    });

    it('renders a row for each income name', () => {
      const wrapper = mountPage();

      const rows = wrapper.findAll('[data-testid="income-row"]');
      expect(rows).toHaveLength(1);
      expect(rows[0].text()).toContain('Salary');
    });

    it('shows amounts for each budget column', () => {
      const wrapper = mountPage();

      const row = wrapper.find('[data-testid="income-row"]');
      expect(row.text()).toContain('5,000.00');
      expect(row.text()).toContain('5,100.00');
    });

    it('shows an Add New Income button', () => {
      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="add-income-btn"]').exists()).toBe(true);
    });

    it('shows total income row', () => {
      const wrapper = mountPage();

      const totalRow = wrapper.find('[data-testid="total-income-row"]');
      expect(totalRow.exists()).toBe(true);
      expect(totalRow.text()).toContain('Total Income');
    });
  });

  describe('allocation section', () => {
    it('renders the allocations section header', () => {
      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="allocations-section-header"]').exists()).toBe(true);
    });

    it('renders a category header row for each allocation category', () => {
      const wrapper = mountPage();

      const header = wrapper.find('[data-testid="category-header-3"]');
      expect(header.exists()).toBe(true);
      expect(header.text()).toContain('Fixed');
    });

    it('renders allocation rows within each category', () => {
      const wrapper = mountPage();

      const rows = wrapper.findAll('[data-testid="allocation-row"]');
      expect(rows).toHaveLength(1);
      expect(rows[0].text()).toContain('Rent');
    });

    it('shows allocation amounts for each budget column', () => {
      const wrapper = mountPage();

      const row = wrapper.findAll('[data-testid="allocation-row"]')[0];
      expect(row.text()).toContain('1,500.00');
    });

    it('shows an add-allocation button per category', () => {
      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="add-allocation-btn-3"]').exists()).toBe(true);
    });

    it('shows total allocations row', () => {
      const wrapper = mountPage();

      const totalRow = wrapper.find('[data-testid="total-allocations-row"]');
      expect(totalRow.exists()).toBe(true);
      expect(totalRow.text()).toContain('Total Allocations');
    });
  });

  describe('summary footer', () => {
    it('shows total discretionary row', () => {
      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="total-discretionary-row"]').exists()).toBe(true);
    });

    describe('when family_type is couple', () => {
      it('shows husband and wife rows', () => {
        const wrapper = mountPage();

        expect(wrapper.find('[data-testid="husband-row"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="wife-row"]').exists()).toBe(true);
      });

      it('uses names from settings', () => {
        const wrapper = mountPage();

        expect(wrapper.find('[data-testid="husband-row"]').text()).toContain("Alice's Amount");
        expect(wrapper.find('[data-testid="wife-row"]').text()).toContain("Bob's Amount");
      });
    });

    describe('when family_type is single', () => {
      beforeEach(() => {
        mockStore.settings = { family_type: 'single', single_person: 'Charlie' };
      });

      it('shows a single person row', () => {
        const wrapper = mountPage();

        expect(wrapper.find('[data-testid="single-person-row"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="single-person-row"]').text()).toContain(
          "Charlie's Amount",
        );
      });

      it('does not show husband or wife rows', () => {
        const wrapper = mountPage();

        expect(wrapper.find('[data-testid="husband-row"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="wife-row"]').exists()).toBe(false);
      });
    });

    describe('when family_type is not set', () => {
      beforeEach(() => {
        mockStore.settings = {};
      });

      it('shows no per-person rows', () => {
        const wrapper = mountPage();

        expect(wrapper.find('[data-testid="husband-row"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="wife-row"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="single-person-row"]').exists()).toBe(false);
      });
    });
  });

  describe('opening income dialog', () => {
    it('opens the dialog with income type when an income name is clicked', async () => {
      const wrapper = mountPage();

      await wrapper.find('[data-testid="edit-income-Salary"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('type')).toBe('income');
      expect(dialog.props('name')).toBe('Salary');
    });

    it('passes the correct amountsPerBudget for the income', async () => {
      const wrapper = mountPage();

      await wrapper.find('[data-testid="edit-income-Salary"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      expect(dialog.props('amountsPerBudget')).toEqual(mockStore.incomeDisplayData['Salary']);
    });

    it('opens the dialog with empty amounts for new income', async () => {
      const wrapper = mountPage();

      await wrapper.find('[data-testid="add-income-btn"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      expect(dialog.props('name')).toBe('New Income');
      expect(dialog.props('amountsPerBudget')).toEqual({});
    });
  });

  describe('opening allocation dialog', () => {
    it('opens the dialog with allocation type when an allocation name is clicked', async () => {
      const wrapper = mountPage();

      await wrapper.find('[data-testid="edit-allocation-Rent"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      expect(dialog.props('visible')).toBe(true);
      expect(dialog.props('type')).toBe('allocation');
      expect(dialog.props('name')).toBe('Rent');
    });

    it('passes the category id to the dialog', async () => {
      const wrapper = mountPage();

      await wrapper.find('[data-testid="edit-allocation-Rent"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      expect(dialog.props('categoryId')).toBe(3);
    });

    it('passes the correct amountsPerBudget for the allocation', async () => {
      const wrapper = mountPage();

      await wrapper.find('[data-testid="edit-allocation-Rent"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      expect(dialog.props('amountsPerBudget')).toEqual(
        mockStore.allocationDisplayData[3]['Rent'],
      );
    });

    it('opens the dialog for a new allocation when add button is clicked', async () => {
      const wrapper = mountPage();

      await wrapper.find('[data-testid="add-allocation-btn-3"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      expect(dialog.props('name')).toBe('New Allocation');
      expect(dialog.props('categoryId')).toBe(3);
    });
  });

  describe('variable-only toggle', () => {
    it('shows a variable-only toggle button', () => {
      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="variable-only-toggle"]').exists()).toBe(true);
    });

    it('defaults to "All Allocations" label', () => {
      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="variable-only-toggle"]').text()).toContain('All Allocations');
    });

    it('toggles label to "Variable Only" when clicked', async () => {
      const wrapper = mountPage();

      await wrapper.find('[data-testid="variable-only-toggle"]').trigger('click');

      expect(wrapper.find('[data-testid="variable-only-toggle"]').text()).toContain('Variable Only');
    });
  });

  describe('variable-only mode filtering', () => {
    const billsCategory: AllocationCategoryData = { id: 5, name: 'Bills' };

    function setupVariableOnlyData() {
      // Category 3 (Fixed): Rent is fixed in ALL budgets, Insurance is fixed in all budgets
      // Category 5 (Bills): Electric is variable in all budgets, Internet is fixed in budget 1 but variable in budget 2
      mockStore.allocationCategories = [fixedCategory, billsCategory];
      mockStore.allocationDisplayData = {
        3: {
          Rent: {
            1: { id: 50, amount: 150000, is_fixed_amount: true },
            2: { id: 60, amount: 150000, is_fixed_amount: true },
          },
          Insurance: {
            1: { id: 51, amount: 50000, is_fixed_amount: true },
            2: { id: 61, amount: 50000, is_fixed_amount: true },
          },
        },
        5: {
          Electric: {
            1: { id: 70, amount: 20000, is_fixed_amount: false },
            2: { id: 80, amount: 22000, is_fixed_amount: false },
          },
          Internet: {
            1: { id: 71, amount: 10000, is_fixed_amount: true },
            2: { id: 81, amount: 10000, is_fixed_amount: false },
          },
        },
      };
    }

    it('shows all allocation rows in default mode', () => {
      setupVariableOnlyData();

      const wrapper = mountPage();
      const rows = wrapper.findAll('[data-testid="allocation-row"]');

      expect(rows).toHaveLength(4);
      expect(rows.map(r => r.text())).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Rent'),
          expect.stringContaining('Insurance'),
          expect.stringContaining('Electric'),
          expect.stringContaining('Internet'),
        ]),
      );
    });

    it('does not show fixed subtotal rows in default mode', () => {
      setupVariableOnlyData();

      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="fixed-subtotal-3"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="fixed-subtotal-5"]').exists()).toBe(false);
    });

    it('does not show fixed total row in footer in default mode', () => {
      setupVariableOnlyData();

      const wrapper = mountPage();

      expect(wrapper.find('[data-testid="fixed-total-row"]').exists()).toBe(false);
    });

    it('hides allocations that are fixed in ALL budgets when variable-only is active', async () => {
      setupVariableOnlyData();

      const wrapper = mountPage();
      await wrapper.find('[data-testid="variable-only-toggle"]').trigger('click');

      const rows = wrapper.findAll('[data-testid="allocation-row"]');
      const rowTexts = rows.map(r => r.text());

      // Rent and Insurance are fixed in all budgets — hidden
      expect(rowTexts).not.toEqual(expect.arrayContaining([expect.stringContaining('Rent')]));
      expect(rowTexts).not.toEqual(expect.arrayContaining([expect.stringContaining('Insurance')]));
    });

    it('keeps allocations that are variable in at least one budget', async () => {
      setupVariableOnlyData();

      const wrapper = mountPage();
      await wrapper.find('[data-testid="variable-only-toggle"]').trigger('click');

      const rows = wrapper.findAll('[data-testid="allocation-row"]');
      const rowTexts = rows.map(r => r.text());

      // Electric is variable in all budgets — visible
      expect(rowTexts).toEqual(expect.arrayContaining([expect.stringContaining('Electric')]));
      // Internet is fixed in budget 1 but variable in budget 2 — visible
      expect(rowTexts).toEqual(expect.arrayContaining([expect.stringContaining('Internet')]));
    });

    it('shows per-category fixed subtotal row with correct amounts per budget', async () => {
      setupVariableOnlyData();

      const wrapper = mountPage();
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

      const wrapper = mountPage();
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
      const wrapper = mountPage();

      await wrapper.find('[data-testid="refresh-btn"]').trigger('click');

      expect(mockStore.fetchAll).toHaveBeenCalledTimes(2); // once on mount, once on refresh
    });
  });

  describe('on save', () => {
    const payload: MassUpdatePayload = {
      type: 'income',
      name: 'Salary',
      amounts: [{ id: 10, amount: 500000, budget_id: 1 }],
    };

    it('calls store.massUpdate with the payload', async () => {
      const wrapper = mountPage();
      await wrapper.find('[data-testid="edit-income-Salary"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      await dialog.vm.$emit('save', payload);
      await nextTick();

      expect(mockStore.massUpdate).toHaveBeenCalledWith(payload);
    });

    it('closes the dialog and shows success toast after successful save', async () => {
      const wrapper = mountPage();
      await wrapper.find('[data-testid="edit-income-Salary"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      await dialog.vm.$emit('save', payload);
      await nextTick();

      expect(dialog.props('visible')).toBe(false);
      expect(mockNotifySuccess).toHaveBeenCalledWith('Changes saved');
    });

    it('keeps dialog open and shows error toast when save fails', async () => {
      const errorMessage = 'Save failed';
      mockStore.massUpdate.mockImplementation(async () => {
        mockStore.error = errorMessage;
        throw new Error('Server error');
      });

      const wrapper = mountPage();
      await wrapper.find('[data-testid="edit-income-Salary"]').trigger('click');

      const dialog = wrapper.findComponent({ name: 'BudgetMassEditDialog' });
      await dialog.vm.$emit('save', payload);
      await nextTick();

      expect(dialog.props('visible')).toBe(true);
      expect(mockNotifyError).toHaveBeenCalledWith(errorMessage);
    });
  });
});
