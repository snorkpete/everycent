import { describe, it, expect, vi, beforeEach } from 'vitest';
import { llmUsageApi } from './llmUsageApi';
import apiGateway from '../../api/api-gateway';
import type { LlmUsageSummary, UsagePageResponse } from './llmUsage.types';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('llmUsageApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('gets /llm_usage_records without params when none provided', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: { records: [], total_count: 0 } });

      await llmUsageApi.getAll();

      expect(apiGateway.get).toHaveBeenCalledWith('/llm_usage_records', { params: undefined });
    });

    it('passes page and per_page params when provided', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: { records: [], total_count: 0 } });

      await llmUsageApi.getAll({ page: 2, per_page: 25 });

      expect(apiGateway.get).toHaveBeenCalledWith('/llm_usage_records', {
        params: { page: 2, per_page: 25 },
      });
    });

    it('passes date range params when provided', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: { records: [], total_count: 0 } });

      await llmUsageApi.getAll({ start_date: '2026-01-01', end_date: '2026-01-31' });

      expect(apiGateway.get).toHaveBeenCalledWith('/llm_usage_records', {
        params: { start_date: '2026-01-01', end_date: '2026-01-31' },
      });
    });

    it('returns the response data', async () => {
      const page: UsagePageResponse = {
        records: [
          {
            id: 1,
            llm_model_id: 1,
            usage_category: 'chat',
            conversation_id: 'conv-abc',
            conversation_turn_id: 'turn-1',
            input_tokens: 100,
            output_tokens: 50,
            cache_read_tokens: 0,
            cache_write_tokens: 0,
            thinking_tokens: 0,
            total_tokens: 150,
            request_duration_ms: 1200,
            incomplete: false,
            tool_call_count: 0,
            tool_calls_detail: [],
            extras: {},
          },
        ],
        total_count: 1,
      };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: page });

      const result = await llmUsageApi.getAll();

      expect(result).toEqual(page);
    });
  });

  describe('getSummary', () => {
    it('gets /llm_usage_records/summary without params when none provided', async () => {
      const summary: LlmUsageSummary = {
        total_records: 0,
        total_tokens: 0,
        total_cost: 0,
        by_provider: [],
        by_category: [],
      };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: summary });

      await llmUsageApi.getSummary();

      expect(apiGateway.get).toHaveBeenCalledWith('/llm_usage_records/summary', {
        params: undefined,
      });
    });

    it('passes date range params when provided', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({
        data: {
          total_records: 0,
          total_tokens: 0,
          total_cost: 0,
          by_provider: [],
          by_category: [],
        },
      });

      await llmUsageApi.getSummary({ start_date: '2026-01-01', end_date: '2026-01-31' });

      expect(apiGateway.get).toHaveBeenCalledWith('/llm_usage_records/summary', {
        params: { start_date: '2026-01-01', end_date: '2026-01-31' },
      });
    });

    it('returns the response data', async () => {
      const summary: LlmUsageSummary = {
        total_records: 10,
        total_tokens: 5000,
        total_cost: 125,
        by_provider: [{ provider: 'ollama', total_tokens: 5000, total_cost: 125 }],
        by_category: [{ usage_category: 'chat', total_tokens: 5000, total_cost: 125 }],
      };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: summary });

      const result = await llmUsageApi.getSummary();

      expect(result).toEqual(summary);
    });
  });
});
