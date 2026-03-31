import { computed, ref, toValue, type ComputedRef, type Ref } from 'vue';
import type { AllocationData } from '../transactions/transaction.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';

export interface AllocationTotals {
  amount: number;
  spent: number;
  remaining: number;
}

export interface AllocationGroupingOptions {
  displayDeletedAllocations?: boolean | Ref<boolean>;
  includeDeletedInTotals?: boolean | Ref<boolean>;
}

function sumTotals(allocations: AllocationData[]): AllocationTotals {
  const amount = allocations.reduce((sum, a) => sum + (a.amount ?? 0), 0);
  const spent = allocations.reduce((sum, a) => sum + (a.spent ?? 0), 0);
  return { amount, spent, remaining: amount - spent };
}

export function useAllocationGrouping(
  allocations: ComputedRef<AllocationData[]>,
  _categories: ComputedRef<AllocationCategoryData[]>,
  totalIncome: ComputedRef<number>,
  options?: AllocationGroupingOptions,
) {
  const displayDeleted = () => toValue(options?.displayDeletedAllocations ?? false);
  const includeDeleted = () => toValue(options?.includeDeletedInTotals ?? false);

  const isFixedDetailVisible = ref(true);

  function showFixedDetail() {
    isFixedDetailVisible.value = true;
  }

  function hideFixedDetail() {
    isFixedDetailVisible.value = false;
  }

  function allForCategory(category: AllocationCategoryData): AllocationData[] {
    return allocations.value.filter((a) => a.allocation_category_id === category.id);
  }

  function visibleForCategory(
    category: AllocationCategoryData,
    fixedFilter: boolean | null,
  ): AllocationData[] {
    let result = allForCategory(category);
    if (!displayDeleted()) {
      result = result.filter((a) => !a.deleted);
    }
    if (fixedFilter === true) {
      result = result.filter((a) => a.is_fixed_amount);
    } else if (fixedFilter === false) {
      result = result.filter((a) => !a.is_fixed_amount);
    }
    return result;
  }

  function fixedAllocations(category: AllocationCategoryData): AllocationData[] {
    const fixed = visibleForCategory(category, true);
    if (isFixedDetailVisible.value || fixed.length === 0) return fixed;

    // Collapsed mode: return a single synthetic row representing all fixed allocations
    const totals = totalsForCategory(category, true);
    return [{
      id: 0,
      name: 'Fixed',
      amount: totals.amount,
      spent: totals.spent,
      allocation_category_id: category.id,
      is_fixed_amount: true,
    }];
  }

  function adjustableAllocations(category: AllocationCategoryData): AllocationData[] {
    return visibleForCategory(category, false);
  }

  function totalsForCategory(
    category: AllocationCategoryData,
    fixedFilter: boolean | null,
  ): AllocationTotals {
    let result = allForCategory(category);
    if (!includeDeleted()) {
      result = result.filter((a) => !a.deleted);
    }
    if (fixedFilter === true) {
      result = result.filter((a) => a.is_fixed_amount);
    } else if (fixedFilter === false) {
      result = result.filter((a) => !a.is_fixed_amount);
    }
    return sumTotals(result);
  }

  function categoryTotals(category: AllocationCategoryData): AllocationTotals {
    return totalsForCategory(category, null);
  }

  function fixedCategoryTotals(category: AllocationCategoryData): AllocationTotals {
    return totalsForCategory(category, true);
  }

  const grandTotals = computed<AllocationTotals>(() => {
    let allocs = allocations.value;
    if (!includeDeleted()) {
      allocs = allocs.filter((a) => !a.deleted);
    }
    return sumTotals(allocs);
  });

  const fixedTotals = computed<AllocationTotals>(() => {
    let allocs = allocations.value;
    if (!includeDeleted()) {
      allocs = allocs.filter((a) => !a.deleted);
    }
    allocs = allocs.filter((a) => a.is_fixed_amount);
    return sumTotals(allocs);
  });

  const unallocated = computed(() => totalIncome.value - grandTotals.value.amount);

  return {
    fixedAllocations,
    adjustableAllocations,
    categoryTotals,
    grandTotals,
    fixedTotals,
    unallocated,
    isFixedDetailVisible,
    showFixedDetail,
    hideFixedDetail,
  };
}
