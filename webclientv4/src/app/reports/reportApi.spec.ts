import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reportApi } from './reportApi';
import apiGateway from '../../api/api-gateway';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('reportApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getNetWorth', () => {
    it('gets /reports/net_worth', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({
        data: { success: true, data: [], fields: [] },
      });

      await reportApi.getNetWorth();

      expect(apiGateway.get).toHaveBeenCalledWith('/reports/net_worth');
    });

    it('returns the response data', async () => {
      const payload = {
        success: true,
        data: [{ period: '2024-01', net_change: 5000, net_worth: 150000 }],
        fields: [
          { name: 'period', label: 'Period', numeric: false },
          { name: 'net_change', label: 'Net Change', numeric: true },
          { name: 'net_worth', label: 'Net Worth', numeric: true },
        ],
      };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: payload });

      const result = await reportApi.getNetWorth();

      expect(result).toEqual(payload);
    });
  });

  describe('getCategorySpending', () => {
    it('gets /reports/category_spending', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({
        data: { success: true, data: [], fields: [] },
      });

      await reportApi.getCategorySpending();

      expect(apiGateway.get).toHaveBeenCalledWith('/reports/category_spending');
    });

    it('returns the response data', async () => {
      const payload = { success: true, data: [{ period: '2024-01' }], fields: [] };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: payload });

      const result = await reportApi.getCategorySpending();

      expect(result).toEqual(payload);
    });
  });

  describe('getNeedsVsWants', () => {
    it('gets /reports/needs_vs_wants', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({
        data: { success: true, data: [], fields: [] },
      });

      await reportApi.getNeedsVsWants();

      expect(apiGateway.get).toHaveBeenCalledWith('/reports/needs_vs_wants');
    });

    it('returns the response data', async () => {
      const payload = { success: true, data: [{ period: '2024-01' }], fields: [] };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: payload });

      const result = await reportApi.getNeedsVsWants();

      expect(result).toEqual(payload);
    });
  });
});
