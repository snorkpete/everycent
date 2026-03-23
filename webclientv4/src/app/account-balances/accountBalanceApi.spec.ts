import { describe, it, expect, vi, beforeEach } from 'vitest';
import { accountBalanceApi } from './accountBalanceApi';
import type { BalanceAdjustmentData } from './accountBalance.types';
import apiGateway from '../../api/api-gateway';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('accountBalanceApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('gets /account_balances without params when includeClosed is not specified', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: [] });

      await accountBalanceApi.getAll();

      expect(apiGateway.get).toHaveBeenCalledWith('/account_balances', { params: undefined });
    });

    it('gets /account_balances without params when includeClosed is false', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: [] });

      await accountBalanceApi.getAll(false);

      expect(apiGateway.get).toHaveBeenCalledWith('/account_balances', { params: undefined });
    });

    it('gets /account_balances with include_closed param when includeClosed is true', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: [] });

      await accountBalanceApi.getAll(true);

      expect(apiGateway.get).toHaveBeenCalledWith('/account_balances', {
        params: { include_closed: true },
      });
    });

    it('returns the response data', async () => {
      const accounts = [
        {
          id: 1,
          name: 'Joint Account',
          account_type: 'savings_account',
          account_category: 'current',
          is_cash: true,
          closing_date: '2026-03-24',
          next_closing_date: '2026-04-24',
          closing_balance: 164215,
          expected_closing_balance: 150000,
          current_balance: 164215,
        },
      ];
      vi.mocked(apiGateway.get).mockResolvedValue({ data: accounts });

      const result = await accountBalanceApi.getAll();

      expect(result).toEqual(accounts);
    });
  });

  describe('adjustBalances', () => {
    const adjustments: BalanceAdjustmentData[] = [
      { bank_account_id: 10, new_balance: 170000, currentBalance: 164215 },
      { bank_account_id: 12, new_balance: 50000, currentBalance: 48000 },
    ];

    it('posts to /bank_accounts/manually_adjust_balances with adjustments payload', async () => {
      vi.mocked(apiGateway.post).mockResolvedValue({ data: { success: true } });

      await accountBalanceApi.adjustBalances(adjustments);

      expect(apiGateway.post).toHaveBeenCalledWith(
        '/bank_accounts/manually_adjust_balances',
        { adjustments },
      );
    });

    it('returns the response data', async () => {
      vi.mocked(apiGateway.post).mockResolvedValue({ data: { success: true } });

      const result = await accountBalanceApi.adjustBalances(adjustments);

      expect(result).toEqual({ success: true });
    });
  });
});
