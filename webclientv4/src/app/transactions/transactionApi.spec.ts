import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transactionApi } from './transactionApi';
import apiGateway from '../../api/api-gateway';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('transactionApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('gets /transactions with budgetId and bankAccountId params', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: [] });

      await transactionApi.getAll({ budgetId: 1, bankAccountId: 2 });

      expect(apiGateway.get).toHaveBeenCalledWith('/transactions', {
        params: { budget_id: 1, bank_account_id: 2 },
      });
    });

    it('returns the response data', async () => {
      const transactions = [{ id: 1, description: 'Test' }];
      vi.mocked(apiGateway.get).mockResolvedValue({ data: transactions });

      const result = await transactionApi.getAll({ budgetId: 1, bankAccountId: 2 });

      expect(result).toEqual(transactions);
    });
  });

  describe('save', () => {
    it('posts to /transactions with bank_account_id, budget_id, and transactions', async () => {
      const transactions = [{ id: 1, description: 'Test', withdrawal_amount: 100, deposit_amount: 0 }];
      vi.mocked(apiGateway.post).mockResolvedValue({ data: transactions });

      await transactionApi.save({
        bankAccountId: 2,
        budgetId: 3,
        transactions,
      });

      expect(apiGateway.post).toHaveBeenCalledWith('/transactions', {
        bank_account_id: 2,
        budget_id: 3,
        transactions,
      });
    });

    it('returns the response data', async () => {
      const saved = [{ id: 1, description: 'Test' }];
      vi.mocked(apiGateway.post).mockResolvedValue({ data: saved });

      const result = await transactionApi.save({
        bankAccountId: 2,
        budgetId: 3,
        transactions: saved,
      });

      expect(result).toEqual(saved);
    });
  });

  describe('getSinkFundAllocations', () => {
    it('gets /sink_fund_allocations with bank_account_id param', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: [] });

      await transactionApi.getSinkFundAllocations(5);

      expect(apiGateway.get).toHaveBeenCalledWith('/sink_fund_allocations', {
        params: { bank_account_id: 5 },
      });
    });

    it('returns the response data', async () => {
      const allocations = [{ id: 1, name: 'Savings Goal' }];
      vi.mocked(apiGateway.get).mockResolvedValue({ data: allocations });

      const result = await transactionApi.getSinkFundAllocations(5);

      expect(result).toEqual(allocations);
    });
  });
});
