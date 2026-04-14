import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFutureBudgetsStore } from './futureBudgetsStore';
import apiGateway from '../../../api/api-gateway';
import { buildApiGatewayMock } from '../../../test/buildApiGatewayMock';
import { buildFutureBudget } from '../../../test/factories';

vi.mock('../../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockApiGateway = buildApiGatewayMock();

describe('futureBudgetsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockApiGateway.reset();
    mockApiGateway.get('/budgets/future', []);
    mockApiGateway.get('/allocation_categories', []);
    mockApiGateway.post('/budgets/mass_update', { success: true });
  });

  describe('fetchAll', () => {
    it('fetches and stores budgets and categories', async () => {
      const budgets = [buildFutureBudget()];
      const categories = [{ id: 1, name: 'Fixed' }];
      mockApiGateway.get('/budgets/future', budgets);
      mockApiGateway.get('/allocation_categories', categories);

      const store = useFutureBudgetsStore();
      await store.fetchAll();

      expect(store.budgets).toEqual(budgets);
      expect(store.allocationCategories).toEqual(categories);
    });

    it('sets error message on failure', async () => {
      mockApiGateway.rejectGet('/budgets/future', new Error('Network error'));

      const store = useFutureBudgetsStore();
      await store.fetchAll();

      expect(store.error).toBe('Network error');
    });

    it('clears error on subsequent successful fetch', async () => {
      mockApiGateway.rejectGet('/budgets/future', new Error('fail'));

      const store = useFutureBudgetsStore();
      await store.fetchAll();

      mockApiGateway.get('/budgets/future', []);
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
      mockApiGateway.get('/budgets/future', [budget]);

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
      mockApiGateway.get('/budgets/future', [budget1, budget2]);

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
      mockApiGateway.get('/budgets/future', [budget]);

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
      mockApiGateway.get('/budgets/future', [budget]);

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

      const store = useFutureBudgetsStore();
      await store.massUpdate(payload);

      expect(apiGateway.post).toHaveBeenCalledWith('/budgets/mass_update', payload);
      expect(apiGateway.get).toHaveBeenCalledWith('/budgets/future');
    });

    it('updates store.budgets with refreshed data after mass update', async () => {
      const updatedBudget = buildFutureBudget({
        incomes: [
          { id: 1, name: 'Updated Salary', amount: 600000, budget_id: 1, bank_account_id: 1 },
        ],
      });
      mockApiGateway.get('/budgets/future', [updatedBudget]);

      const store = useFutureBudgetsStore();
      await store.massUpdate({ type: 'income', name: 'Updated Salary', amounts: [] });

      expect(store.budgets).toEqual([updatedBudget]);
    });

    it('sets error and re-throws on failure', async () => {
      mockApiGateway.rejectPost('/budgets/mass_update', new Error('Save failed'));

      const store = useFutureBudgetsStore();
      await expect(
        store.massUpdate({ type: 'income', name: 'Salary', amounts: [] }),
      ).rejects.toThrow('Save failed');

      expect(store.error).toBe('Save failed');
    });

  });
});
