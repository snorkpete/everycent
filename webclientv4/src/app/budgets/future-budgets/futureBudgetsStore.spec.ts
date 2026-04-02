import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFutureBudgetsStore } from './futureBudgetsStore';
import { futureBudgetsApi } from './futureBudgetsApi';
import { buildFutureBudget } from '../../../test/factories';

vi.mock('./futureBudgetsApi', () => ({
  futureBudgetsApi: {
    getFutureBudgets: vi.fn(),
    getAllocationCategories: vi.fn(),
    massUpdate: vi.fn(),
  },
}));

describe('futureBudgetsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(futureBudgetsApi.getFutureBudgets).mockResolvedValue([]);
    vi.mocked(futureBudgetsApi.getAllocationCategories).mockResolvedValue([]);
  });

  describe('fetchAll', () => {
    it('fetches and stores budgets and categories', async () => {
      const budgets = [buildFutureBudget()];
      const categories = [{ id: 1, name: 'Fixed' }];
      vi.mocked(futureBudgetsApi.getFutureBudgets).mockResolvedValue(budgets);
      vi.mocked(futureBudgetsApi.getAllocationCategories).mockResolvedValue(categories);

      const store = useFutureBudgetsStore();
      await store.fetchAll();

      expect(store.budgets).toEqual(budgets);
      expect(store.allocationCategories).toEqual(categories);
    });

    it('sets loading true during fetch and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(futureBudgetsApi.getFutureBudgets).mockImplementation(async () => {
        loadingDuringCall = useFutureBudgetsStore().loading;
        return [];
      });

      const store = useFutureBudgetsStore();
      await store.fetchAll();

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error message on failure', async () => {
      vi.mocked(futureBudgetsApi.getFutureBudgets).mockRejectedValue(new Error('Network error'));

      const store = useFutureBudgetsStore();
      await store.fetchAll();

      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });

    it('clears error on subsequent successful fetch', async () => {
      vi.mocked(futureBudgetsApi.getFutureBudgets).mockRejectedValueOnce(new Error('fail'));
      vi.mocked(futureBudgetsApi.getFutureBudgets).mockResolvedValueOnce([]);

      const store = useFutureBudgetsStore();
      await store.fetchAll();
      await store.fetchAll();

      expect(store.error).toBeNull();
    });
  });

  describe('incomeDisplayData', () => {
    it('returns empty object when no budgets', () => {
      const store = useFutureBudgetsStore();
      expect(store.incomeDisplayData).toEqual({});
    });

    it('indexes incomes by name then budget id', async () => {
      const budget = buildFutureBudget({
        id: 1,
        name: 'Jan 2025',
        incomes: [{ id: 10, name: 'Salary', amount: 500000, budget_id: 1, bank_account_id: 1 }],
      });
      vi.mocked(futureBudgetsApi.getFutureBudgets).mockResolvedValue([budget]);

      const store = useFutureBudgetsStore();
      await store.fetchAll();

      expect(store.incomeDisplayData).toEqual({
        Salary: {
          1: { id: 10, amount: 500000 },
        },
      });
    });

    it('merges same income name across multiple budgets using budget id', async () => {
      const budget1 = buildFutureBudget({
        id: 1,
        name: 'Jan 2025',
        incomes: [{ id: 10, name: 'Salary', amount: 500000, budget_id: 1, bank_account_id: 1 }],
      });
      const budget2 = buildFutureBudget({
        id: 2,
        name: 'Feb 2025',
        incomes: [{ id: 20, name: 'Salary', amount: 520000, budget_id: 2, bank_account_id: 1 }],
      });
      vi.mocked(futureBudgetsApi.getFutureBudgets).mockResolvedValue([budget1, budget2]);

      const store = useFutureBudgetsStore();
      await store.fetchAll();

      expect(store.incomeDisplayData).toEqual({
        Salary: {
          1: { id: 10, amount: 500000 },
          2: { id: 20, amount: 520000 },
        },
      });
    });
  });

  describe('incomeNames', () => {
    it('returns list of income names', async () => {
      const budget = buildFutureBudget({
        incomes: [
          { id: 1, name: 'Salary', amount: 500000, budget_id: 1, bank_account_id: 1 },
          { id: 2, name: 'Bonus', amount: 100000, budget_id: 1, bank_account_id: 1 },
        ],
      });
      vi.mocked(futureBudgetsApi.getFutureBudgets).mockResolvedValue([budget]);

      const store = useFutureBudgetsStore();
      await store.fetchAll();

      expect(store.incomeNames).toEqual(['Salary', 'Bonus']);
    });
  });

  describe('allocationDisplayData', () => {
    it('indexes allocations by category id, then name, then budget id', async () => {
      const budget = buildFutureBudget({
        id: 1,
        name: 'Jan 2025',
        allocations: [
          {
            id: 50,
            name: 'Rent',
            amount: 150000,
            budget_id: 1,
            allocation_category_id: 3,
          },
        ],
      });
      vi.mocked(futureBudgetsApi.getFutureBudgets).mockResolvedValue([budget]);

      const store = useFutureBudgetsStore();
      await store.fetchAll();

      expect(store.allocationDisplayData).toEqual({
        3: {
          Rent: {
            1: { id: 50, amount: 150000, is_fixed_amount: false },
          },
        },
      });
    });
  });

  describe('totalIncomeForBudget', () => {
    it('sums all income amounts for the given budget', () => {
      const budget = buildFutureBudget({
        incomes: [
          { id: 1, name: 'Salary', amount: 500000, budget_id: 1, bank_account_id: 1 },
          { id: 2, name: 'Bonus', amount: 100000, budget_id: 1, bank_account_id: 1 },
        ],
      });

      const store = useFutureBudgetsStore();

      expect(store.totalIncomeForBudget(budget)).toBe(600000);
    });

    it('returns 0 for a budget with no incomes', () => {
      const store = useFutureBudgetsStore();
      expect(store.totalIncomeForBudget(buildFutureBudget({ incomes: [] }))).toBe(0);
    });
  });

  describe('totalAllocationsForBudget', () => {
    it('sums all allocation amounts for the given budget', () => {
      const budget = buildFutureBudget({
        allocations: [
          { id: 1, name: 'Rent', amount: 150000, budget_id: 1, allocation_category_id: 1 },
          { id: 2, name: 'Food', amount: 50000, budget_id: 1, allocation_category_id: 1 },
        ],
      });

      const store = useFutureBudgetsStore();

      expect(store.totalAllocationsForBudget(budget)).toBe(200000);
    });

    it('returns 0 for a budget with no allocations', () => {
      const store = useFutureBudgetsStore();
      expect(store.totalAllocationsForBudget(buildFutureBudget({ allocations: [] }))).toBe(0);
    });
  });

  describe('discretionaryForBudget', () => {
    it('returns total income minus total allocations', () => {
      const budget = buildFutureBudget({
        incomes: [{ id: 1, name: 'Salary', amount: 500000, budget_id: 1, bank_account_id: 1 }],
        allocations: [
          { id: 1, name: 'Rent', amount: 150000, budget_id: 1, allocation_category_id: 1 },
        ],
      });

      const store = useFutureBudgetsStore();

      expect(store.discretionaryForBudget(budget)).toBe(350000);
    });
  });

  describe('massUpdate', () => {
    it('calls massUpdate API and refreshes data', async () => {
      const payload = {
        type: 'income' as const,
        name: 'Salary',
        amounts: [{ id: 1, amount: 500000, budget_id: 1 }],
      };
      vi.mocked(futureBudgetsApi.massUpdate).mockResolvedValue({ success: true });

      const store = useFutureBudgetsStore();
      await store.massUpdate(payload);

      expect(futureBudgetsApi.massUpdate).toHaveBeenCalledWith(payload);
      expect(futureBudgetsApi.getFutureBudgets).toHaveBeenCalled();
    });

    it('updates store.budgets with refreshed data after mass update', async () => {
      const updatedBudget = buildFutureBudget({
        incomes: [
          { id: 1, name: 'Updated Salary', amount: 600000, budget_id: 1, bank_account_id: 1 },
        ],
      });
      vi.mocked(futureBudgetsApi.massUpdate).mockResolvedValue({ success: true });
      vi.mocked(futureBudgetsApi.getFutureBudgets).mockResolvedValue([updatedBudget]);

      const store = useFutureBudgetsStore();
      await store.massUpdate({ type: 'income', name: 'Updated Salary', amounts: [] });

      expect(store.budgets).toEqual([updatedBudget]);
    });

    it('sets error and re-throws on failure', async () => {
      vi.mocked(futureBudgetsApi.massUpdate).mockRejectedValue(new Error('Save failed'));

      const store = useFutureBudgetsStore();
      await expect(
        store.massUpdate({ type: 'income', name: 'Salary', amounts: [] }),
      ).rejects.toThrow('Save failed');

      expect(store.error).toBe('Save failed');
    });

    it('resets loading to false on failure', async () => {
      vi.mocked(futureBudgetsApi.massUpdate).mockRejectedValue(new Error('fail'));

      const store = useFutureBudgetsStore();
      await store.massUpdate({ type: 'income', name: 'Salary', amounts: [] }).catch(() => {});

      expect(store.loading).toBe(false);
    });
  });
});
