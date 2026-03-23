import apiGateway from '../../api/api-gateway';
import type { AccountBalanceData, BalanceAdjustmentData } from './accountBalance.types';

export const accountBalanceApi = {
  getAll: (includeClosed?: boolean) => {
    const params = includeClosed ? { include_closed: true } : undefined;
    return apiGateway
      .get<AccountBalanceData[]>('/account_balances', { params })
      .then((r) => r.data);
  },

  adjustBalances: (adjustments: BalanceAdjustmentData[]) =>
    apiGateway
      .post<{ success: boolean }>('/bank_accounts/manually_adjust_balances', { adjustments })
      .then((r) => r.data),
};
