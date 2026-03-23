import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useInstitutionStore } from './institutionStore';
import { institutionApi } from './institutionApi';

vi.mock('./institutionApi', () => ({
  institutionApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

describe('institutionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('fetches and stores institutions', async () => {
      const institutions = [{ id: 1, name: 'First Bank' }];
      vi.mocked(institutionApi.getAll).mockResolvedValue(institutions);

      const store = useInstitutionStore();
      await store.fetchAll();

      expect(store.institutions).toEqual(institutions);
    });

    it('sets loading to true during fetch and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(institutionApi.getAll).mockImplementation(async () => {
        loadingDuringCall = useInstitutionStore().loading;
        return [];
      });

      const store = useInstitutionStore();
      await store.fetchAll();

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error message on failure', async () => {
      vi.mocked(institutionApi.getAll).mockRejectedValue(new Error('Network error'));

      const store = useInstitutionStore();
      await store.fetchAll();

      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });

    it('sets a fallback error message when the rejection is not an Error instance', async () => {
      vi.mocked(institutionApi.getAll).mockRejectedValue('unexpected');

      const store = useInstitutionStore();
      await store.fetchAll();

      expect(store.error).toBe('Failed to load institutions');
    });

    it('clears error on subsequent successful fetch', async () => {
      vi.mocked(institutionApi.getAll).mockRejectedValueOnce(new Error('fail'));
      vi.mocked(institutionApi.getAll).mockResolvedValueOnce([]);

      const store = useInstitutionStore();
      await store.fetchAll();
      await store.fetchAll();

      expect(store.error).toBeNull();
    });
  });

  describe('save', () => {
    it('creates a new institution when no id is present', async () => {
      const newInstitution = { name: 'New Bank' };
      vi.mocked(institutionApi.create).mockResolvedValue({ id: 1, ...newInstitution });
      vi.mocked(institutionApi.getAll).mockResolvedValue([]);

      const store = useInstitutionStore();
      await store.save(newInstitution);

      expect(institutionApi.create).toHaveBeenCalledWith(newInstitution);
      expect(institutionApi.update).not.toHaveBeenCalled();
    });

    it('updates an existing institution when id is present', async () => {
      const institution = { id: 3, name: 'Updated Bank' };
      vi.mocked(institutionApi.update).mockResolvedValue(institution);
      vi.mocked(institutionApi.getAll).mockResolvedValue([]);

      const store = useInstitutionStore();
      await store.save(institution);

      expect(institutionApi.update).toHaveBeenCalledWith(institution);
      expect(institutionApi.create).not.toHaveBeenCalled();
    });

    it('sets error message and re-throws on save failure', async () => {
      vi.mocked(institutionApi.update).mockRejectedValue(new Error('Server error'));

      const store = useInstitutionStore();
      await expect(store.save({ id: 3, name: 'Bank' })).rejects.toThrow('Server error');

      expect(store.error).toBe('Server error');
    });

    it('sets a fallback error message when the save rejection is not an Error instance', async () => {
      vi.mocked(institutionApi.update).mockRejectedValue('unexpected');

      const store = useInstitutionStore();
      await store.save({ id: 3, name: 'Bank' }).catch(() => {});

      expect(store.error).toBe('Failed to save institution');
    });

    it('sets loading to true during save and false after', async () => {
      let loadingDuringSave = false;
      vi.mocked(institutionApi.update).mockImplementation(async () => {
        loadingDuringSave = useInstitutionStore().loading;
        return { id: 3 };
      });
      vi.mocked(institutionApi.getAll).mockResolvedValue([]);

      const store = useInstitutionStore();
      await store.save({ id: 3, name: 'Bank' });

      expect(loadingDuringSave).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('resets loading to false on save failure', async () => {
      vi.mocked(institutionApi.update).mockRejectedValue(new Error('fail'));

      const store = useInstitutionStore();
      await store.save({ id: 3, name: 'Bank' }).catch(() => {});

      expect(store.loading).toBe(false);
    });

    it('refreshes institutions after save', async () => {
      const refreshed = [{ id: 3, name: 'Updated Bank' }];
      vi.mocked(institutionApi.update).mockResolvedValue(refreshed[0]);
      vi.mocked(institutionApi.getAll).mockResolvedValue(refreshed);

      const store = useInstitutionStore();
      await store.save({ id: 3, name: 'Updated Bank' });

      expect(store.institutions).toEqual(refreshed);
    });
  });
});
