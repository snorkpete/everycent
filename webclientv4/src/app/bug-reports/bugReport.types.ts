export const BugReportStatus = {
  Open: 'open',
  InProgress: 'in_progress',
  Fixed: 'fixed',
} as const;

export type BugReportStatus = (typeof BugReportStatus)[keyof typeof BugReportStatus];

export interface BugReportData {
  id: number;
  title: string;
  description: string;
  status: BugReportStatus;
  reporter_name: string;
  created_at: string;
}
