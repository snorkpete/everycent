import { computed, type Ref } from 'vue';
import type { AllocationData } from '../transactions/transaction.types';

export function useWantsNeedsBudgetBreakdown(
  allocations: Ref<AllocationData[]>,
  totalIncome: Ref<number>,
) {
  const needsAmount = computed(() =>
    allocations.value
      .filter((a) => a.allocation_class === 'need')
      .reduce((sum, a) => sum + (a.amount ?? 0), 0),
  );

  const savingsAmount = computed(() =>
    allocations.value
      .filter((a) => a.allocation_class === 'savings')
      .reduce((sum, a) => sum + (a.amount ?? 0), 0),
  );

  // Can be negative when needs + savings exceed income (over-allocated budget)
  const wantsAmount = computed(() => totalIncome.value - needsAmount.value - savingsAmount.value);

  const needsPercentage = computed(() => {
    if (totalIncome.value === 0) return 0;
    return Math.round((needsAmount.value / totalIncome.value) * 100);
  });

  const savingsPercentage = computed(() => {
    if (totalIncome.value === 0) return 0;
    return Math.round((savingsAmount.value / totalIncome.value) * 100);
  });

  const wantsPercentage = computed(() => {
    if (totalIncome.value === 0) return 0;
    return 100 - needsPercentage.value - savingsPercentage.value;
  });

  return {
    needsAmount,
    savingsAmount,
    wantsAmount,
    needsPercentage,
    savingsPercentage,
    wantsPercentage,
  };
}
