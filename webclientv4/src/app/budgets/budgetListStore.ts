import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { budgetApi } from './budgetApi';
import type { BudgetData } from './budget.types';

export const useBudgetListStore = defineStore('budgetList', () => {
  const budgets = ref<BudgetData[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const canCopy = computed(() => {
    return (budget: BudgetData) => {
      const first = budgets.value[0];
      return first != null && first.id === budget.id;
    };
  });

  const canClose = computed(() => {
    return (budget: BudgetData) => {
      const openBudgets = budgets.value.filter((b) => b.status === 'open');
      if (openBudgets.length === 0) return false;
      const lastOpen = openBudgets[openBudgets.length - 1];
      return lastOpen.id === budget.id;
    };
  });

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      budgets.value = await budgetApi.getAll();
    } catch (e) {
      error.value = 'Failed to load budgets';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function copyBudget(budgetId: number) {
    error.value = null;
    try {
      await budgetApi.copy(budgetId);
      await fetchAll();
    } catch (e) {
      error.value = 'Failed to copy budget';
      throw e;
    }
  }

  async function closeBudget(budgetId: number) {
    error.value = null;
    try {
      await budgetApi.close(budgetId);
      await fetchAll();
    } catch (e) {
      error.value = 'Failed to close budget';
      throw e;
    }
  }

  async function reopenLastBudget() {
    error.value = null;
    try {
      await budgetApi.reopenLast();
      await fetchAll();
    } catch (e) {
      error.value = 'Failed to reopen budget';
      throw e;
    }
  }

  async function addBudget(startDate: string) {
    error.value = null;
    try {
      await budgetApi.create({ start_date: startDate });
      await fetchAll();
    } catch (e) {
      error.value = 'Failed to create budget';
      throw e;
    }
  }

  return {
    budgets,
    loading,
    error,
    canCopy,
    canClose,
    fetchAll,
    copyBudget,
    closeBudget,
    reopenLastBudget,
    addBudget,
  };
});
