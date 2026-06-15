import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeTool } from './toolExecutor';
import apiGateway from '../../api/api-gateway';
import { buildApiGatewayMock } from '../../test/buildApiGatewayMock';

// Mock at the system boundary (apiGateway), not the internal mcpToolApi module —
// this lets the real mcpToolApi run, so these specs verify the full path from
// tool name → HTTP URL/params. See docs/vue-coding-rules.md.
vi.mock('../../api/api-gateway', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(), patch: vi.fn() },
}));

// Minimal axios-error shape — isAxiosError() only checks `isAxiosError === true`.
function axiosError(response?: { data?: unknown; status?: number; statusText?: string }) {
  return Object.assign(new Error('Request failed'), { isAxiosError: true, response });
}

const mockApiGateway = buildApiGatewayMock();

describe('executeTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGateway.reset();
  });

  describe('analyze_overspending', () => {
    it('gets the overspending endpoint with the period param', async () => {
      mockApiGateway.get('/mcp/overspending_analysis', { categories: [] });

      await executeTool('analyze_overspending', { period: '2026-03' });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/overspending_analysis', {
        params: { period: '2026-03' },
      });
    });

    it('returns the response JSON stringified', async () => {
      const payload = { categories: [{ name: 'Food', overspend: 5000 }] };
      mockApiGateway.get('/mcp/overspending_analysis', payload);

      const result = await executeTool('analyze_overspending', { period: '2026-03' });

      expect(result).toBe(JSON.stringify(payload));
    });

    it('throws when period parameter is missing, before any request', async () => {
      await expect(executeTool('analyze_overspending', {})).rejects.toThrow(
        'analyze_overspending: missing required parameter "period"',
      );
      expect(apiGateway.get).not.toHaveBeenCalled();
    });

    it('throws when period parameter is not a string', async () => {
      await expect(executeTool('analyze_overspending', { period: 123 })).rejects.toThrow(
        'missing required parameter "period"',
      );
    });
  });

  describe('analyze_overspending_by_allocation', () => {
    it('gets the allocation endpoint with the period and no category when absent', async () => {
      mockApiGateway.get('/mcp/overspending_analysis_by_allocation', { allocations: [] });

      await executeTool('analyze_overspending_by_allocation', { period: '2026-03' });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/overspending_analysis_by_allocation', {
        params: { period: '2026-03' },
      });
    });

    it('forwards the category param when provided as a string', async () => {
      mockApiGateway.get('/mcp/overspending_analysis_by_allocation', { allocations: [] });

      await executeTool('analyze_overspending_by_allocation', {
        period: '2026-03',
        category: 'Food Purchases/Dining Out',
      });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/overspending_analysis_by_allocation', {
        params: { period: '2026-03', category: 'Food Purchases/Dining Out' },
      });
    });

    it('ignores a non-string category', async () => {
      mockApiGateway.get('/mcp/overspending_analysis_by_allocation', { allocations: [] });

      await executeTool('analyze_overspending_by_allocation', { period: '2026-03', category: 42 });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/overspending_analysis_by_allocation', {
        params: { period: '2026-03' },
      });
    });

    it('returns the response JSON stringified', async () => {
      const payload = { allocations: [{ allocation: 'Groceries', overspend: 2500 }] };
      mockApiGateway.get('/mcp/overspending_analysis_by_allocation', payload);

      const result = await executeTool('analyze_overspending_by_allocation', { period: '2026-03' });

      expect(result).toBe(JSON.stringify(payload));
    });

    it('throws when period parameter is missing', async () => {
      await expect(executeTool('analyze_overspending_by_allocation', {})).rejects.toThrow(
        'missing required parameter "period"',
      );
    });
  });

  describe('list_categories', () => {
    it('gets the categories endpoint', async () => {
      mockApiGateway.get('/mcp/categories', { categories: [] });

      await executeTool('list_categories', {});

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/categories');
    });

    it('returns the response JSON stringified', async () => {
      const payload = { categories: [{ name: 'Food', budget_role: 'spending' }] };
      mockApiGateway.get('/mcp/categories', payload);

      const result = await executeTool('list_categories', {});

      expect(result).toBe(JSON.stringify(payload));
    });
  });

  describe('budget_accuracy', () => {
    it('gets the endpoint with required params only when optionals absent', async () => {
      mockApiGateway.get('/mcp/budget_accuracy', { results: [] });

      await executeTool('budget_accuracy', { start_month: '2024-01', end_month: '2024-12' });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/budget_accuracy', {
        params: { start_month: '2024-01', end_month: '2024-12' },
      });
    });

    it('forwards group_by, sort_by and variable_only when provided', async () => {
      mockApiGateway.get('/mcp/budget_accuracy', { results: [] });

      await executeTool('budget_accuracy', {
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

    it('ignores optional params of the wrong type', async () => {
      mockApiGateway.get('/mcp/budget_accuracy', { results: [] });

      await executeTool('budget_accuracy', {
        start_month: '2024-01',
        end_month: '2024-12',
        group_by: 7,
        variable_only: 'yes',
      });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/budget_accuracy', {
        params: { start_month: '2024-01', end_month: '2024-12' },
      });
    });

    it('returns the response JSON stringified', async () => {
      const payload = { results: [{ group_label: 'Groceries', median_abs_pct_off: 15.2 }] };
      mockApiGateway.get('/mcp/budget_accuracy', payload);

      const result = await executeTool('budget_accuracy', {
        start_month: '2024-01',
        end_month: '2024-12',
      });

      expect(result).toBe(JSON.stringify(payload));
    });

    it('throws when start_month is missing', async () => {
      await expect(executeTool('budget_accuracy', { end_month: '2024-12' })).rejects.toThrow(
        'missing required parameter "start_month"',
      );
    });

    it('throws when end_month is missing', async () => {
      await expect(executeTool('budget_accuracy', { start_month: '2024-01' })).rejects.toThrow(
        'missing required parameter "end_month"',
      );
    });
  });

  describe('error surfacing', () => {
    it('surfaces the error field from a 4xx JSON body so the LLM can self-correct', async () => {
      mockApiGateway.rejectGet(
        '/mcp/budget_accuracy',
        axiosError({ data: { error: 'end_month must not be before start_month' }, status: 400 }),
      );

      await expect(
        executeTool('budget_accuracy', { start_month: '2024-06', end_month: '2024-01' }),
      ).rejects.toThrow('budget_accuracy failed: end_month must not be before start_month');
    });

    it('falls back to status/statusText when the JSON body has no string error field', async () => {
      mockApiGateway.rejectGet(
        '/mcp/overspending_analysis',
        axiosError({ data: { message: 'nope' }, status: 422, statusText: 'Unprocessable Entity' }),
      );

      await expect(executeTool('analyze_overspending', { period: '2026-03' })).rejects.toThrow(
        'analyze_overspending failed: 422 Unprocessable Entity',
      );
    });

    it('falls back to status/statusText for a non-JSON error body', async () => {
      mockApiGateway.rejectGet(
        '/mcp/overspending_analysis',
        axiosError({
          data: 'Internal Server Error',
          status: 500,
          statusText: 'Internal Server Error',
        }),
      );

      await expect(executeTool('analyze_overspending', { period: '2026-03' })).rejects.toThrow(
        'analyze_overspending failed: 500 Internal Server Error',
      );
    });

    it('falls back to the error message for an axios error with no response', async () => {
      mockApiGateway.rejectGet('/mcp/categories', axiosError());

      await expect(executeTool('list_categories', {})).rejects.toThrow(
        'list_categories failed: Request failed',
      );
    });

    it('wraps a non-axios Error with its message', async () => {
      mockApiGateway.rejectGet('/mcp/categories', new Error('boom'));

      await expect(executeTool('list_categories', {})).rejects.toThrow(
        'list_categories failed: boom',
      );
    });

    it('stringifies a non-Error rejection value', async () => {
      vi.mocked(apiGateway.get).mockImplementationOnce(() => Promise.reject('weird'));

      await expect(executeTool('list_categories', {})).rejects.toThrow(
        'list_categories failed: weird',
      );
    });
  });

  describe('out_of_budget_analysis', () => {
    it('gets the endpoint with required params only when group_by absent', async () => {
      mockApiGateway.get('/mcp/out_of_budget_analysis', { results: [] });

      await executeTool('out_of_budget_analysis', {
        start_month: '2024-01',
        end_month: '2024-12',
      });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/out_of_budget_analysis', {
        params: { start_month: '2024-01', end_month: '2024-12' },
      });
    });

    it('forwards group_by when provided as a string', async () => {
      mockApiGateway.get('/mcp/out_of_budget_analysis', { results: [] });

      await executeTool('out_of_budget_analysis', {
        start_month: '2024-01',
        end_month: '2024-12',
        group_by: 'allocation_name',
      });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/out_of_budget_analysis', {
        params: { start_month: '2024-01', end_month: '2024-12', group_by: 'allocation_name' },
      });
    });

    it('ignores a non-string group_by', async () => {
      mockApiGateway.get('/mcp/out_of_budget_analysis', { results: [] });

      await executeTool('out_of_budget_analysis', {
        start_month: '2024-01',
        end_month: '2024-12',
        group_by: 42,
      });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/out_of_budget_analysis', {
        params: { start_month: '2024-01', end_month: '2024-12' },
      });
    });

    it('returns the response JSON stringified', async () => {
      const payload = { results: [{ month: '2024-01', total_cents: 5000 }] };
      mockApiGateway.get('/mcp/out_of_budget_analysis', payload);

      const result = await executeTool('out_of_budget_analysis', {
        start_month: '2024-01',
        end_month: '2024-12',
      });

      expect(result).toBe(JSON.stringify(payload));
    });

    it('throws when start_month is missing', async () => {
      await expect(executeTool('out_of_budget_analysis', { end_month: '2024-12' })).rejects.toThrow(
        'missing required parameter "start_month"',
      );
    });

    it('throws when end_month is missing', async () => {
      await expect(
        executeTool('out_of_budget_analysis', { start_month: '2024-01' }),
      ).rejects.toThrow('missing required parameter "end_month"');
    });
  });

  describe('placeholder_allocation_analysis', () => {
    it('gets the endpoint with required params', async () => {
      mockApiGateway.get('/mcp/placeholder_allocation_analysis', { results: {} });

      await executeTool('placeholder_allocation_analysis', {
        start_month: '2024-01',
        end_month: '2024-12',
      });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/placeholder_allocation_analysis', {
        params: { start_month: '2024-01', end_month: '2024-12' },
      });
    });

    it('returns the response JSON stringified', async () => {
      const payload = { results: { monthly_summary: [], top_placeholders: [] } };
      mockApiGateway.get('/mcp/placeholder_allocation_analysis', payload);

      const result = await executeTool('placeholder_allocation_analysis', {
        start_month: '2024-01',
        end_month: '2024-12',
      });

      expect(result).toBe(JSON.stringify(payload));
    });

    it('throws when start_month is missing', async () => {
      await expect(
        executeTool('placeholder_allocation_analysis', { end_month: '2024-12' }),
      ).rejects.toThrow('missing required parameter "start_month"');
    });

    it('throws when end_month is missing', async () => {
      await expect(
        executeTool('placeholder_allocation_analysis', { start_month: '2024-01' }),
      ).rejects.toThrow('missing required parameter "end_month"');
    });
  });

  describe('sink_fund_status', () => {
    it('gets the endpoint with no params when none provided', async () => {
      mockApiGateway.get('/mcp/sink_fund_status', { results: [] });

      await executeTool('sink_fund_status', {});

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/sink_fund_status', { params: {} });
    });

    it('forwards account when provided as a string', async () => {
      mockApiGateway.get('/mcp/sink_fund_status', { results: [] });

      await executeTool('sink_fund_status', { account: 'Sink Fund Account' });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/sink_fund_status', {
        params: { account: 'Sink Fund Account' },
      });
    });

    it('forwards include_closed when provided as a boolean', async () => {
      mockApiGateway.get('/mcp/sink_fund_status', { results: [] });

      await executeTool('sink_fund_status', { include_closed: true });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/sink_fund_status', {
        params: { include_closed: true },
      });
    });

    it('ignores a non-string account', async () => {
      mockApiGateway.get('/mcp/sink_fund_status', { results: [] });

      await executeTool('sink_fund_status', { account: 42 });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/sink_fund_status', { params: {} });
    });

    it('ignores a non-boolean include_closed', async () => {
      mockApiGateway.get('/mcp/sink_fund_status', { results: [] });

      await executeTool('sink_fund_status', { include_closed: 'yes' });

      expect(apiGateway.get).toHaveBeenCalledWith('/mcp/sink_fund_status', { params: {} });
    });

    it('returns the response JSON stringified', async () => {
      const payload = { results: [{ name: 'Car Fund', remaining_cents: 5000 }] };
      mockApiGateway.get('/mcp/sink_fund_status', payload);

      const result = await executeTool('sink_fund_status', {});

      expect(result).toBe(JSON.stringify(payload));
    });
  });

  describe('unknown tool', () => {
    it('throws a descriptive error for an unrecognised tool name', async () => {
      await expect(executeTool('do_something_weird', {})).rejects.toThrow(
        'Unknown tool: do_something_weird',
      );
    });
  });
});
