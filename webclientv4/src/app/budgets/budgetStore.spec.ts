import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBudgetStore } from './budgetStore';
import { budgetApi } from './budgetApi';
import { allocationCategoryApi } from '../allocation-categories/allocationCategoryApi';
import type { BudgetDetailData } from './budget.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';

vi.mock('./budgetApi', () => ({
  budgetApi: {
    get: vi.fn(),
    save: vi.fn(),
    getAll: vi.fn(),
    getAllocations: vi.fn(),
    getCurrentBudgetId: vi.fn(),
    create: vi.fn(),
    copy: vi.fn(),
    close: vi.fn(),
    reopenLast: vi.fn(),
  },
}));

vi.mock('../allocation-categories/allocationCategoryApi', () => ({
  allocationCategoryApi: {
    getAll: vi.fn(),
  },
}));

const sampleBudget: BudgetDetailData = {
  id: 213,
  name: 'Mar 25 - Apr 24, 2026',
  start_date: '2026-03-25',
  end_date: '2026-04-24',
  status: 'open',
  incomes: [
    { id: 1, name: 'Salary', amount: 500000, budget_id: 213, bank_account_id: 10, comment: '' },
  ],
  allocations: [
    {
      id: 1,
      name: 'Groceries',
      amount: 100000,
      budget_id: 213,
      allocation_category_id: 5,
      is_fixed_amount: true,
    },
  ],
};

const sampleCategories: AllocationCategoryData[] = [
  { id: 5, name: 'Food - Groceries' },
  { id: 6, name: 'Transport' },
];

describe('budgetStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has null budget', () => {
      const store = useBudgetStore();
      expect(store.budget).toBeNull();
    });

    it('has empty allocationCategories', () => {
      const store = useBudgetStore();
      expect(store.allocationCategories).toEqual([]);
    });

    it('has isEditMode false', () => {
      const store = useBudgetStore();
      expect(store.isEditMode).toBe(false);
    });

    it('has loading false', () => {
      const store = useBudgetStore();
      expect(store.loading).toBe(false);
    });

    it('has null error', () => {
      const store = useBudgetStore();
      expect(store.error).toBeNull();
    });
  });

  describe('fetch', () => {
    it('loads budget and allocation categories in parallel', async () => {
      vi.mocked(budgetApi.get).mockResolvedValue(sampleBudget);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(sampleCategories);
      const store = useBudgetStore();

      await store.fetch(213);

      expect(budgetApi.get).toHaveBeenCalledWith(213);
      expect(allocationCategoryApi.getAll).toHaveBeenCalled();
    });

    it('sets budget from API response', async () => {
      vi.mocked(budgetApi.get).mockResolvedValue(sampleBudget);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(sampleCategories);
      const store = useBudgetStore();

      await store.fetch(213);

      expect(store.budget).toEqual(sampleBudget);
    });

    it('sets allocationCategories from API response', async () => {
      vi.mocked(budgetApi.get).mockResolvedValue(sampleBudget);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(sampleCategories);
      const store = useBudgetStore();

      await store.fetch(213);

      expect(store.allocationCategories).toEqual(sampleCategories);
    });

    it('sets loading to true while fetching', async () => {
      let resolveGet: (value: BudgetDetailData) => void;
      vi.mocked(budgetApi.get).mockImplementation(
        () =>
          new Promise((r) => {
            resolveGet = r;
          }),
      );
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(sampleCategories);
      const store = useBudgetStore();

      const fetchPromise = store.fetch(213);
      expect(store.loading).toBe(true);

      resolveGet!(sampleBudget);
      await fetchPromise;
      expect(store.loading).toBe(false);
    });

    it('sets error and re-throws on failure', async () => {
      const apiError = new Error('Network error');
      vi.mocked(budgetApi.get).mockRejectedValue(apiError);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(sampleCategories);
      const store = useBudgetStore();

      await expect(store.fetch(213)).rejects.toThrow('Network error');
      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });

    it('clears error before fetching', async () => {
      vi.mocked(budgetApi.get).mockRejectedValueOnce(new Error('First error'));
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(sampleCategories);
      const store = useBudgetStore();

      await expect(store.fetch(213)).rejects.toThrow();
      expect(store.error).toBe('First error');

      vi.mocked(budgetApi.get).mockResolvedValue(sampleBudget);
      await store.fetch(213);
      expect(store.error).toBeNull();
    });
  });

  describe('save', () => {
    it('calls budgetApi.save with the current budget', async () => {
      vi.mocked(budgetApi.get).mockResolvedValue(sampleBudget);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(sampleCategories);
      vi.mocked(budgetApi.save).mockResolvedValue(sampleBudget);
      const store = useBudgetStore();
      await store.fetch(213);

      await store.save();

      expect(budgetApi.save).toHaveBeenCalledWith(sampleBudget);
    });

    it('updates budget with the response from save', async () => {
      const savedBudget = { ...sampleBudget, name: 'Updated Name' };
      vi.mocked(budgetApi.get).mockResolvedValue(sampleBudget);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(sampleCategories);
      vi.mocked(budgetApi.save).mockResolvedValue(savedBudget);
      const store = useBudgetStore();
      await store.fetch(213);

      await store.save();

      expect(store.budget).toEqual(savedBudget);
    });

    it('exits edit mode on success', async () => {
      vi.mocked(budgetApi.get).mockResolvedValue(sampleBudget);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(sampleCategories);
      vi.mocked(budgetApi.save).mockResolvedValue(sampleBudget);
      const store = useBudgetStore();
      await store.fetch(213);
      store.enterEditMode();

      await store.save();

      expect(store.isEditMode).toBe(false);
    });

    it('sets error and re-throws on failure', async () => {
      vi.mocked(budgetApi.get).mockResolvedValue(sampleBudget);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(sampleCategories);
      vi.mocked(budgetApi.save).mockRejectedValue(new Error('Save failed'));
      const store = useBudgetStore();
      await store.fetch(213);

      await expect(store.save()).rejects.toThrow('Save failed');
      expect(store.error).toBe('Save failed');
    });

    it('does nothing if budget is null', async () => {
      const store = useBudgetStore();

      await store.save();

      expect(budgetApi.save).not.toHaveBeenCalled();
    });

    it('sets loading while saving', async () => {
      let resolveSave: (value: BudgetDetailData) => void;
      vi.mocked(budgetApi.get).mockResolvedValue(sampleBudget);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(sampleCategories);
      vi.mocked(budgetApi.save).mockImplementation(
        () =>
          new Promise((r) => {
            resolveSave = r;
          }),
      );
      const store = useBudgetStore();
      await store.fetch(213);

      const savePromise = store.save();
      expect(store.loading).toBe(true);

      resolveSave!(sampleBudget);
      await savePromise;
      expect(store.loading).toBe(false);
    });
  });

  describe('enterEditMode', () => {
    it('sets isEditMode to true', () => {
      const store = useBudgetStore();

      store.enterEditMode();

      expect(store.isEditMode).toBe(true);
    });
  });

  describe('exitEditMode', () => {
    it('sets isEditMode to false', () => {
      const store = useBudgetStore();
      store.enterEditMode();

      store.exitEditMode();

      expect(store.isEditMode).toBe(false);
    });
  });

  describe('addIncome', () => {
    const newIncome = { id: 0, name: 'Bonus', amount: 100000, budget_id: 213, comment: '' };

    it('pushes the income into budget.incomes', async () => {
      vi.mocked(budgetApi.get).mockResolvedValue(sampleBudget);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(sampleCategories);
      const store = useBudgetStore();
      await store.fetch(213);

      store.addIncome(newIncome);

      expect(store.budget!.incomes).toHaveLength(2);
      expect(store.budget!.incomes[1]).toEqual(newIncome);
    });

    it('does nothing if budget is null', () => {
      const store = useBudgetStore();

      store.addIncome(newIncome);

      expect(store.budget).toBeNull();
    });
  });

  describe('addAllocation', () => {
    const newAllocation = {
      id: 0,
      name: 'Bus Pass',
      amount: 5000,
      spent: 0,
      budget_id: 213,
      allocation_category_id: 6,
    };

    it('pushes the allocation into budget.allocations', async () => {
      vi.mocked(budgetApi.get).mockResolvedValue(sampleBudget);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(sampleCategories);
      const store = useBudgetStore();
      await store.fetch(213);

      store.addAllocation(newAllocation);

      expect(store.budget!.allocations).toHaveLength(2);
      expect(store.budget!.allocations[1]).toEqual(newAllocation);
    });

    it('does nothing if budget is null', () => {
      const store = useBudgetStore();

      store.addAllocation(newAllocation);

      expect(store.budget).toBeNull();
    });
  });

  describe('cancelEdit', () => {
    it('exits edit mode', async () => {
      vi.mocked(budgetApi.get).mockResolvedValue(sampleBudget);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(sampleCategories);
      const store = useBudgetStore();
      await store.fetch(213);
      store.enterEditMode();

      await store.cancelEdit();

      expect(store.isEditMode).toBe(false);
    });

    it('re-fetches the budget from the server', async () => {
      vi.mocked(budgetApi.get).mockResolvedValue(sampleBudget);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(sampleCategories);
      const store = useBudgetStore();
      await store.fetch(213);
      vi.clearAllMocks();

      vi.mocked(budgetApi.get).mockResolvedValue(sampleBudget);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(sampleCategories);
      await store.cancelEdit();

      expect(budgetApi.get).toHaveBeenCalledWith(213);
    });

    it('does nothing if budget is null', async () => {
      const store = useBudgetStore();

      await store.cancelEdit();

      expect(budgetApi.get).not.toHaveBeenCalled();
    });
  });
});
