import apiGateway from '../../api/api-gateway';
import type { TransactionData, SinkFundAllocationData } from './transaction.types';

export const transactionApi = {
  getAll: (params: { budgetId: number; bankAccountId: number }) =>
    apiGateway
      .get<TransactionData[]>('/transactions', {
        params: { budget_id: params.budgetId, bank_account_id: params.bankAccountId },
      })
      .then((r) => r.data),

  save: (payload: { bankAccountId: number; budgetId: number; transactions: TransactionData[] }) =>
    apiGateway
      .post<TransactionData[]>('/transactions', {
        bank_account_id: payload.bankAccountId,
        budget_id: payload.budgetId,
        transactions: payload.transactions,
      })
      .then((r) => r.data),

  getSinkFundAllocations: (bankAccountId: number) =>
    apiGateway
      .get<SinkFundAllocationData[]>('/sink_fund_allocations', {
        params: { bank_account_id: bankAccountId },
      })
      .then((r) => r.data),
};
