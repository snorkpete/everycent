import { describe, it, expect } from 'vitest';
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { useAllocationGrouping, type AllocationGroupingOptions } from './useAllocationGrouping';
import type { AllocationData } from '../transactions/transaction.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';

const essentials: AllocationCategoryData = { id: 10, name: 'Essentials' };
const lifestyle: AllocationCategoryData = { id: 20, name: 'Lifestyle' };

function buildAllocations(): AllocationData[] {
  return [
    {
      id: 1,
      name: 'Groceries',
      amount: 50000,
      spent: 30000,
      allocation_category_id: 10,
      is_fixed_amount: false,
    },
    {
      id: 2,
      name: 'Rent',
      amount: 100000,
      spent: 100000,
      allocation_category_id: 10,
      is_fixed_amount: true,
    },
    {
      id: 3,
      name: 'Entertainment',
      amount: 20000,
      spent: 25000,
      allocation_category_id: 20,
      is_fixed_amount: false,
    },
  ];
}

function setup({
  allocations = buildAllocations(),
  categories = [essentials, lifestyle],
  totalIncome = 250000,
  options,
}: {
  allocations?: AllocationData[];
  categories?: AllocationCategoryData[];
  totalIncome?: number;
  options?: AllocationGroupingOptions;
} = {}) {
  const allocationsRef = ref(allocations) as Ref<AllocationData[]>;
  const categoriesRef = ref(categories) as Ref<AllocationCategoryData[]>;
  const totalIncomeRef = ref(totalIncome);
  const result = useAllocationGrouping(
    computed(() => allocationsRef.value) as ComputedRef<AllocationData[]>,
    computed(() => categoriesRef.value) as ComputedRef<AllocationCategoryData[]>,
    computed(() => totalIncomeRef.value) as ComputedRef<number>,
    options,
  );
  return { ...result, allocationsRef, categoriesRef, totalIncomeRef };
}

describe('useAllocationGrouping', () => {
  describe('fixedAllocations', () => {
    it('returns only fixed allocations for a category', () => {
      const { fixedAllocations } = setup();

      const result = fixedAllocations(essentials);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Rent');
    });

    it('returns empty array when no fixed allocations exist', () => {
      const { fixedAllocations } = setup();

      expect(fixedAllocations(lifestyle)).toHaveLength(0);
    });

    it('excludes deleted allocations by default', () => {
      const allocs = buildAllocations();
      allocs[1].deleted = true; // Rent
      const { fixedAllocations } = setup({ allocations: allocs });

      expect(fixedAllocations(essentials)).toHaveLength(0);
    });

    it('includes deleted allocations when displayDeletedAllocations is true', () => {
      const allocs = buildAllocations();
      allocs[1].deleted = true;
      const { fixedAllocations } = setup({
        allocations: allocs,
        options: { displayDeletedAllocations: true },
      });

      expect(fixedAllocations(essentials)).toHaveLength(1);
    });

    it('respects reactive displayDeletedAllocations', () => {
      const allocs = buildAllocations();
      allocs[1].deleted = true;
      const displayDeleted = ref(false);
      const { fixedAllocations } = setup({
        allocations: allocs,
        options: { displayDeletedAllocations: displayDeleted },
      });

      expect(fixedAllocations(essentials)).toHaveLength(0);

      displayDeleted.value = true;
      expect(fixedAllocations(essentials)).toHaveLength(1);
    });
  });

  describe('adjustableAllocations', () => {
    it('returns only non-fixed allocations for a category', () => {
      const { adjustableAllocations } = setup();

      const result = adjustableAllocations(essentials);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Groceries');
    });

    it('excludes deleted allocations by default', () => {
      const allocs = buildAllocations();
      allocs[0].deleted = true; // Groceries
      const { adjustableAllocations } = setup({ allocations: allocs });

      expect(adjustableAllocations(essentials)).toHaveLength(0);
    });
  });

  describe('categoryTotals', () => {
    it('returns amount, spent, remaining for all non-deleted allocations in a category', () => {
      const { categoryTotals } = setup();

      const totals = categoryTotals(essentials);

      // Groceries (500) + Rent (1000)
      expect(totals.amount).toBe(150000);
      // Groceries (300) + Rent (1000)
      expect(totals.spent).toBe(130000);
      expect(totals.remaining).toBe(20000);
    });

    it('excludes deleted allocations from totals by default', () => {
      const allocs = buildAllocations();
      allocs[0].deleted = true; // Groceries
      const { categoryTotals } = setup({ allocations: allocs });

      const totals = categoryTotals(essentials);

      // Only Rent
      expect(totals.amount).toBe(100000);
    });

    it('includes deleted allocations in totals when includeDeletedInTotals is true', () => {
      const allocs = buildAllocations();
      allocs[0].deleted = true;
      const { categoryTotals } = setup({
        allocations: allocs,
        options: { includeDeletedInTotals: true },
      });

      const totals = categoryTotals(essentials);

      expect(totals.amount).toBe(150000);
    });
  });

  describe('fixedAllocations — collapsed mode', () => {
    it('returns a single synthetic row when fixed detail is hidden', () => {
      const { fixedAllocations, hideFixedDetail } = setup();
      hideFixedDetail();

      const result = fixedAllocations(essentials);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Fixed');
      expect(result[0].amount).toBe(100000); // Rent amount
      expect(result[0].spent).toBe(100000); // Rent spent
    });

    it('returns empty array when no fixed allocations even when collapsed', () => {
      const { fixedAllocations, hideFixedDetail } = setup();
      hideFixedDetail();

      expect(fixedAllocations(lifestyle)).toHaveLength(0);
    });

    it('returns individual rows when fixed detail is visible', () => {
      const { fixedAllocations } = setup();

      const result = fixedAllocations(essentials);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Rent');
      expect(result[0].id).toBe(2);
    });
  });

  describe('grandTotals', () => {
    it('computes totals across all non-deleted allocations', () => {
      const { grandTotals } = setup();

      expect(grandTotals.value.amount).toBe(170000);
      expect(grandTotals.value.spent).toBe(155000);
      expect(grandTotals.value.remaining).toBe(15000);
    });

    it('excludes deleted allocations', () => {
      const allocs = buildAllocations();
      allocs[0].deleted = true;
      const { grandTotals } = setup({ allocations: allocs });

      // Rent (100000) + Entertainment (20000)
      expect(grandTotals.value.amount).toBe(120000);
    });

    it('includes deleted when includeDeletedInTotals is true', () => {
      const allocs = buildAllocations();
      allocs[0].deleted = true;
      const { grandTotals } = setup({
        allocations: allocs,
        options: { includeDeletedInTotals: true },
      });

      expect(grandTotals.value.amount).toBe(170000);
    });

    it('reacts to allocation changes', () => {
      const { grandTotals, allocationsRef } = setup();

      expect(grandTotals.value.amount).toBe(170000);

      allocationsRef.value = [
        { id: 1, name: 'Groceries', amount: 60000, spent: 30000, allocation_category_id: 10 },
      ];

      expect(grandTotals.value.amount).toBe(60000);
    });
  });

  describe('fixedTotals', () => {
    it('computes totals for all fixed allocations', () => {
      const { fixedTotals } = setup();

      // Only Rent
      expect(fixedTotals.value.amount).toBe(100000);
      expect(fixedTotals.value.spent).toBe(100000);
      expect(fixedTotals.value.remaining).toBe(0);
    });

    it('excludes deleted fixed allocations', () => {
      const allocs = buildAllocations();
      allocs[1].deleted = true; // Rent
      const { fixedTotals } = setup({ allocations: allocs });

      expect(fixedTotals.value.amount).toBe(0);
    });
  });

  describe('unallocated', () => {
    it('computes totalIncome minus grandTotals.amount', () => {
      const { unallocated } = setup({ totalIncome: 250000 });

      // 250000 - 170000 = 80000
      expect(unallocated.value).toBe(80000);
    });

    it('reacts to totalIncome changes', () => {
      const { unallocated, totalIncomeRef } = setup({ totalIncome: 250000 });

      expect(unallocated.value).toBe(80000);

      totalIncomeRef.value = 300000;

      expect(unallocated.value).toBe(130000);
    });
  });

  describe('fixed visibility toggle', () => {
    it('starts with fixed detail visible', () => {
      const { isFixedDetailVisible } = setup();

      expect(isFixedDetailVisible.value).toBe(true);
    });

    it('hideFixedDetail sets isFixedDetailVisible to false', () => {
      const { isFixedDetailVisible, hideFixedDetail } = setup();

      hideFixedDetail();

      expect(isFixedDetailVisible.value).toBe(false);
    });

    it('showFixedDetail sets isFixedDetailVisible to true', () => {
      const { isFixedDetailVisible, hideFixedDetail, showFixedDetail } = setup();

      hideFixedDetail();
      expect(isFixedDetailVisible.value).toBe(false);

      showFixedDetail();
      expect(isFixedDetailVisible.value).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles empty allocations', () => {
      const { grandTotals, unallocated, categoryTotals } = setup({
        allocations: [],
        totalIncome: 100000,
      });

      expect(grandTotals.value.amount).toBe(0);
      expect(unallocated.value).toBe(100000);
      expect(categoryTotals(essentials).amount).toBe(0);
    });

    it('handles allocations with undefined amounts', () => {
      const { grandTotals } = setup({
        allocations: [{ id: 1, allocation_category_id: 10 }],
      });

      expect(grandTotals.value.amount).toBe(0);
      expect(grandTotals.value.spent).toBe(0);
      expect(grandTotals.value.remaining).toBe(0);
    });
  });
});
