import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bugReportApi } from './bugReportApi';
import apiGateway from '../../api/api-gateway';
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

describe('bugReportApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('gets /bug_reports', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: [] });

      await bugReportApi.getAll();

      expect(apiGateway.get).toHaveBeenCalledWith('/bug_reports');
    });

    it('returns the response data', async () => {
      const reports = [buildBugReport({ id: 1 }), buildBugReport({ id: 2 })];
      vi.mocked(apiGateway.get).mockResolvedValue({ data: reports });

      const result = await bugReportApi.getAll();

      expect(result).toEqual(reports);
    });
  });

  describe('updateStatus', () => {
    it('patches /bug_reports/:id with the status wrapped in bug_report', async () => {
      const updated = buildBugReport({ id: 5, status: 'fixed' });
      vi.mocked(apiGateway.patch).mockResolvedValue({ data: updated });

      await bugReportApi.updateStatus(5, 'fixed');

      expect(apiGateway.patch).toHaveBeenCalledWith('/bug_reports/5', {
        bug_report: { status: 'fixed' },
      });
    });

    it('returns the updated report', async () => {
      const updated = buildBugReport({ id: 5, status: 'fixed' });
      vi.mocked(apiGateway.patch).mockResolvedValue({ data: updated });

      const result = await bugReportApi.updateStatus(5, 'fixed');

      expect(result).toEqual(updated);
    });
  });
});
