import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBudgetListStore } from './budgetListStore';
import { budgetApi } from './budgetApi';
import type { BudgetData } from './budget.types';

vi.mock('./budgetApi', () => ({
  budgetApi: {
    getAll: vi.fn(),
    copy: vi.fn(),
    close: vi.fn(),
    reopenLast: vi.fn(),
    create: vi.fn(),
  },
}));

function makeBudget(overrides: Partial<BudgetData> = {}): BudgetData {
  return { id: 1, name: 'Jan 2025', start_date: '2025-01-01', end_date: '2025-01-31', status: 'open', ...overrides };
}

describe('budgetListStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  describe('fetchAll', () => {
    it('loads budgets from the API', async () => {
      const budgets = [makeBudget({ id: 1 }), makeBudget({ id: 2, name: 'Feb 2025' })];
      vi.mocked(budgetApi.getAll).mockResolvedValue(budgets);

      const store = useBudgetListStore();
      await store.fetchAll();

      expect(store.budgets).toEqual(budgets);
    });

    it('sets loading to true during fetch', async () => {
      let resolvePromise!: (value: BudgetData[]) => void;
      vi.mocked(budgetApi.getAll).mockReturnValue(new Promise((r) => { resolvePromise = r; }));

      const store = useBudgetListStore();
      const promise = store.fetchAll();

      expect(store.loading).toBe(true);

      resolvePromise([]);
      await promise;

      expect(store.loading).toBe(false);
    });

    it('sets error and re-throws on failure', async () => {
      vi.mocked(budgetApi.getAll).mockRejectedValue(new Error('network'));

      const store = useBudgetListStore();

      await expect(store.fetchAll()).rejects.toThrow('network');
      expect(store.error).toBe('Failed to load budgets');
      expect(store.loading).toBe(false);
    });
  });

  describe('canCopy', () => {
    it('returns true for the first budget in the list', async () => {
      const budgets = [makeBudget({ id: 1 }), makeBudget({ id: 2 })];
      vi.mocked(budgetApi.getAll).mockResolvedValue(budgets);

      const store = useBudgetListStore();
      await store.fetchAll();

      expect(store.canCopy(budgets[0])).toBe(true);
    });

    it('returns false for non-first budgets', async () => {
      const budgets = [makeBudget({ id: 1 }), makeBudget({ id: 2 })];
      vi.mocked(budgetApi.getAll).mockResolvedValue(budgets);

      const store = useBudgetListStore();
      await store.fetchAll();

      expect(store.canCopy(budgets[1])).toBe(false);
    });
  });

  describe('canClose', () => {
    it('returns true for the last open budget', async () => {
      const budgets = [
        makeBudget({ id: 1, status: 'open' }),
        makeBudget({ id: 2, status: 'open' }),
        makeBudget({ id: 3, status: 'closed' }),
      ];
      vi.mocked(budgetApi.getAll).mockResolvedValue(budgets);

      const store = useBudgetListStore();
      await store.fetchAll();

      expect(store.canClose(budgets[1])).toBe(true);
    });

    it('returns false for non-last open budgets', async () => {
      const budgets = [
        makeBudget({ id: 1, status: 'open' }),
        makeBudget({ id: 2, status: 'open' }),
      ];
      vi.mocked(budgetApi.getAll).mockResolvedValue(budgets);

      const store = useBudgetListStore();
      await store.fetchAll();

      expect(store.canClose(budgets[0])).toBe(false);
    });

    it('returns false for closed budgets', async () => {
      const budgets = [
        makeBudget({ id: 1, status: 'open' }),
        makeBudget({ id: 2, status: 'closed' }),
      ];
      vi.mocked(budgetApi.getAll).mockResolvedValue(budgets);

      const store = useBudgetListStore();
      await store.fetchAll();

      expect(store.canClose(budgets[1])).toBe(false);
    });

    it('returns false when there are no open budgets', async () => {
      const budgets = [makeBudget({ id: 1, status: 'closed' })];
      vi.mocked(budgetApi.getAll).mockResolvedValue(budgets);

      const store = useBudgetListStore();
      await store.fetchAll();

      expect(store.canClose(budgets[0])).toBe(false);
    });
  });

  describe('copyBudget', () => {
    it('calls the API and refreshes the list', async () => {
      vi.mocked(budgetApi.copy).mockResolvedValue(undefined);
      vi.mocked(budgetApi.getAll).mockResolvedValue([]);

      const store = useBudgetListStore();
      await store.copyBudget(5);

      expect(budgetApi.copy).toHaveBeenCalledWith(5);
      expect(budgetApi.getAll).toHaveBeenCalled();
    });

    it('sets error and re-throws on failure', async () => {
      vi.mocked(budgetApi.copy).mockRejectedValue(new Error('fail'));

      const store = useBudgetListStore();

      await expect(store.copyBudget(5)).rejects.toThrow('fail');
      expect(store.error).toBe('Failed to copy budget');
    });
  });

  describe('closeBudget', () => {
    it('calls the API and refreshes the list', async () => {
      vi.mocked(budgetApi.close).mockResolvedValue(undefined);
      vi.mocked(budgetApi.getAll).mockResolvedValue([]);

      const store = useBudgetListStore();
      await store.closeBudget(5);

      expect(budgetApi.close).toHaveBeenCalledWith(5);
      expect(budgetApi.getAll).toHaveBeenCalled();
    });

    it('sets error and re-throws on failure', async () => {
      vi.mocked(budgetApi.close).mockRejectedValue(new Error('fail'));

      const store = useBudgetListStore();

      await expect(store.closeBudget(5)).rejects.toThrow('fail');
      expect(store.error).toBe('Failed to close budget');
    });
  });

  describe('reopenLastBudget', () => {
    it('calls the API and refreshes the list', async () => {
      vi.mocked(budgetApi.reopenLast).mockResolvedValue(undefined);
      vi.mocked(budgetApi.getAll).mockResolvedValue([]);

      const store = useBudgetListStore();
      await store.reopenLastBudget();

      expect(budgetApi.reopenLast).toHaveBeenCalled();
      expect(budgetApi.getAll).toHaveBeenCalled();
    });

    it('sets error and re-throws on failure', async () => {
      vi.mocked(budgetApi.reopenLast).mockRejectedValue(new Error('fail'));

      const store = useBudgetListStore();

      await expect(store.reopenLastBudget()).rejects.toThrow('fail');
      expect(store.error).toBe('Failed to reopen budget');
    });
  });

  describe('addBudget', () => {
    it('creates a budget and refreshes the list', async () => {
      vi.mocked(budgetApi.create).mockResolvedValue(makeBudget());
      vi.mocked(budgetApi.getAll).mockResolvedValue([]);

      const store = useBudgetListStore();
      await store.addBudget('2025-03-01');

      expect(budgetApi.create).toHaveBeenCalledWith({ start_date: '2025-03-01' });
      expect(budgetApi.getAll).toHaveBeenCalled();
    });

    it('sets error and re-throws on failure', async () => {
      vi.mocked(budgetApi.create).mockRejectedValue(new Error('fail'));

      const store = useBudgetListStore();

      await expect(store.addBudget('2025-03-01')).rejects.toThrow('fail');
      expect(store.error).toBe('Failed to create budget');
    });
  });
});
