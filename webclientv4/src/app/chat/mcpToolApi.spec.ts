import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mcpToolApi } from './mcpToolApi';
import apiGateway from '../../api/api-gateway';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('mcpToolApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeOverspending', () => {
    it('gets /mcp/overspending_analysis with the period param', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: {} });

      await mcpToolApi.analyzeOverspending('2026-03');

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/overspending_analysis', {
        params: { period: '2026-03' },
      });
    });

    it('returns the response data', async () => {
      const payload = { categories: [{ name: 'Food', overspend: 5000 }] };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: payload });

      const result = await mcpToolApi.analyzeOverspending('2026-03');

      expect(result).toEqual(payload);
    });
  });

  describe('analyzeOverspendingByAllocation', () => {
    it('gets /mcp/overspending_analysis_by_allocation with the period param', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: {} });

      await mcpToolApi.analyzeOverspendingByAllocation('2026-03');

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/overspending_analysis_by_allocation', {
        params: { period: '2026-03' },
      });
    });

    it('includes the category param when provided', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: {} });

      await mcpToolApi.analyzeOverspendingByAllocation('2026-03', 'Food Purchases/Dining Out');

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/overspending_analysis_by_allocation', {
        params: { period: '2026-03', category: 'Food Purchases/Dining Out' },
      });
    });

    it('returns the response data', async () => {
      const payload = { allocations: [{ allocation: 'Groceries', overspend: 2500 }] };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: payload });

      const result = await mcpToolApi.analyzeOverspendingByAllocation('2026-03');

      expect(result).toEqual(payload);
    });
  });

  describe('listCategories', () => {
    it('gets /mcp/categories', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: {} });

      await mcpToolApi.listCategories();

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/categories');
    });

    it('returns the response data', async () => {
      const payload = { categories: [{ name: 'Food', budget_role: 'spending' }] };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: payload });

      const result = await mcpToolApi.listCategories();

      expect(result).toEqual(payload);
    });
  });

  describe('budgetAccuracy', () => {
    it('gets /mcp/budget_accuracy with the given params', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: {} });

      await mcpToolApi.budgetAccuracy({
        start_month: '2024-01',
        end_month: '2024-12',
        group_by: 'category',
        sort_by: 'overspend_amount',
        variable_only: true,
      });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/budget_accuracy', {
        params: {
          start_month: '2024-01',
          end_month: '2024-12',
          group_by: 'category',
          sort_by: 'overspend_amount',
          variable_only: true,
        },
      });
    });

    it('returns the response data', async () => {
      const payload = { results: [{ group_label: 'Groceries', median_abs_pct_off: 15.2 }] };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: payload });

      const result = await mcpToolApi.budgetAccuracy({
        start_month: '2024-01',
        end_month: '2024-12',
      });

      expect(result).toEqual(payload);
    });
  });
});
