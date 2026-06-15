import apiGateway from '../../api/api-gateway';

// MCP NLQ tool endpoints. Responses are server-shaped JSON forwarded verbatim to
// the LLM (the executor stringifies them), so the return type is intentionally
// `unknown` — we don't model the shapes here. Auth headers, base URL, token
// refresh and 401 handling all come from the apiGateway interceptors for free.
export interface BudgetAccuracyParams {
  start_month: string;
  end_month: string;
  group_by?: string;
  sort_by?: string;
  variable_only?: boolean;
}

export interface OutOfBudgetAnalysisParams {
  start_month: string;
  end_month: string;
  group_by?: string;
}

export interface PlaceholderAllocationAnalysisParams {
  start_month: string;
  end_month: string;
}

export interface SinkFundStatusParams {
  account?: string;
  include_closed?: boolean;
}

export const mcpToolApi = {
  analyzeOverspending: (period: string): Promise<unknown> =>
    apiGateway
      .get<unknown>('/mcp/overspending_analysis', { params: { period } })
      .then((r) => r.data),

  analyzeOverspendingByAllocation: (period: string, category?: string): Promise<unknown> =>
    apiGateway
      .get<unknown>('/mcp/overspending_analysis_by_allocation', {
        params: category === undefined ? { period } : { period, category },
      })
      .then((r) => r.data),

  listCategories: (): Promise<unknown> =>
    apiGateway.get<unknown>('/mcp/categories').then((r) => r.data),

  budgetAccuracy: (params: BudgetAccuracyParams): Promise<unknown> =>
    apiGateway.get<unknown>('/mcp/budget_accuracy', { params }).then((r) => r.data),

  outOfBudgetAnalysis: (params: OutOfBudgetAnalysisParams): Promise<unknown> =>
    apiGateway.get<unknown>('/mcp/out_of_budget_analysis', { params }).then((r) => r.data),

  placeholderAllocationAnalysis: (params: PlaceholderAllocationAnalysisParams): Promise<unknown> =>
    apiGateway.get<unknown>('/mcp/placeholder_allocation_analysis', { params }).then((r) => r.data),

  sinkFundStatus: (params: SinkFundStatusParams): Promise<unknown> =>
    apiGateway.get<unknown>('/mcp/sink_fund_status', { params }).then((r) => r.data),
};
