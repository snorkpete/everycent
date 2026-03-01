import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBankAccountStore } from './bankAccountStore';
import { bankAccountApi } from './bankAccountApi';

vi.mock('./bankAccountApi', () => ({
  bankAccountApi: {
    getAll: vi.fn(),
    getInstitutions: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

describe('bankAccountStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('fetches and stores bank accounts', async () => {
      const accounts = [{ id: 1, name: 'Savings' }];
      vi.mocked(bankAccountApi.getAll).mockResolvedValue(accounts);

      const store = useBankAccountStore();
      await store.fetchAll();

      expect(store.bankAccounts).toEqual(accounts);
    });

    it('sets loading to true during fetch and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(bankAccountApi.getAll).mockImplementation(async () => {
        loadingDuringCall = useBankAccountStore().loading;
        return [];
      });

      const store = useBankAccountStore();
      await store.fetchAll();

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error message on failure', async () => {
      vi.mocked(bankAccountApi.getAll).mockRejectedValue(new Error('Network error'));

      const store = useBankAccountStore();
      await store.fetchAll();

      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });

    it('clears error on subsequent successful fetch', async () => {
      vi.mocked(bankAccountApi.getAll).mockRejectedValueOnce(new Error('fail'));
      vi.mocked(bankAccountApi.getAll).mockResolvedValueOnce([]);

      const store = useBankAccountStore();
      await store.fetchAll();
      await store.fetchAll();

      expect(store.error).toBeNull();
    });
  });

  describe('fetchInstitutions', () => {
    it('fetches and stores institutions', async () => {
      const institutions = [{ id: 1, name: 'First Bank' }];
      vi.mocked(bankAccountApi.getInstitutions).mockResolvedValue(institutions);

      const store = useBankAccountStore();
      await store.fetchInstitutions();

      expect(store.institutions).toEqual(institutions);
    });

    it('sets error message on failure', async () => {
      vi.mocked(bankAccountApi.getInstitutions).mockRejectedValue(new Error('Timeout'));

      const store = useBankAccountStore();
      await store.fetchInstitutions();

      expect(store.error).toBe('Timeout');
    });
  });

  describe('save', () => {
    it('creates a new account when no id is present', async () => {
      const newAccount = { name: 'New Savings' };
      vi.mocked(bankAccountApi.create).mockResolvedValue({ id: 1, ...newAccount });
      vi.mocked(bankAccountApi.getAll).mockResolvedValue([]);

      const store = useBankAccountStore();
      await store.save(newAccount);

      expect(bankAccountApi.create).toHaveBeenCalledWith(newAccount);
      expect(bankAccountApi.update).not.toHaveBeenCalled();
    });

    it('updates an existing account when id is present', async () => {
      const account = { id: 5, name: 'Updated Account' };
      vi.mocked(bankAccountApi.update).mockResolvedValue(account);
      vi.mocked(bankAccountApi.getAll).mockResolvedValue([]);

      const store = useBankAccountStore();
      await store.save(account);

      expect(bankAccountApi.update).toHaveBeenCalledWith(account);
      expect(bankAccountApi.create).not.toHaveBeenCalled();
    });

    it('sets error message on save failure', async () => {
      vi.mocked(bankAccountApi.update).mockRejectedValue(new Error('Server error'));

      const store = useBankAccountStore();
      await store.save({ id: 5, name: 'Account' });

      expect(store.error).toBe('Server error');
    });

    it('refreshes bank accounts after save', async () => {
      const refreshed = [{ id: 5, name: 'Updated Account' }];
      vi.mocked(bankAccountApi.update).mockResolvedValue(refreshed[0]);
      vi.mocked(bankAccountApi.getAll).mockResolvedValue(refreshed);

      const store = useBankAccountStore();
      await store.save({ id: 5, name: 'Updated Account' });

      expect(store.bankAccounts).toEqual(refreshed);
    });
  });
});
