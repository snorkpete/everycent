import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bankAccountApi } from './bankAccountApi';
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

  describe('getInstitutions', () => {
    it('gets /institutions', async () => {
      vi.mocked(apiGateway.get).mockResolvedValue({ data: [] });

      await bankAccountApi.getInstitutions();

      expect(apiGateway.get).toHaveBeenCalledWith('/institutions');
    });

    it('returns the response data', async () => {
      const institutions = [{ id: 1, name: 'First Bank' }];
      vi.mocked(apiGateway.get).mockResolvedValue({ data: institutions });

      const result = await bankAccountApi.getInstitutions();

      expect(result).toEqual(institutions);
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
});
