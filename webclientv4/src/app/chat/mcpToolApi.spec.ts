import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mcpToolApi } from './mcpToolApi';
import apiGateway from '../../api/api-gateway';
import type { CreateBugReportParams } from './mcpToolApi';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
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

  describe('outOfBudgetAnalysis', () => {
    it('gets /mcp/out_of_budget_analysis with required params', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: {} });

      await mcpToolApi.outOfBudgetAnalysis({ start_month: '2024-01', end_month: '2024-12' });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/out_of_budget_analysis', {
        params: { start_month: '2024-01', end_month: '2024-12' },
      });
    });

    it('forwards group_by when provided', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: {} });

      await mcpToolApi.outOfBudgetAnalysis({
        start_month: '2024-01',
        end_month: '2024-12',
        group_by: 'allocation_name',
      });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/out_of_budget_analysis', {
        params: { start_month: '2024-01', end_month: '2024-12', group_by: 'allocation_name' },
      });
    });

    it('returns the response data', async () => {
      const payload = { results: [{ month: '2024-01', total_cents: 50000 }] };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: payload });

      const result = await mcpToolApi.outOfBudgetAnalysis({
        start_month: '2024-01',
        end_month: '2024-12',
      });

      expect(result).toEqual(payload);
    });
  });

  describe('placeholderAllocationAnalysis', () => {
    it('gets /mcp/placeholder_allocation_analysis with required params', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: {} });

      await mcpToolApi.placeholderAllocationAnalysis({
        start_month: '2024-01',
        end_month: '2024-12',
      });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/placeholder_allocation_analysis', {
        params: { start_month: '2024-01', end_month: '2024-12' },
      });
    });

    it('returns the response data', async () => {
      const payload = {
        results: { monthly_summary: [], top_placeholders: [] },
      };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: payload });

      const result = await mcpToolApi.placeholderAllocationAnalysis({
        start_month: '2024-01',
        end_month: '2024-12',
      });

      expect(result).toEqual(payload);
    });
  });

  describe('sinkFundStatus', () => {
    it('gets /mcp/sink_fund_status with no params when none provided', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: {} });

      await mcpToolApi.sinkFundStatus({});

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/sink_fund_status', { params: {} });
    });

    it('forwards account and include_closed when provided', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: {} });

      await mcpToolApi.sinkFundStatus({ account: 'Sink Fund Account', include_closed: true });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/sink_fund_status', {
        params: { account: 'Sink Fund Account', include_closed: true },
      });
    });

    it('returns the response data', async () => {
      const payload = { results: [{ name: 'Car Fund', remaining_cents: 5000 }] };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: payload });

      const result = await mcpToolApi.sinkFundStatus({});

      expect(result).toEqual(payload);
    });
  });

  describe('searchBugReports', () => {
    it('gets /mcp/bug_reports', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: {} });

      await mcpToolApi.searchBugReports();

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/bug_reports');
    });

    it('returns the response data', async () => {
      const payload = { bug_reports: [{ id: 1, title: 'Something broke' }] };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: payload });

      const result = await mcpToolApi.searchBugReports();

      expect(result).toEqual(payload);
    });
  });

  describe('createBugReport', () => {
    it('posts to /mcp/bug_reports with nested bug_report body', async () => {
      vi.mocked(apiGateway.post).mockResolvedValue({ data: {} });
      const params: CreateBugReportParams = {
        title: 'Budget total looks wrong on the Budgets screen',
        description: 'The total shown is higher than expected after closing the month.',
      };

      await mcpToolApi.createBugReport(params);

      expect(apiGateway.post).toHaveBeenCalledWith('/mcp/bug_reports', {
        bug_report: params,
      });
    });

    it('returns the response data', async () => {
      const payload = { id: 42, title: 'Budget total looks wrong on the Budgets screen' };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: payload });

      const result = await mcpToolApi.createBugReport({
        title: 'Budget total looks wrong on the Budgets screen',
        description: 'The total shown is higher than expected.',
      });

      expect(result).toEqual(payload);
    });
  });
});
