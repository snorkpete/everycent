import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useNetWorthStore } from './netWorthStore';
import { reportApi } from '../reportApi';

vi.mock('../reportApi', () => ({
  reportApi: {
    getNetWorth: vi.fn(),
  },
}));

const mockRows = [
  { period: '2024-01', net_change: 5000, net_worth: 150000 },
  { period: '2024-02', net_change: -2000, net_worth: 148000 },
];

const mockFields = [
  { name: 'period', label: 'Period', numeric: false },
  { name: 'net_change', label: 'Net Change', numeric: true },
  { name: 'net_worth', label: 'Net Worth', numeric: true },
];

describe('netWorthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts with empty data and fields', () => {
      const store = useNetWorthStore();

      expect(store.data).toEqual([]);
      expect(store.fields).toEqual([]);
    });

    it('starts with loading false and no error', () => {
      const store = useNetWorthStore();

      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('fetch', () => {
    it('fetches and stores data and fields', async () => {
      vi.mocked(reportApi.getNetWorth).mockResolvedValue({
        success: true,
        data: mockRows,
        fields: mockFields,
      });

      const store = useNetWorthStore();
      await store.fetch();

      expect(store.data).toEqual(mockRows);
      expect(store.fields).toEqual(mockFields);
    });

    it('sets loading to true during fetch and false after', async () => {
      let loadingDuringCall = false;
      vi.mocked(reportApi.getNetWorth).mockImplementationOnce(async () => {
        loadingDuringCall = useNetWorthStore().loading;
        return { success: true, data: [], fields: [] };
      });

      const store = useNetWorthStore();
      await store.fetch();

      expect(loadingDuringCall).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('clears error before fetching', async () => {
      vi.mocked(reportApi.getNetWorth).mockRejectedValueOnce(new Error('first error'));
      const store = useNetWorthStore();
      await store.fetch().catch(() => {});

      vi.mocked(reportApi.getNetWorth).mockResolvedValue({
        success: true,
        data: [],
        fields: [],
      });
      await store.fetch();

      expect(store.error).toBeNull();
    });

    it('sets error message on failure', async () => {
      vi.mocked(reportApi.getNetWorth).mockRejectedValue(new Error('Network error'));

      const store = useNetWorthStore();
      await store.fetch().catch(() => {});

      expect(store.error).toBe('Network error');
      expect(store.loading).toBe(false);
    });

    it('re-throws the error on failure', async () => {
      vi.mocked(reportApi.getNetWorth).mockRejectedValue(new Error('Server error'));

      const store = useNetWorthStore();

      await expect(store.fetch()).rejects.toThrow('Server error');
    });

    it('uses fallback message for non-Error failures', async () => {
      vi.mocked(reportApi.getNetWorth).mockRejectedValue('string error');

      const store = useNetWorthStore();
      await store.fetch().catch(() => {});

      expect(store.error).toBe('Failed to load net worth data');
    });
  });

  describe('ready computed', () => {
    it('returns true when not loading and no error', () => {
      const store = useNetWorthStore();

      expect(store.ready).toBe(true);
    });

    it('returns false when loading is true', async () => {
      let resolve!: (value: { success: boolean; data: never[]; fields: never[] }) => void;
      vi.mocked(reportApi.getNetWorth).mockImplementation(
        () => new Promise((r) => (resolve = r)),
      );

      const store = useNetWorthStore();
      const fetchPromise = store.fetch();

      expect(store.ready).toBe(false);

      resolve({ success: true, data: [], fields: [] });
      await fetchPromise;
    });

    it('returns false when error is set', async () => {
      vi.mocked(reportApi.getNetWorth).mockRejectedValue(new Error('failed'));

      const store = useNetWorthStore();
      await store.fetch().catch(() => {});

      expect(store.ready).toBe(false);
    });

    it('returns false when loading is true regardless of prior error state', async () => {
      let resolve!: (value: { success: boolean; data: never[]; fields: never[] }) => void;
      vi.mocked(reportApi.getNetWorth).mockImplementation(
        () => new Promise((r) => (resolve = r)),
      );

      const store = useNetWorthStore();
      store.error = 'previous error';
      const fetchPromise = store.fetch();

      expect(store.ready).toBe(false);

      resolve({ success: true, data: [], fields: [] });
      await fetchPromise;
    });
  });
});
