import { describe, it, expect, vi, beforeEach } from 'vitest';
import { budgetApi } from './budgetApi';
import apiGateway from '../../api/api-gateway';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('budgetApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('gets /budgets', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: [] });

      await budgetApi.getAll();

      expect(apiGateway.get).toHaveBeenCalledWith('/budgets');
    });

    it('returns the response data', async () => {
      const budgets = [{ id: 1, name: 'Jan 2025', status: 'open' }];
      vi.mocked(apiGateway.get).mockResolvedValue({ data: budgets });

      const result = await budgetApi.getAll();

      expect(result).toEqual(budgets);
    });
  });

  describe('getAllocations', () => {
    it('gets /allocations with budget_id param', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: [] });

      await budgetApi.getAllocations(42);

      expect(apiGateway.get).toHaveBeenCalledWith('/allocations', {
        params: { budget_id: 42 },
      });
    });

    it('returns the response data', async () => {
      const allocations = [{ id: 1, name: 'Rent', amount: 150000 }];
      vi.mocked(apiGateway.get).mockResolvedValue({ data: allocations });

      const result = await budgetApi.getAllocations(42);

      expect(result).toEqual(allocations);
    });
  });

  describe('getCurrentBudgetId', () => {
    it('gets /budgets/current', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: { budget_id: 99 } });

      await budgetApi.getCurrentBudgetId();

      expect(apiGateway.get).toHaveBeenCalledWith('/budgets/current');
    });

    it('returns the budget_id from the response', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: { budget_id: 99 } });

      const result = await budgetApi.getCurrentBudgetId();

      expect(result).toBe(99);
    });
  });

  describe('create', () => {
    it('posts to /budgets with the budget data', async () => {
      const newBudget = { start_date: '2025-03-01' };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: { id: 10, name: 'Mar 2025' } });

      await budgetApi.create(newBudget);

      expect(apiGateway.post).toHaveBeenCalledWith('/budgets', newBudget);
    });

    it('returns the response data', async () => {
      const created = { id: 10, name: 'Mar 2025', status: 'open' };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: created });

      const result = await budgetApi.create({ start_date: '2025-03-01' });

      expect(result).toEqual(created);
    });
  });

  describe('copy', () => {
    it('puts to /budgets/:id/copy', async () => {
      vi.mocked(apiGateway.put).mockResolvedValue({ data: undefined });

      await budgetApi.copy(5);

      expect(apiGateway.put).toHaveBeenCalledWith('/budgets/5/copy');
    });
  });

  describe('close', () => {
    it('puts to /budgets/:id/close', async () => {
      vi.mocked(apiGateway.put).mockResolvedValue({ data: undefined });

      await budgetApi.close(5);

      expect(apiGateway.put).toHaveBeenCalledWith('/budgets/5/close');
    });
  });

  describe('reopenLast', () => {
    it('posts to /budgets/reopen_last_budget', async () => {
      vi.mocked(apiGateway.post).mockResolvedValue({ data: undefined });

      await budgetApi.reopenLast();

      expect(apiGateway.post).toHaveBeenCalledWith('/budgets/reopen_last_budget');
    });
  });

  describe('get', () => {
    it('gets /budgets/:id', async () => {
      const budgetDetail = { id: 213, name: 'Mar 2026', incomes: [], allocations: [] };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: budgetDetail });

      await budgetApi.get(213);

      expect(apiGateway.get).toHaveBeenCalledWith('/budgets/213');
    });

    it('returns the budget from the response', async () => {
      const budgetDetail = { id: 213, name: 'Mar 2026', incomes: [], allocations: [] };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: budgetDetail });

      const result = await budgetApi.get(213);

      expect(result).toEqual(budgetDetail);
    });
  });

  describe('save', () => {
    it('puts to /budgets/:id with incomes and allocations as top-level params', async () => {
      const incomes = [{ id: 1, name: 'Salary', amount: 500000, budget_id: 213 }];
      const allocations = [{ id: 1, name: 'Groceries', amount: 100000, budget_id: 213 }];
      const budget = { id: 213, name: 'Mar 2026', incomes, allocations };
      const savedBudget = { ...budget };
      vi.mocked(apiGateway.put).mockResolvedValue({ data: savedBudget });

      await budgetApi.save(budget);

      expect(apiGateway.put).toHaveBeenCalledWith('/budgets/213', {
        incomes,
        allocations,
      });
    });

    it('returns the saved budget from the response', async () => {
      const budget = { id: 213, name: 'Mar 2026', incomes: [], allocations: [] };
      vi.mocked(apiGateway.put).mockResolvedValue({ data: budget });

      const result = await budgetApi.save(budget);

      expect(result).toEqual(budget);
    });
  });

  describe('getTransactionsForAllocation', () => {
    it('gets /transactions/by_allocation with allocation_id param', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: [] });

      await budgetApi.getTransactionsForAllocation(42);

      expect(apiGateway.get).toHaveBeenCalledWith('/transactions/by_allocation', {
        params: { allocation_id: 42 },
      });
    });

    it('returns the response data', async () => {
      const transactions = [{ id: 1, description: 'Supermarket', net_amount: -5000 }];
      vi.mocked(apiGateway.get).mockResolvedValue({ data: transactions });

      const result = await budgetApi.getTransactionsForAllocation(42);

      expect(result).toEqual(transactions);
    });
  });
});
