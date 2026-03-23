import apiGateway from '../../api/api-gateway';
import type { SinkFundData, SinkFundTransferData } from './sinkFund.types';

export const sinkFundApi = {
  getAll: () =>
    apiGateway
      .get<{ bank_accounts: SinkFundData[] }>('/sink_funds')
      .then((r) => r.data.bank_accounts),

  get: (id: number) =>
    apiGateway
      .get<{ bank_account: SinkFundData }>(`/sink_funds/${id}`)
      .then((r) => r.data.bank_account),

  save: (sinkFund: SinkFundData) =>
    apiGateway
      .put<{ bank_account: SinkFundData }>(`/sink_funds/${sinkFund.id}`, {
        sink_fund: {
          id: sinkFund.id,
          sink_fund_allocations: sinkFund.sink_fund_allocations,
        },
      })
      .then((r) => r.data.bank_account),

  transfer: (sinkFundId: number, transferData: SinkFundTransferData) =>
    apiGateway
      .post<{
        bank_account: SinkFundData;
      }>(`/sink_funds/${sinkFundId}/transfer_allocation`, transferData)
      .then((r) => r.data.bank_account),
};
