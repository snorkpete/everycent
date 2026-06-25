import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBugReportStore } from './bugReportStore';
import apiGateway from '../../api/api-gateway';
import { buildApiGatewayMock } from '../../test/buildApiGatewayMock';
import { buildBugReport } from '../../test/factories';

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

describe('bugReportStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockApiGateway.reset();
    mockApiGateway.get('/bug_reports', []);
  });

  describe('initial state', () => {
    it('starts with empty reports', () => {
      const store = useBugReportStore();
      expect(store.reports).toEqual([]);
    });

    it('starts with null error', () => {
      const store = useBugReportStore();
      expect(store.error).toBeNull();
    });
  });

  describe('fetchAll', () => {
    it('fetches reports and stores them', async () => {
      const reports = [
        buildBugReport({ id: 1, status: 'open' }),
        buildBugReport({ id: 2, status: 'in_progress' }),
      ];
      mockApiGateway.get('/bug_reports', reports);

      const store = useBugReportStore();
      await store.fetchAll();

      expect(store.reports).toEqual(reports);
    });

    it('clears error before fetching', async () => {
      const store = useBugReportStore();
      store.error = 'previous error';
      await store.fetchAll();
      expect(store.error).toBeNull();
    });

    it('sets error on failure without rethrowing', async () => {
      mockApiGateway.rejectGet('/bug_reports', new Error('Network error'));

      const store = useBugReportStore();
      await store.fetchAll();

      expect(store.error).toBe('Network error');
    });

    it('sets fallback error when rejection is not an Error instance', async () => {
      vi.mocked(apiGateway.get).mockRejectedValueOnce('unexpected');

      const store = useBugReportStore();
      await store.fetchAll();

      expect(store.error).toBe('Failed to load bug reports');
    });

    it('calls GET /bug_reports', async () => {
      const store = useBugReportStore();
      await store.fetchAll();

      expect(apiGateway.get).toHaveBeenCalledWith('/bug_reports');
    });
  });

  describe('updateStatus', () => {
    const report = buildBugReport({ id: 1, status: 'open' });

    beforeEach(() => {
      mockApiGateway.get('/bug_reports', [report]);
      mockApiGateway.patch(`/bug_reports/${report.id}`, { ...report, status: 'in_progress' });
    });

    it('calls PATCH /bug_reports/:id with the new status', async () => {
      const store = useBugReportStore();
      await store.fetchAll();
      await store.updateStatus(report.id, 'in_progress');

      expect(apiGateway.patch).toHaveBeenCalledWith(`/bug_reports/${report.id}`, {
        bug_report: { status: 'in_progress' },
      });
    });

    it('updates the report in the store with the server response', async () => {
      const store = useBugReportStore();
      await store.fetchAll();
      await store.updateStatus(report.id, 'in_progress');

      const updated = store.reports.find((r) => r.id === report.id);
      expect(updated?.status).toBe('in_progress');
    });

    it('sets error and rethrows on failure', async () => {
      mockApiGateway.rejectPatch(`/bug_reports/${report.id}`, new Error('Server error'));

      const store = useBugReportStore();
      await store.fetchAll();

      await expect(store.updateStatus(report.id, 'in_progress')).rejects.toThrow('Server error');
      expect(store.error).toBe('Server error');
    });

    it('sets fallback error and rethrows when rejection is not an Error instance', async () => {
      vi.mocked(apiGateway.patch).mockRejectedValueOnce('unexpected');

      const store = useBugReportStore();
      await store.fetchAll();

      await expect(store.updateStatus(report.id, 'in_progress')).rejects.toBeTruthy();
      expect(store.error).toBe('Failed to update bug report');
    });
  });
});
