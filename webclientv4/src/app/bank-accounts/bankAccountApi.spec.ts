import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bankAccountApi } from './bankAccountApi';
import type { AccountTransferData } from './bankAccount.types';
import apiGateway from '../../api/api-gateway';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('bankAccountApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('gets /bank_accounts with include_closed param', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: [] });

      await bankAccountApi.getAll();

      expect(apiGateway.get).toHaveBeenCalledWith('/bank_accounts', {
        params: { include_closed: true },
      });
    });

    it('returns the response data', async () => {
      const accounts = [{ id: 1, name: 'Savings' }];
      vi.mocked(apiGateway.get).mockResolvedValue({ data: accounts });

      const result = await bankAccountApi.getAll();

      expect(result).toEqual(accounts);
    });
  });

  describe('create', () => {
    it('posts to /bank_accounts with account data', async () => {
      const account = { name: 'New Account', account_type: 'normal' };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: { id: 1, ...account } });

      await bankAccountApi.create(account);

      expect(apiGateway.post).toHaveBeenCalledWith('/bank_accounts', account);
    });

    it('returns the response data', async () => {
      const account = { name: 'New Account' };
      const created = { id: 1, ...account };
      vi.mocked(apiGateway.post).mockResolvedValue({ data: created });

      const result = await bankAccountApi.create(account);

      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('puts to /bank_accounts/:id with account data', async () => {
      const account = { id: 5, name: 'Updated Account' };
      vi.mocked(apiGateway.put).mockResolvedValue({ data: account });

      await bankAccountApi.update(account);

      expect(apiGateway.put).toHaveBeenCalledWith('/bank_accounts/5', account);
    });

    it('returns the response data', async () => {
      const account = { id: 5, name: 'Updated Account' };
      vi.mocked(apiGateway.put).mockResolvedValue({ data: account });

      const result = await bankAccountApi.update(account);

      expect(result).toEqual(account);
    });
  });

  describe('getWithBalances', () => {
    it('gets /bank_accounts with include_current_balance param', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: [] });

      await bankAccountApi.getWithBalances();

      expect(apiGateway.get).toHaveBeenCalledWith('/bank_accounts', {
        params: { include_current_balance: true },
      });
    });

    it('returns the response data', async () => {
      const accounts = [{ id: 1, name: 'Savings', current_balance: 100000 }];
      vi.mocked(apiGateway.get).mockResolvedValue({ data: accounts });

      const result = await bankAccountApi.getWithBalances();

      expect(result).toEqual(accounts);
    });
  });

  describe('transfer', () => {
    const fromId = 3;
    const transferData: AccountTransferData = {
      from: 3,
      to: 7,
      amount: 5000,
      date: '2025-01-15',
      description: 'Savings transfer',
      budget_id: 1,
    };

    it('posts to /bank_accounts/:fromId/transfer with transfer data', async () => {
      vi.mocked(apiGateway.post).mockResolvedValue({ data: undefined });

      await bankAccountApi.transfer(fromId, transferData);

      expect(apiGateway.post).toHaveBeenCalledWith('/bank_accounts/3/transfer', transferData);
    });

    it('resolves with void on success', async () => {
      vi.mocked(apiGateway.post).mockResolvedValue({ data: undefined });

      const result = await bankAccountApi.transfer(fromId, transferData);

      expect(result).toBeUndefined();
    });
  });
});
