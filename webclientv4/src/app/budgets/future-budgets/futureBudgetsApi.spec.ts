import { describe, it, expect, vi, beforeEach } from 'vitest';
import { futureBudgetsApi } from './futureBudgetsApi';
import apiGateway from '../../../api/api-gateway';
import type { MassUpdatePayload } from './futureBudgets.types';

vi.mock('../../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('futureBudgetsApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getFutureBudgets', () => {
    it('calls GET /budgets/future and returns data', async () => {
      const budgets = [{ id: 1, name: 'Jan 2025', incomes: [], allocations: [] }];
      vi.mocked(apiGateway.get).mockResolvedValue({ data: budgets });

      const result = await futureBudgetsApi.getFutureBudgets();

      expect(apiGateway.get).toHaveBeenCalledWith('/budgets/future');
      expect(result).toEqual(budgets);
    });
  });

  describe('getAllocationCategories', () => {
    it('calls GET /allocation_categories and returns data', async () => {
      const categories = [{ id: 1, name: 'Fixed' }];
      vi.mocked(apiGateway.get).mockResolvedValue({ data: categories });

      const result = await futureBudgetsApi.getAllocationCategories();

      expect(apiGateway.get).toHaveBeenCalledWith('/allocation_categories');
      expect(result).toEqual(categories);
    });
  });

  describe('massUpdate', () => {
    it('calls POST /budgets/mass_update with payload and returns data', async () => {
      const payload: MassUpdatePayload = {
        type: 'income',
        name: 'Salary',
        amounts: [{ id: 1, amount: 500000, budget_id: 10 }],
      };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: { success: true } });

      const result = await futureBudgetsApi.massUpdate(payload);

      expect(apiGateway.post).toHaveBeenCalledWith('/budgets/mass_update', payload);
      expect(result).toEqual({ success: true });
    });
  });
});
