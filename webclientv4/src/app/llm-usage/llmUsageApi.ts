import apiGateway from '../../api/api-gateway';
import type { LlmUsageSummary, UsagePageParams, UsagePageResponse } from './llmUsage.types';

export const llmUsageApi = {
  // Paginated read for the Usage Log page
  getAll: (params?: UsagePageParams) =>
    apiGateway.get<UsagePageResponse>('/llm_usage_records', { params }).then((r) => r.data),

  // Summary for dashboard totals
  getSummary: (params?: { start_date?: string; end_date?: string }) =>
    apiGateway.get<LlmUsageSummary>('/llm_usage_records/summary', { params }).then((r) => r.data),
};
