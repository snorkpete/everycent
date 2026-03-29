import apiGateway from '../../api/api-gateway';
import type { SinkFundData, SinkFundTransferData } from './sinkFund.types';
import type { TransactionData } from '../transactions/transaction.types';

export const sinkFundApi = {
  getAll: () => apiGateway.get<SinkFundData[]>('/sink_funds').then((r) => r.data),

  get: (id: number) => apiGateway.get<SinkFundData>(`/sink_funds/${id}`).then((r) => r.data),

  save: (sinkFund: SinkFundData) =>
    apiGateway
      .put<SinkFundData>(`/sink_funds/${sinkFund.id}`, {
        sink_fund: {
          id: sinkFund.id,
          sink_fund_allocations: sinkFund.sink_fund_allocations,
        },
      })
      .then((r) => r.data),

  transfer: (sinkFundId: number, transferData: SinkFundTransferData) =>
    apiGateway
      .post<SinkFundData>(`/sink_funds/${sinkFundId}/transfer_allocation`, transferData)
      .then((r) => r.data),

  getTransactionsForAllocation: (sinkFundAllocationId: number) =>
    apiGateway
      .get<TransactionData[]>('/transactions/by_sink_fund_allocation', {
        params: { sink_fund_allocation_id: sinkFundAllocationId },
      })
      .then((r) => r.data),
};
