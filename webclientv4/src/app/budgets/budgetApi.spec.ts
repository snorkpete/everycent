import { describe, it, expect, vi, beforeEach } from 'vitest';
import { budgetApi } from './budgetApi';
import apiGateway from '../../api/api-gateway';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
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
});
