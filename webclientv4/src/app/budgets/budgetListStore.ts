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
      return lastOpen != null && lastOpen.id === budget.id;
    };
  });

  function errorMessage(e: unknown, fallback: string): string {
    return e instanceof Error ? e.message : fallback;
  }

  async function loadBudgets() {
    budgets.value = await budgetApi.getAll();
  }

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      await loadBudgets();
    } catch (e: unknown) {
      error.value = errorMessage(e, 'Failed to load budgets');
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function copyBudget(budgetId: number) {
    loading.value = true;
    error.value = null;
    try {
      await budgetApi.copy(budgetId);
      await loadBudgets();
    } catch (e: unknown) {
      error.value = errorMessage(e, 'Failed to copy budget');
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function closeBudget(budgetId: number) {
    loading.value = true;
    error.value = null;
    try {
      await budgetApi.close(budgetId);
      await loadBudgets();
    } catch (e: unknown) {
      error.value = errorMessage(e, 'Failed to close budget');
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function reopenLastBudget() {
    loading.value = true;
    error.value = null;
    try {
      await budgetApi.reopenLast();
      await loadBudgets();
    } catch (e: unknown) {
      error.value = errorMessage(e, 'Failed to reopen budget');
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function addBudget(startDate: string) {
    loading.value = true;
    error.value = null;
    try {
      await budgetApi.create({ start_date: startDate });
      await loadBudgets();
    } catch (e: unknown) {
      error.value = errorMessage(e, 'Failed to create budget');
      throw e;
    } finally {
      loading.value = false;
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
