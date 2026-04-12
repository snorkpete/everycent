import apiGateway from '../../api/api-gateway';
import type { ReportResponse } from './report.types';
import type { NetWorthRow } from './net-worth/netWorth.types';

export const reportApi = {
  getNetWorth: () =>
    apiGateway
      .get<ReportResponse<NetWorthRow>>('/reports/net_worth')
      .then((r) => r.data),

  getCategorySpending: () =>
    apiGateway
      .get<ReportResponse<Record<string, unknown>>>('/reports/category_spending')
      .then((r) => r.data),

  getNeedsVsWants: () =>
    apiGateway
      .get<ReportResponse<Record<string, unknown>>>('/reports/needs_vs_wants')
      .then((r) => r.data),
};
