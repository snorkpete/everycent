import { computed } from 'vue';
import { useBudgetStore } from './budgetStore';
import { useSettingsStore } from '../settings/settingsStore';
import { useWantsNeedsBudgetBreakdown } from './useWantsNeedsBudgetBreakdown';

/**
 * Shared budget summary computeds used by both BudgetSummaryStrip (desktop) and
 * BudgetSummaryStripMobile. Centralises income/allocation totals and
 * discretionary/NWS calculations so both layout variants share one source of truth.
 */
export function useBudgetSummary() {
  const budgetStore = useBudgetStore();
  const settingsStore = useSettingsStore();

  const familyType = computed(() => settingsStore.settings.family_type ?? 'couple');
  const wife = computed(() => settingsStore.settings.wife ?? 'Wife');
  const husband = computed(() => settingsStore.settings.husband ?? 'Husband');
  const singlePerson = computed(() => settingsStore.settings.single_person ?? 'User');

  const activeAllocations = computed(
    () => budgetStore.budget?.allocations?.filter((a) => !a.deleted) ?? [],
  );

  const totalIncome = computed(() => {
    const incomes = budgetStore.budget?.incomes ?? [];
    return incomes.filter((i) => !i.deleted).reduce((sum, i) => sum + (i.amount ?? 0), 0);
  });

  const totalAllocations = computed(() =>
    activeAllocations.value.reduce((sum, a) => sum + (a.amount ?? 0), 0),
  );

  const discretionaryTotal = computed(() => totalIncome.value - totalAllocations.value);

  const perPersonAmount = computed(() => {
    if (familyType.value === 'single') return discretionaryTotal.value;
    return Math.floor(discretionaryTotal.value / 2);
  });

  const discretionaryLabel = computed(() => {
    if (familyType.value === 'single') {
      return `${singlePerson.value}'s Discretionary`;
    }
    return `${wife.value} / ${husband.value}`;
  });

  const { needsPercentage, savingsPercentage, wantsPercentage } = useWantsNeedsBudgetBreakdown(
    activeAllocations,
    totalIncome,
  );

  return {
    budgetStore,
    totalIncome,
    totalAllocations,
    discretionaryTotal,
    perPersonAmount,
    discretionaryLabel,
    needsPercentage,
    savingsPercentage,
    wantsPercentage,
  };
}
