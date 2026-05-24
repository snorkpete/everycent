import apiGateway from '../../api/api-gateway';
import type {
  LlmUsageBatch,
  LlmUsageSummary,
  UsagePageParams,
  UsagePageResponse,
} from './llmUsage.types';

export const llmUsageApi = {
  // Batch write — used by chat store when a turn completes
  submitBatch: (batch: LlmUsageBatch) =>
    apiGateway.post<{ created: number }>('/mcp/llm_usage', batch).then((r) => r.data),

  // Paginated read for the Usage Log page
  getAll: (params?: UsagePageParams) =>
    apiGateway.get<UsagePageResponse>('/llm_usage_records', { params }).then((r) => r.data),

  // Summary for dashboard totals
  getSummary: (params?: { start_date?: string; end_date?: string }) =>
    apiGateway.get<LlmUsageSummary>('/llm_usage_records/summary', { params }).then((r) => r.data),
};
