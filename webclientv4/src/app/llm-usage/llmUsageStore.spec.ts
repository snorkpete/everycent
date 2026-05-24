import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLlmUsageStore } from './llmUsageStore';
import apiGateway from '../../api/api-gateway';
import { buildApiGatewayMock } from '../../test/buildApiGatewayMock';
import { buildLlmUsageRecord, buildLlmUsageSummary } from '../../test/factories';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockApiGateway = buildApiGatewayMock();

const emptySummary = buildLlmUsageSummary({
  total_records: 0,
  total_tokens: 0,
  total_cost: 0,
  by_provider: [],
  by_category: [],
});

describe('llmUsageStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockApiGateway.reset();
    mockApiGateway.get('/llm_usage_records', { records: [], total_count: 0 });
    mockApiGateway.get('/llm_usage_records/summary', emptySummary);
  });

  describe('initial state', () => {
    it('starts with empty records', () => {
      const store = useLlmUsageStore();

      expect(store.records).toEqual([]);
    });

    it('starts with totalCount of 0', () => {
      const store = useLlmUsageStore();

      expect(store.totalCount).toBe(0);
    });

    it('starts with null summary', () => {
      const store = useLlmUsageStore();

      expect(store.summary).toBeNull();
    });

    it('starts with loading false', () => {
      const store = useLlmUsageStore();

      expect(store.loading).toBe(false);
    });

    it('starts with null error', () => {
      const store = useLlmUsageStore();

      expect(store.error).toBeNull();
    });

    it('starts on page 1', () => {
      const store = useLlmUsageStore();

      expect(store.page).toBe(1);
    });

    it('starts with perPage of 50', () => {
      const store = useLlmUsageStore();

      expect(store.perPage).toBe(50);
    });

    it('starts with null startDate and endDate', () => {
      const store = useLlmUsageStore();

      expect(store.startDate).toBeNull();
      expect(store.endDate).toBeNull();
    });
  });

  describe('fetch', () => {
    it('fetches records and stores them', async () => {
      const records = [buildLlmUsageRecord({ id: 1 }), buildLlmUsageRecord({ id: 2 })];
      mockApiGateway.get('/llm_usage_records', { records, total_count: 2 });

      const store = useLlmUsageStore();
      await store.fetch();

      expect(store.records).toEqual(records);
      expect(store.totalCount).toBe(2);
    });

    it('fetches summary and stores it', async () => {
      const summary = buildLlmUsageSummary({ total_records: 5, total_tokens: 2500 });
      mockApiGateway.get('/llm_usage_records/summary', summary);

      const store = useLlmUsageStore();
      await store.fetch();

      expect(store.summary).toEqual(summary);
    });

    it('calls both APIs in parallel', async () => {
      const store = useLlmUsageStore();
      await store.fetch();

      expect(apiGateway.get).toHaveBeenCalledWith('/llm_usage_records', expect.anything());
      expect(apiGateway.get).toHaveBeenCalledWith('/llm_usage_records/summary', expect.anything());
    });

    it('passes page and per_page params to getAll', async () => {
      const store = useLlmUsageStore();
      store.page = 2;
      store.perPage = 25;
      await store.fetch();

      expect(apiGateway.get).toHaveBeenCalledWith('/llm_usage_records', {
        params: { page: 2, per_page: 25, start_date: undefined, end_date: undefined },
      });
    });

    it('passes date range params when set', async () => {
      const store = useLlmUsageStore();
      store.startDate = '2026-01-01';
      store.endDate = '2026-01-31';
      await store.fetch();

      expect(apiGateway.get).toHaveBeenCalledWith('/llm_usage_records', {
        params: { page: 1, per_page: 50, start_date: '2026-01-01', end_date: '2026-01-31' },
      });
      expect(apiGateway.get).toHaveBeenCalledWith('/llm_usage_records/summary', {
        params: { start_date: '2026-01-01', end_date: '2026-01-31' },
      });
    });

    it('sets loading to true during fetch and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(apiGateway.get).mockImplementationOnce(async () => {
        loadingDuringCall = useLlmUsageStore().loading;
        return { data: { records: [], total_count: 0 } };
      });

      const store = useLlmUsageStore();
      await store.fetch();

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('resets loading to false when records fetch fails', async () => {
      mockApiGateway.rejectGet('/llm_usage_records', new Error('Network error'));

      const store = useLlmUsageStore();
      await store.fetch();

      expect(store.loading).toBe(false);
    });

    it('sets error message on records failure without rethrowing', async () => {
      mockApiGateway.rejectGet('/llm_usage_records', new Error('Network error'));

      const store = useLlmUsageStore();
      await store.fetch();

      expect(store.error).toBe('Network error');
    });

    it('sets fallback error when records rejection is not an Error instance', async () => {
      vi.mocked(apiGateway.get).mockRejectedValueOnce('unexpected');

      const store = useLlmUsageStore();
      await store.fetch();

      expect(store.error).toBe('Failed to load usage records');
    });

    it('clears error on subsequent successful fetch', async () => {
      mockApiGateway.rejectGet('/llm_usage_records', new Error('fail'));

      const store = useLlmUsageStore();
      await store.fetch();

      mockApiGateway.get('/llm_usage_records', { records: [], total_count: 0 });
      await store.fetch();

      expect(store.error).toBeNull();
    });

    it('still shows records when the summary fetch fails', async () => {
      const records = [buildLlmUsageRecord({ id: 1 })];
      mockApiGateway.get('/llm_usage_records', { records, total_count: 1 });
      mockApiGateway.rejectGet('/llm_usage_records/summary', new Error('Summary unavailable'));

      const store = useLlmUsageStore();
      await store.fetch();

      expect(store.records).toEqual(records);
      expect(store.error).toBeNull();
      expect(store.summary).toBeNull();
      expect(store.loading).toBe(false);
    });

    it('discards stale responses when a newer fetch supersedes an in-flight one', async () => {
      const staleRecords = [buildLlmUsageRecord({ id: 1, llm_model_name: 'stale-model' })];
      const freshRecords = [buildLlmUsageRecord({ id: 2, llm_model_name: 'fresh-model' })];

      let resolveStale!: (value: {
        data: { records: typeof staleRecords; total_count: number };
      }) => void;
      const stalePromise = new Promise<{
        data: { records: typeof staleRecords; total_count: number };
      }>((resolve) => {
        resolveStale = resolve;
      });

      // First fetch: stale — returns staleRecords, resolves after second fetch completes
      vi.mocked(apiGateway.get).mockImplementationOnce(() => stalePromise);
      // Second fetch (summary for first fetch): immediate empty
      vi.mocked(apiGateway.get).mockResolvedValueOnce({ data: buildLlmUsageSummary() });

      const store = useLlmUsageStore();
      const fetch1 = store.fetch();

      // Second fetch starts before first resolves — sets up fresh data
      mockApiGateway.get('/llm_usage_records', { records: freshRecords, total_count: 1 });
      mockApiGateway.get('/llm_usage_records/summary', buildLlmUsageSummary());
      const fetch2 = store.fetch();
      await fetch2;

      // Now resolve the stale first fetch — its response should be discarded
      resolveStale({ data: { records: staleRecords, total_count: 99 } });
      await fetch1;

      expect(store.records).toEqual(freshRecords);
      expect(store.totalCount).toBe(1);
    });
  });

  describe('setPage', () => {
    it('sets page and re-fetches', async () => {
      const store = useLlmUsageStore();
      await store.setPage(3);

      expect(store.page).toBe(3);
      expect(apiGateway.get).toHaveBeenCalledWith('/llm_usage_records', {
        params: { page: 3, per_page: 50, start_date: undefined, end_date: undefined },
      });
    });
  });

  describe('setDateRange', () => {
    it('sets dates and resets page to 1, then re-fetches', async () => {
      const store = useLlmUsageStore();
      store.page = 5;

      await store.setDateRange('2026-01-01', '2026-01-31');

      expect(store.startDate).toBe('2026-01-01');
      expect(store.endDate).toBe('2026-01-31');
      expect(store.page).toBe(1);
    });

    it('passes new dates to the API on re-fetch', async () => {
      const store = useLlmUsageStore();
      await store.setDateRange('2026-02-01', '2026-02-28');

      expect(apiGateway.get).toHaveBeenCalledWith('/llm_usage_records', {
        params: { page: 1, per_page: 50, start_date: '2026-02-01', end_date: '2026-02-28' },
      });
    });

    it('accepts null dates to clear the filter', async () => {
      const store = useLlmUsageStore();
      store.startDate = '2026-01-01';
      store.endDate = '2026-01-31';

      await store.setDateRange(null, null);

      expect(store.startDate).toBeNull();
      expect(store.endDate).toBeNull();
    });
  });
});
