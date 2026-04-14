import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useNeedsVsWantsStore } from './needsVsWantsStore';
import { reportApi } from '../reportApi';

vi.mock('../reportApi', () => ({
  reportApi: {
    getNeedsVsWants: vi.fn(),
  },
}));

const mockRows = [
  {
    period: '2024-01',
    budgeted_needs: 200000,
    actual_needs: 195000,
    budgeted_wants: 100000,
    actual_wants: 110000,
    budgeted_savings: 50000,
    actual_savings: 45000,
    budgeted_needs_pct: 57,
    budgeted_wants_pct: 29,
    budgeted_savings_pct: 14,
    actual_needs_pct: 56,
    actual_wants_pct: 31,
    actual_savings_pct: 13,
  },
];

const mockFields = [
  { name: 'period', label: 'Period', numeric: false, class: 'all' },
  { name: 'budgeted_needs', label: 'Needs', numeric: true, class: 'budgeted' },
  { name: 'actual_needs', label: 'Needs', numeric: true, class: 'actual' },
];

describe('needsVsWantsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts with empty data and fields', () => {
      const store = useNeedsVsWantsStore();

      expect(store.data).toEqual([]);
      expect(store.fields).toEqual([]);
    });

    it('starts with loading false and no error', () => {
      const store = useNeedsVsWantsStore();

      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('fetch', () => {
    it('fetches and stores data and fields', async () => {
      vi.mocked(reportApi.getNeedsVsWants).mockResolvedValue({
        success: true,
        data: mockRows,
        fields: mockFields,
      });

      const store = useNeedsVsWantsStore();
      await store.fetch();

      expect(store.data).toEqual(mockRows);
      expect(store.fields).toEqual(mockFields);
    });

    it('sets loading to true during fetch and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(reportApi.getNeedsVsWants).mockImplementationOnce(async () => {
        loadingDuringCall = useNeedsVsWantsStore().loading;
        return { success: true, data: [], fields: [] };
      });

      const store = useNeedsVsWantsStore();
      await store.fetch();

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('clears error before fetching', async () => {
      vi.mocked(reportApi.getNeedsVsWants).mockRejectedValueOnce(new Error('first error'));
      const store = useNeedsVsWantsStore();
      await store.fetch().catch(() => {});

      vi.mocked(reportApi.getNeedsVsWants).mockResolvedValue({
        success: true,
        data: [],
        fields: [],
      });
      await store.fetch();

      expect(store.error).toBeNull();
    });

    it('sets error message on failure', async () => {
      vi.mocked(reportApi.getNeedsVsWants).mockRejectedValue(new Error('Network error'));

      const store = useNeedsVsWantsStore();
      await store.fetch().catch(() => {});

      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });

    it('re-throws the error on failure', async () => {
      vi.mocked(reportApi.getNeedsVsWants).mockRejectedValue(new Error('Server error'));

      const store = useNeedsVsWantsStore();

      await expect(store.fetch()).rejects.toThrow('Server error');
    });

    it('uses fallback message for non-Error failures', async () => {
      vi.mocked(reportApi.getNeedsVsWants).mockRejectedValue('string error');

      const store = useNeedsVsWantsStore();
      await store.fetch().catch(() => {});

      expect(store.error).toBe('Failed to load needs vs wants data');
    });
  });

  describe('ready computed', () => {
    it('returns true when not loading and no error', () => {
      const store = useNeedsVsWantsStore();

      expect(store.ready).toBe(true);
    });

    it('returns false when loading is true', async () => {
      let resolve!: (value: { success: boolean; data: never[]; fields: never[] }) => void;
      vi.mocked(reportApi.getNeedsVsWants).mockImplementation(
        () => new Promise((r) => (resolve = r)),
      );

      const store = useNeedsVsWantsStore();
      const fetchPromise = store.fetch();

      expect(store.ready).toBe(false);

      resolve({ success: true, data: [], fields: [] });
      await fetchPromise;
    });

    it('returns false when error is set', async () => {
      vi.mocked(reportApi.getNeedsVsWants).mockRejectedValue(new Error('failed'));

      const store = useNeedsVsWantsStore();
      await store.fetch().catch(() => {});

      expect(store.ready).toBe(false);
    });

    it('returns false when loading is true regardless of prior error state', async () => {
      let resolve!: (value: { success: boolean; data: never[]; fields: never[] }) => void;
      vi.mocked(reportApi.getNeedsVsWants).mockImplementation(
        () => new Promise((r) => (resolve = r)),
      );

      const store = useNeedsVsWantsStore();
      store.error = 'previous error';
      const fetchPromise = store.fetch();

      expect(store.ready).toBe(false);

      resolve({ success: true, data: [], fields: [] });
      await fetchPromise;
    });
  });
});
