import { ref } from 'vue';
import { defineStore } from 'pinia';
import { budgetApi } from './budgetApi';
import { allocationCategoryApi } from '../allocation-categories/allocationCategoryApi';
import type { BudgetDetailData, IncomeData } from './budget.types';
import type { AllocationData } from '../transactions/transaction.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';

export const useBudgetStore = defineStore('budget', () => {
  const budget = ref<BudgetDetailData | null>(null);
  const allocationCategories = ref<AllocationCategoryData[]>([]);
  const isEditMode = ref(false);
  const error = ref<string | null>(null);

  async function fetch(budgetId: number) {
    error.value = null;
    try {
      const [loadedBudget, loadedCategories] = await Promise.all([
        budgetApi.get(budgetId),
        allocationCategoryApi.getAll(),
      ]);
      budget.value = loadedBudget;
      allocationCategories.value = loadedCategories;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to load budget';
      throw e;
    }
  }

  async function save() {
    if (!budget.value) return;

    error.value = null;
    try {
      const savedBudget = await budgetApi.save(budget.value);
      budget.value = savedBudget;
      isEditMode.value = false;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to save budget';
      throw e;
    }
  }

  function enterEditMode() {
    isEditMode.value = true;
  }

  function exitEditMode() {
    isEditMode.value = false;
  }

  function addIncome(income: IncomeData) {
    if (!budget.value) return;
    budget.value.incomes.push(income);
  }

  function addAllocation(allocation: AllocationData) {
    if (!budget.value) return;
    budget.value.allocations.push(allocation);
  }

  async function cancelEdit() {
    if (!budget.value?.id) return;
    isEditMode.value = false;
    await fetch(budget.value.id);
  }

  return {
    budget,
    allocationCategories,
    isEditMode,
    error,
    fetch,
    save,
    enterEditMode,
    exitEditMode,
    addIncome,
    addAllocation,
    cancelEdit,
  };
});
