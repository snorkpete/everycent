import apiGateway from '../../api/api-gateway';
import type { ReportResponse } from './report.types';
import type { NetWorthRow } from './net-worth/netWorth.types';
import type { CategorySpendingRow } from './category-spending/categorySpending.types';
import type { NeedsVsWantsRow } from './needs-vs-wants/needsVsWants.types';

export const reportApi = {
  getNetWorth: () =>
    apiGateway
      .get<ReportResponse<NetWorthRow>>('/reports/net_worth')
      .then((r) => r.data),

  getCategorySpending: () =>
    apiGateway
      .get<ReportResponse<CategorySpendingRow>>('/reports/category_spending')
      .then((r) => r.data),

  getNeedsVsWants: () =>
    apiGateway
      .get<ReportResponse<NeedsVsWantsRow>>('/reports/needs_vs_wants')
      .then((r) => r.data),
};
