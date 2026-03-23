import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sinkFundApi } from './sinkFundApi';
import type { SinkFundData, SinkFundTransferData } from './sinkFund.types';
import apiGateway from '../../api/api-gateway';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('sinkFundApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('gets /sink_funds', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: { bank_accounts: [] } });

      await sinkFundApi.getAll();

      expect(apiGateway.get).toHaveBeenCalledWith('/sink_funds');
    });

    it('returns the bank_accounts array from the response', async () => {
      const sinkFunds: SinkFundData[] = [{ id: 1, name: 'Emergency Fund' }];
      vi.mocked(apiGateway.get).mockResolvedValue({ data: { bank_accounts: sinkFunds } });

      const result = await sinkFundApi.getAll();

      expect(result).toEqual(sinkFunds);
    });
  });

  describe('get', () => {
    it('gets /sink_funds/:id', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: { bank_account: { id: 5 } } });

      await sinkFundApi.get(5);

      expect(apiGateway.get).toHaveBeenCalledWith('/sink_funds/5');
    });

    it('returns the bank_account from the response', async () => {
      const sinkFund: SinkFundData = { id: 5, name: 'Holiday Fund', sink_fund_allocations: [] };
      vi.mocked(apiGateway.get).mockResolvedValue({ data: { bank_account: sinkFund } });

      const result = await sinkFundApi.get(5);

      expect(result).toEqual(sinkFund);
    });
  });

  describe('save', () => {
    const sinkFund: SinkFundData = {
      id: 3,
      name: 'Rainy Day Fund',
      sink_fund_allocations: [{ id: 10, name: 'Car repairs', amount: 50000 }],
    };

    it('puts to /sink_funds/:id with nested sink_fund payload', async () => {
      vi.mocked(apiGateway.put).mockResolvedValue({ data: { bank_account: sinkFund } });

      await sinkFundApi.save(sinkFund);

      expect(apiGateway.put).toHaveBeenCalledWith('/sink_funds/3', {
        sink_fund: {
          id: 3,
          sink_fund_allocations: sinkFund.sink_fund_allocations,
        },
      });
    });

    it('returns the bank_account from the response', async () => {
      const saved: SinkFundData = { ...sinkFund, current_balance: 100000 };
      vi.mocked(apiGateway.put).mockResolvedValue({ data: { bank_account: saved } });

      const result = await sinkFundApi.save(sinkFund);

      expect(result).toEqual(saved);
    });
  });

  describe('transfer', () => {
    const transferData: SinkFundTransferData = {
      existing_allocation_id: 10,
      new_allocation_id: 20,
      amount: 25000,
    };

    it('posts to /sink_funds/:id/transfer_allocation with transfer data', async () => {
      vi.mocked(apiGateway.post).mockResolvedValue({ data: { bank_account: { id: 3 } } });

      await sinkFundApi.transfer(3, transferData);

      expect(apiGateway.post).toHaveBeenCalledWith(
        '/sink_funds/3/transfer_allocation',
        transferData,
      );
    });

    it('returns the bank_account from the response', async () => {
      const updatedFund: SinkFundData = { id: 3, name: 'Rainy Day Fund' };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: { bank_account: updatedFund } });

      const result = await sinkFundApi.transfer(3, transferData);

      expect(result).toEqual(updatedFund);
    });
  });
});
