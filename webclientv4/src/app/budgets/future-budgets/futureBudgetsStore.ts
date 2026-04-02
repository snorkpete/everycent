import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { futureBudgetsApi } from './futureBudgetsApi';
import type { AllocationCategoryData } from '../../allocation-categories/allocationCategory.types';
import type { FutureBudgetData, MassUpdatePayload } from './futureBudgets.types';

export const useFutureBudgetsStore = defineStore('futureBudgets', () => {
  const budgets = ref<FutureBudgetData[]>([]);
  const allocationCategories = ref<AllocationCategoryData[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // incomeDisplayData: { [incomeName]: { [budgetId]: { id, amount } } }
  const incomeDisplayData = computed(() => {
    const results: Record<string, Record<number, { id: number; amount: number }>> = {};
    for (const budget of budgets.value) {
      for (const income of budget.incomes) {
        const row = (results[income.name] ??= {});
        row[budget.id] = { id: income.id, amount: income.amount };
      }
    }
    return results;
  });

  const incomeNames = computed(() => Object.keys(incomeDisplayData.value));

  // allocationDisplayData: { [categoryId]: { [allocationName]: { [budgetId]: { id, amount, is_fixed_amount } } } }
  const allocationDisplayData = computed(() => {
    const results: Record<
      number,
      Record<string, Record<number, { id: number; amount: number; is_fixed_amount: boolean }>>
    > = {};
    for (const budget of budgets.value) {
      for (const allocation of budget.allocations) {
        const catId = allocation.allocation_category_id;
        const cat = (results[catId] ??= {});
        const row = (cat[allocation.name] ??= {});
        row[budget.id] = {
          id: allocation.id,
          amount: allocation.amount,
          is_fixed_amount: allocation.is_fixed_amount ?? false,
        };
      }
    }
    return results;
  });

  function totalIncomeForBudget(budget: FutureBudgetData): number {
    return budget.incomes.reduce((sum, i) => sum + i.amount, 0);
  }

  function totalAllocationsForBudget(budget: FutureBudgetData): number {
    return budget.allocations.reduce((sum, a) => sum + a.amount, 0);
  }

  function discretionaryForBudget(budget: FutureBudgetData): number {
    return totalIncomeForBudget(budget) - totalAllocationsForBudget(budget);
  }

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const [fetchedBudgets, fetchedCategories] = await Promise.all([
        futureBudgetsApi.getFutureBudgets(),
        futureBudgetsApi.getAllocationCategories(),
      ]);
      budgets.value = fetchedBudgets;
      allocationCategories.value = fetchedCategories;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load future budgets';
    } finally {
      loading.value = false;
    }
  }

  async function massUpdate(payload: MassUpdatePayload) {
    loading.value = true;
    error.value = null;
    try {
      await futureBudgetsApi.massUpdate(payload);
      await fetchAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to save changes';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    budgets,
    allocationCategories,
    loading,
    error,
    incomeDisplayData,
    incomeNames,
    allocationDisplayData,
    totalIncomeForBudget,
    totalAllocationsForBudget,
    discretionaryForBudget,
    fetchAll,
    massUpdate,
  };
});
