import { describe, it, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import SpecialEventAvailableAllocationsMobile from './SpecialEventAvailableAllocationsMobile.vue';
import type { AllocationData } from '../transactions/transaction.types';
import type { BudgetData } from '../budgets/budget.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';

const budgets: BudgetData[] = [
  { id: 1, name: 'Aug 2024' } as BudgetData,
  { id: 2, name: 'Sep 2024' } as BudgetData,
];

const categories: AllocationCategoryData[] = [{ id: 10, name: 'Travel' } as AllocationCategoryData];

const allocation1 = {
  id: 100,
  name: 'Hotel',
  amount: 30000,
  spent: 25000,
  allocation_category_id: 10,
} as AllocationData;

const allocation2 = {
  id: 101,
  name: 'Food',
  amount: 10000,
  spent: 8000,
  allocation_category_id: 10,
} as AllocationData;

const groupedWithHeader: (AllocationData & { _isCategoryHeader?: boolean })[] = [
  { name: 'Travel', _isCategoryHeader: true } as AllocationData & { _isCategoryHeader: boolean },
  allocation1,
  allocation2,
];

function createWrapper(
  overrides: {
    groupedAllocations?: typeof groupedWithHeader;
    selectedBudgetId?: number | null;
    selectedCategoryId?: number | null;
    isAssigned?: (a: AllocationData) => boolean;
  } = {},
): VueWrapper {
  return mount(SpecialEventAvailableAllocationsMobile, {
    props: {
      budgets,
      allocationCategories: categories,
      selectedBudgetId: (overrides.selectedBudgetId !== undefined
        ? overrides.selectedBudgetId
        : 1) as number | null,
      selectedCategoryId: (overrides.selectedCategoryId !== undefined
        ? overrides.selectedCategoryId
        : null) as number | null,
      groupedAllocations: overrides.groupedAllocations ?? groupedWithHeader,
      isAssigned: overrides.isAssigned ?? (() => false),
    },
    global: { plugins: [PrimeVue] },
  });
}

describe('SpecialEventAvailableAllocationsMobile', () => {
  describe('filter dropdowns', () => {
    it('renders a budget select', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="budget-select"]').exists()).toBe(true);
    });

    it('renders a category select', () => {
      const wrapper = createWrapper();

      expect(wrapper.find('[data-testid="category-select"]').exists()).toBe(true);
    });
  });

  describe('allocation cards', () => {
    it('renders category headers', () => {
      const wrapper = createWrapper();

      const headers = wrapper.findAll('[data-testid="category-header"]');
      expect(headers).toHaveLength(1);
      expect(headers[0].text()).toBe('Travel');
    });

    it('renders allocation cards', () => {
      const wrapper = createWrapper();

      const cards = wrapper.findAll('[data-testid="available-allocation-card"]');
      expect(cards).toHaveLength(2);
    });

    it('displays allocation names', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('Hotel');
      expect(wrapper.text()).toContain('Food');
    });

    it('displays spent amounts', () => {
      const wrapper = createWrapper();

      expect(wrapper.text()).toContain('250.00');
      expect(wrapper.text()).toContain('80.00');
    });
  });

  describe('add button', () => {
    it('emits add when clicked', async () => {
      const wrapper = createWrapper();

      await wrapper.find('[data-testid="add-btn-100"]').trigger('click');

      expect(wrapper.emitted('add')).toEqual([[allocation1]]);
    });

    it('disables the button when allocation is already assigned', () => {
      const wrapper = createWrapper({
        isAssigned: (a) => a.id === 100,
      });

      const btn = wrapper.find('[data-testid="add-btn-100"]');
      expect(btn.attributes('data-p-disabled')).toBe('true');
    });

    it('has a tooltip', () => {
      const wrapper = createWrapper();

      const btn = wrapper.find('[data-testid="add-btn-100"]');
      expect(btn.attributes('data-pd-tooltip')).toBeTruthy();
    });
  });

  describe('empty state', () => {
    it('shows prompt to select budget when none selected', () => {
      const wrapper = createWrapper({
        selectedBudgetId: null,
        groupedAllocations: [],
      });

      const empty = wrapper.find('[data-testid="empty-available"]');
      expect(empty.text()).toContain('Select a budget');
    });

    it('shows no allocations message when budget selected but empty', () => {
      const wrapper = createWrapper({
        selectedBudgetId: 1,
        groupedAllocations: [],
      });

      const empty = wrapper.find('[data-testid="empty-available"]');
      expect(empty.text()).toContain('No allocations in this budget');
    });
  });
});
