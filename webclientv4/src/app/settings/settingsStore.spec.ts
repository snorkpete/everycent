import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSettingsStore } from './settingsStore';
import { settingsApi } from './settingsApi';
import { bankAccountApi } from '../bank-accounts/bankAccountApi';
import { allocationCategoryApi } from '../allocation-categories/allocationCategoryApi';

vi.mock('./settingsApi', () => ({
  settingsApi: {
    get: vi.fn(),
    save: vi.fn(),
  },
}));

vi.mock('../bank-accounts/bankAccountApi', () => ({
  bankAccountApi: {
    getOpen: vi.fn(),
  },
}));

vi.mock('../allocation-categories/allocationCategoryApi', () => ({
  allocationCategoryApi: {
    getAll: vi.fn(),
  },
}));

describe('settingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('fetches and stores settings, bank accounts, and allocation categories', async () => {
      const loadedSettings = { family_type: 'couple' as const, husband: 'John', wife: 'Jane' };
      const loadedAccounts = [{ id: 1, name: 'Savings' }];
      const loadedCategories = [{ id: 2, name: 'Groceries' }];

      vi.mocked(settingsApi.get).mockResolvedValue(loadedSettings);
      vi.mocked(bankAccountApi.getOpen).mockResolvedValue(loadedAccounts);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(loadedCategories);

      const store = useSettingsStore();
      await store.fetchAll();

      expect(store.settings).toEqual(loadedSettings);
      expect(store.bankAccounts).toEqual(loadedAccounts);
      expect(store.allocationCategories).toEqual(loadedCategories);
    });

    it('sets error message on failure', async () => {
      vi.mocked(settingsApi.get).mockRejectedValue(new Error('Network error'));
      vi.mocked(bankAccountApi.getOpen).mockResolvedValue([]);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue([]);

      const store = useSettingsStore();
      await store.fetchAll();

      expect(store.error).toBe('Network error');
    });

    it('sets a fallback error message when the rejection is not an Error instance', async () => {
      vi.mocked(settingsApi.get).mockRejectedValue('unexpected');
      vi.mocked(bankAccountApi.getOpen).mockResolvedValue([]);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue([]);

      const store = useSettingsStore();
      await store.fetchAll();

      expect(store.error).toBe('Failed to load settings');
    });

    it('clears error on subsequent successful fetch', async () => {
      vi.mocked(settingsApi.get).mockRejectedValueOnce(new Error('fail'));
      vi.mocked(settingsApi.get).mockResolvedValueOnce({});
      vi.mocked(bankAccountApi.getOpen).mockResolvedValue([]);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue([]);

      const store = useSettingsStore();
      await store.fetchAll();
      await store.fetchAll();

      expect(store.error).toBeNull();
    });
  });

  describe('save', () => {
    it('posts settings and stores the returned settings object', async () => {
      const newSettings = { family_type: 'single' as const, single_person: 'Alex' };
      vi.mocked(settingsApi.save).mockResolvedValue(newSettings);

      const store = useSettingsStore();
      await store.save(newSettings);

      expect(settingsApi.save).toHaveBeenCalledWith(newSettings);
      expect(store.settings).toEqual(newSettings);
    });

    it('stores the settings object after save, not a success flag', async () => {
      const savedSettings = { family_type: 'couple' as const, husband: 'John', wife: 'Jane' };
      vi.mocked(settingsApi.save).mockResolvedValue(savedSettings);

      const store = useSettingsStore();
      await store.save(savedSettings);

      expect(store.settings).not.toHaveProperty('success');
      expect(store.settings).toEqual(savedSettings);
    });

    it('sets error message and re-throws on save failure', async () => {
      vi.mocked(settingsApi.save).mockRejectedValue(new Error('Server error'));

      const store = useSettingsStore();
      await expect(store.save({})).rejects.toThrow('Server error');

      expect(store.error).toBe('Server error');
    });

    it('sets a fallback error message when the save rejection is not an Error instance', async () => {
      vi.mocked(settingsApi.save).mockRejectedValue('unexpected');

      const store = useSettingsStore();
      await store.save({}).catch(() => {});

      expect(store.error).toBe('Failed to save settings');
    });

  });
});
