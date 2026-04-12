import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCategorySpendingStore } from './categorySpendingStore';
import { reportApi } from '../reportApi';

vi.mock('../reportApi', () => ({
  reportApi: {
    getCategorySpending: vi.fn(),
  },
}));

const mockRows = [
  { period: '2024-01', category_name: 'Groceries', budgeted: 50000, spent: 45000, diff: 5000 },
  { period: '2024-01', category_name: 'Dining', budgeted: 20000, spent: 22000, diff: -2000 },
];

const mockFields = [
  { name: 'period', label: 'Period', numeric: false },
  { name: 'category_name', label: 'Category', numeric: false },
  { name: 'budgeted', label: 'Budgeted', numeric: true },
  { name: 'spent', label: 'Spent', numeric: true },
  { name: 'diff', label: 'Diff', numeric: true },
];

describe('categorySpendingStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts with empty data and fields', () => {
      const store = useCategorySpendingStore();

      expect(store.data).toEqual([]);
      expect(store.fields).toEqual([]);
    });

    it('starts with loading false and no error', () => {
      const store = useCategorySpendingStore();

      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('fetch', () => {
    it('fetches and stores data and fields', async () => {
      vi.mocked(reportApi.getCategorySpending).mockResolvedValue({
        success: true,
        data: mockRows,
        fields: mockFields,
      });

      const store = useCategorySpendingStore();
      await store.fetch();

      expect(store.data).toEqual(mockRows);
      expect(store.fields).toEqual(mockFields);
    });

    it('sets loading to true during fetch and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(reportApi.getCategorySpending).mockImplementationOnce(async () => {
        loadingDuringCall = useCategorySpendingStore().loading;
        return { success: true, data: [], fields: [] };
      });

      const store = useCategorySpendingStore();
      await store.fetch();

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('clears error before fetching', async () => {
      vi.mocked(reportApi.getCategorySpending).mockRejectedValueOnce(new Error('first error'));
      const store = useCategorySpendingStore();
      await store.fetch().catch(() => {});

      vi.mocked(reportApi.getCategorySpending).mockResolvedValue({
        success: true,
        data: [],
        fields: [],
      });
      await store.fetch();

      expect(store.error).toBeNull();
    });

    it('sets error message on failure', async () => {
      vi.mocked(reportApi.getCategorySpending).mockRejectedValue(new Error('Network error'));

      const store = useCategorySpendingStore();
      await store.fetch().catch(() => {});

      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });

    it('re-throws the error on failure', async () => {
      vi.mocked(reportApi.getCategorySpending).mockRejectedValue(new Error('Server error'));

      const store = useCategorySpendingStore();

      await expect(store.fetch()).rejects.toThrow('Server error');
    });

    it('uses fallback message for non-Error failures', async () => {
      vi.mocked(reportApi.getCategorySpending).mockRejectedValue('string error');

      const store = useCategorySpendingStore();
      await store.fetch().catch(() => {});

      expect(store.error).toBe('Failed to load category spending data');
    });
  });
});
