import { ref, computed } from 'vue';
import { budgetApi } from './budgetApi';
import type { BudgetData } from './budget.types';

/**
 * Provides a budget list ordered for selection UI: current budget first, then past (closed) budgets.
 *
 * **Backend sort assumption:** This composable assumes `budgetApi.getAll()` returns budgets
 * sorted by `start_date` descending (newest first). The "current" budget is identified as the
 * last element in the filtered open-budget list — which is only the earliest open budget if
 * the input is pre-sorted descending. If the backend sort order ever changes, the current
 * budget selection will silently break.
 *
 * See: `BudgetsController#index` applies `order(start_date: :desc)`.
 */
export function useCurrentAndPastBudgets() {
  const budgets = ref<BudgetData[]>([]);

  const currentAndPastBudgets = computed(() => {
    const openBudgets = budgets.value.filter((b) => b.status === 'open');
    const currentBudget = openBudgets.length > 0 ? openBudgets[openBudgets.length - 1] : null;
    const closedBudgets = budgets.value.filter((b) => b.status === 'closed');
    return currentBudget ? [currentBudget, ...closedBudgets] : closedBudgets;
  });

  async function fetchBudgets() {
    budgets.value = await budgetApi.getAll();
  }

  return {
    budgets,
    currentAndPastBudgets,
    fetchBudgets,
  };
}
