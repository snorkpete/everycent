import type { BugReportData } from '../../app/bug-reports/bugReport.types';

export function buildBugReport(overrides?: Partial<BugReportData>): BugReportData {
  return {
    id: 1,
    title: 'Something is broken',
    description: 'When I click the button, nothing happens.',
    status: 'open',
    reporter_name: 'Jane Smith',
    created_at: '2026-06-15T10:00:00.000Z',
    ...overrides,
  };
}
