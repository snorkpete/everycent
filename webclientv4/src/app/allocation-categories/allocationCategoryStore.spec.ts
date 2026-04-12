import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAllocationCategoryStore } from './allocationCategoryStore';
import { allocationCategoryApi } from './allocationCategoryApi';

vi.mock('./allocationCategoryApi', () => ({
  allocationCategoryApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

describe('allocationCategoryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchAll', () => {
    it('fetches and stores allocation categories', async () => {
      const categories = [{ id: 1, name: 'Groceries' }];
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(categories);

      const store = useAllocationCategoryStore();
      await store.fetchAll();

      expect(store.allocationCategories).toEqual(categories);
    });

    it('sets error message on failure', async () => {
      vi.mocked(allocationCategoryApi.getAll).mockRejectedValue(new Error('Network error'));

      const store = useAllocationCategoryStore();
      await store.fetchAll();

      expect(store.error).toBe('Network error');
    });

    it('sets a fallback error message when the rejection is not an Error instance', async () => {
      vi.mocked(allocationCategoryApi.getAll).mockRejectedValue('unexpected');

      const store = useAllocationCategoryStore();
      await store.fetchAll();

      expect(store.error).toBe('Failed to load allocation categories');
    });

    it('clears error on subsequent successful fetch', async () => {
      vi.mocked(allocationCategoryApi.getAll).mockRejectedValueOnce(new Error('fail'));
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValueOnce([]);

      const store = useAllocationCategoryStore();
      await store.fetchAll();
      await store.fetchAll();

      expect(store.error).toBeNull();
    });
  });

  describe('save', () => {
    it('creates a new category when no id is present', async () => {
      const newCategory = { name: 'New Category' };
      vi.mocked(allocationCategoryApi.create).mockResolvedValue({ id: 1, ...newCategory });
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue([]);

      const store = useAllocationCategoryStore();
      await store.save(newCategory);

      expect(allocationCategoryApi.create).toHaveBeenCalledWith(newCategory);
      expect(allocationCategoryApi.update).not.toHaveBeenCalled();
    });

    it('updates an existing category when id is present', async () => {
      const category = { id: 3, name: 'Updated Category' };
      vi.mocked(allocationCategoryApi.update).mockResolvedValue(category);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue([]);

      const store = useAllocationCategoryStore();
      await store.save(category);

      expect(allocationCategoryApi.update).toHaveBeenCalledWith(category);
      expect(allocationCategoryApi.create).not.toHaveBeenCalled();
    });

    it('sets error message and re-throws on save failure', async () => {
      vi.mocked(allocationCategoryApi.update).mockRejectedValue(new Error('Server error'));

      const store = useAllocationCategoryStore();
      await expect(store.save({ id: 3, name: 'Category' })).rejects.toThrow('Server error');

      expect(store.error).toBe('Server error');
    });

    it('sets a fallback error message when the save rejection is not an Error instance', async () => {
      vi.mocked(allocationCategoryApi.update).mockRejectedValue('unexpected');

      const store = useAllocationCategoryStore();
      await store.save({ id: 3, name: 'Category' }).catch(() => {});

      expect(store.error).toBe('Failed to save allocation category');
    });

    it('refreshes allocation categories after save', async () => {
      const refreshed = [{ id: 3, name: 'Updated Category' }];
      vi.mocked(allocationCategoryApi.update).mockResolvedValue(refreshed[0]);
      vi.mocked(allocationCategoryApi.getAll).mockResolvedValue(refreshed);

      const store = useAllocationCategoryStore();
      await store.save({ id: 3, name: 'Updated Category' });

      expect(store.allocationCategories).toEqual(refreshed);
    });
  });
});
