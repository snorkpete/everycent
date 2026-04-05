import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiGateway from '../../api/api-gateway';
import { homeApi } from './homeApi';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('homeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLastTransactionDate', () => {
    it('calls GET /transactions/last_update', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({
        data: { id: 42, transaction_date: '2026-04-03' },
      });

      await homeApi.getLastTransactionDate();

      expect(apiGateway.get).toHaveBeenCalledWith('/transactions/last_update');
    });

    it('returns the transaction_date when a real transaction is returned', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({
        data: { id: 42, transaction_date: '2026-04-03' },
      });

      const result = await homeApi.getLastTransactionDate();

      expect(result).toBe('2026-04-03');
    });

    it('returns null when the backend returns a synthetic transaction (no id)', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({
        data: { transaction_date: '2026-04-05' },
      });

      const result = await homeApi.getLastTransactionDate();

      expect(result).toBeNull();
    });

    it('returns null when transaction_date is missing on a real transaction', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({
        data: { id: 42 },
      });

      const result = await homeApi.getLastTransactionDate();

      expect(result).toBeNull();
    });
  });
});
