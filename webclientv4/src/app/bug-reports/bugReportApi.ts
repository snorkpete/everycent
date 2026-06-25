import apiGateway from '../../api/api-gateway';
import type { BugReportData, BugReportStatus } from './bugReport.types';

export const bugReportApi = {
  getAll: () => apiGateway.get<BugReportData[]>('/bug_reports').then((r) => r.data),

  updateStatus: (id: number, status: BugReportStatus) =>
    apiGateway
      .patch<BugReportData>(`/bug_reports/${id}`, { bug_report: { status } })
      .then((r) => r.data),
};
