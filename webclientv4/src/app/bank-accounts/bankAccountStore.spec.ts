import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBankAccountStore } from './bankAccountStore';
import apiGateway from '../../api/api-gateway';
import { buildApiGatewayMock } from '../../test/buildApiGatewayMock';

vi.mock('../../api/api-gateway', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockApiGateway = buildApiGatewayMock();

describe('bankAccountStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockApiGateway.reset();
    mockApiGateway.get('/bank_accounts', []);
    mockApiGateway.get('/institutions', []);
  });

  describe('fetchAll', () => {
    it('fetches and stores bank accounts', async () => {
      const accounts = [{ id: 1, name: 'Savings' }];
      mockApiGateway.get('/bank_accounts', accounts);

      const store = useBankAccountStore();
      await store.fetchAll();

      expect(store.bankAccounts).toEqual(accounts);
    });

    it('sets loading to true during fetch and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(apiGateway.get).mockImplementationOnce(async () => {
        loadingDuringCall = useBankAccountStore().loading;
        return { data: [] };
      });

      const store = useBankAccountStore();
      await store.fetchAll();

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error message on failure', async () => {
      mockApiGateway.rejectGet('/bank_accounts', new Error('Network error'));

      const store = useBankAccountStore();
      await store.fetchAll();

      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });

    it('clears error on subsequent successful fetch', async () => {
      mockApiGateway.rejectGet('/bank_accounts', new Error('fail'));

      const store = useBankAccountStore();
      await store.fetchAll();

      mockApiGateway.get('/bank_accounts', []);
      await store.fetchAll();

      expect(store.error).toBeNull();
    });
  });

  describe('fetchInstitutions', () => {
    it('fetches and stores institutions', async () => {
      const institutions = [{ id: 1, name: 'First Bank' }];
      mockApiGateway.get('/institutions', institutions);

      const store = useBankAccountStore();
      await store.fetchInstitutions();

      expect(store.institutions).toEqual(institutions);
    });

    it('manages loading state', async () => {
      const store = useBankAccountStore();
      const promise = store.fetchInstitutions();
      expect(store.loading).toBe(true);

      await promise;
      expect(store.loading).toBe(false);
    });

    it('resets loading on failure', async () => {
      mockApiGateway.rejectGet('/institutions', new Error('Timeout'));

      const store = useBankAccountStore();
      await store.fetchInstitutions();

      expect(store.loading).toBe(false);
      expect(store.error).toBe('Timeout');
    });

    it('sets error message on failure', async () => {
      mockApiGateway.rejectGet('/institutions', new Error('Timeout'));

      const store = useBankAccountStore();
      await store.fetchInstitutions();

      expect(store.error).toBe('Timeout');
    });
  });

  describe('save', () => {
    it('creates a new account when no id is present', async () => {
      const newAccount = { name: 'New Savings' };
      mockApiGateway.post('/bank_accounts', { id: 1, ...newAccount });

      const store = useBankAccountStore();
      await store.save(newAccount);

      expect(apiGateway.post).toHaveBeenCalledWith('/bank_accounts', newAccount);
      expect(apiGateway.put).not.toHaveBeenCalled();
    });

    it('updates an existing account when id is present', async () => {
      const account = { id: 5, name: 'Updated Account' };
      mockApiGateway.put('/bank_accounts/5', account);

      const store = useBankAccountStore();
      await store.save(account);

      expect(apiGateway.put).toHaveBeenCalledWith('/bank_accounts/5', account);
      expect(apiGateway.post).not.toHaveBeenCalled();
    });

    it('sets error message and re-throws on save failure', async () => {
      mockApiGateway.rejectPut('/bank_accounts/5', new Error('Server error'));

      const store = useBankAccountStore();
      await expect(store.save({ id: 5, name: 'Account' })).rejects.toThrow('Server error');

      expect(store.error).toBe('Server error');
    });

    it('sets loading to true during save and false after', async () => {
      let loadingDuringSave = false;
      vi.mocked(apiGateway.put).mockImplementationOnce(async () => {
        loadingDuringSave = useBankAccountStore().loading;
        return { data: { id: 5 } };
      });

      const store = useBankAccountStore();
      await store.save({ id: 5, name: 'Account' });

      expect(loadingDuringSave).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('resets loading to false on save failure', async () => {
      mockApiGateway.rejectPut('/bank_accounts/5', new Error('fail'));

      const store = useBankAccountStore();
      await store.save({ id: 5, name: 'Account' }).catch(() => {});

      expect(store.loading).toBe(false);
    });

    it('refreshes bank accounts after save', async () => {
      const refreshed = [{ id: 5, name: 'Updated Account' }];
      mockApiGateway.put('/bank_accounts/5', refreshed[0]);
      mockApiGateway.get('/bank_accounts', refreshed);

      const store = useBankAccountStore();
      await store.save({ id: 5, name: 'Updated Account' });

      expect(store.bankAccounts).toEqual(refreshed);
    });
  });
});
