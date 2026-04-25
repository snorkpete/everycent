import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBudgetListStore } from './budgetListStore';
import { budgetApi } from './budgetApi';
import { buildBudget } from '../../test/factories';
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

describe('budgetListStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  describe('fetchAll', () => {
    it('loads budgets from the API', async () => {
      const budgets = [buildBudget({ id: 1 }), buildBudget({ id: 2, name: 'Feb 2025' })];
      vi.mocked(budgetApi.getAll).mockResolvedValue(budgets);

      const store = useBudgetListStore();
      await store.fetchAll();

      expect(store.budgets).toEqual(budgets);
    });

    it('sets loading to true during fetch', async () => {
      let resolvePromise!: (value: BudgetData[]) => void;
      vi.mocked(budgetApi.getAll).mockReturnValue(
        new Promise((r) => {
          resolvePromise = r;
        }),
      );

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
      expect(store.error).toBe('network');
      expect(store.loading).toBe(false);
    });
  });

  describe('canCopy', () => {
    it('returns true for the first budget in the list', async () => {
      const first = buildBudget({ id: 1 });
      const second = buildBudget({ id: 2 });
      vi.mocked(budgetApi.getAll).mockResolvedValue([first, second]);

      const store = useBudgetListStore();
      await store.fetchAll();

      expect(store.canCopy(first)).toBe(true);
    });

    it('returns false for non-first budgets', async () => {
      const first = buildBudget({ id: 1 });
      const second = buildBudget({ id: 2 });
      vi.mocked(budgetApi.getAll).mockResolvedValue([first, second]);

      const store = useBudgetListStore();
      await store.fetchAll();

      expect(store.canCopy(second)).toBe(false);
    });
  });

  describe('canClose', () => {
    it('returns true for the last open budget', async () => {
      const open1 = buildBudget({ id: 1, status: 'open' });
      const open2 = buildBudget({ id: 2, status: 'open' });
      const closed = buildBudget({ id: 3, status: 'closed' });
      vi.mocked(budgetApi.getAll).mockResolvedValue([open1, open2, closed]);

      const store = useBudgetListStore();
      await store.fetchAll();

      expect(store.canClose(open2)).toBe(true);
    });

    it('returns false for non-last open budgets', async () => {
      const open1 = buildBudget({ id: 1, status: 'open' });
      const open2 = buildBudget({ id: 2, status: 'open' });
      vi.mocked(budgetApi.getAll).mockResolvedValue([open1, open2]);

      const store = useBudgetListStore();
      await store.fetchAll();

      expect(store.canClose(open1)).toBe(false);
    });

    it('returns false for closed budgets', async () => {
      const open1 = buildBudget({ id: 1, status: 'open' });
      const closed = buildBudget({ id: 2, status: 'closed' });
      vi.mocked(budgetApi.getAll).mockResolvedValue([open1, closed]);

      const store = useBudgetListStore();
      await store.fetchAll();

      expect(store.canClose(closed)).toBe(false);
    });

    it('returns false when there are no open budgets', async () => {
      const closed = buildBudget({ id: 1, status: 'closed' });
      vi.mocked(budgetApi.getAll).mockResolvedValue([closed]);

      const store = useBudgetListStore();
      await store.fetchAll();

      expect(store.canClose(closed)).toBe(false);
    });
  });

  describe('copyBudget', () => {
    it('calls the API and refreshes the list', async () => {
      vi.mocked(budgetApi.copy).mockResolvedValue(buildBudget());
      vi.mocked(budgetApi.getAll).mockResolvedValue([]);

      const store = useBudgetListStore();
      await store.copyBudget(5);

      expect(budgetApi.copy).toHaveBeenCalledWith(5);
      expect(budgetApi.getAll).toHaveBeenCalled();
    });

    it('sets loading during the operation', async () => {
      let resolveCopy!: (value: BudgetData) => void;
      vi.mocked(budgetApi.copy).mockReturnValue(
        new Promise((r) => {
          resolveCopy = r;
        }),
      );
      vi.mocked(budgetApi.getAll).mockResolvedValue([]);

      const store = useBudgetListStore();
      const promise = store.copyBudget(5);

      expect(store.loading).toBe(true);

      resolveCopy(buildBudget());
      await promise;

      expect(store.loading).toBe(false);
    });

    it('sets error, resets loading, and re-throws on failure', async () => {
      vi.mocked(budgetApi.copy).mockRejectedValue(new Error('fail'));

      const store = useBudgetListStore();

      await expect(store.copyBudget(5)).rejects.toThrow('fail');
      expect(store.error).toBe('fail');
      expect(store.loading).toBe(false);
    });
  });

  describe('closeBudget', () => {
    it('calls the API and refreshes the list', async () => {
      vi.mocked(budgetApi.close).mockResolvedValue(buildBudget());
      vi.mocked(budgetApi.getAll).mockResolvedValue([]);

      const store = useBudgetListStore();
      await store.closeBudget(5);

      expect(budgetApi.close).toHaveBeenCalledWith(5);
      expect(budgetApi.getAll).toHaveBeenCalled();
    });

    it('sets loading during the operation', async () => {
      let resolveClose!: (value: BudgetData) => void;
      vi.mocked(budgetApi.close).mockReturnValue(
        new Promise((r) => {
          resolveClose = r;
        }),
      );
      vi.mocked(budgetApi.getAll).mockResolvedValue([]);

      const store = useBudgetListStore();
      const promise = store.closeBudget(5);

      expect(store.loading).toBe(true);

      resolveClose(buildBudget());
      await promise;

      expect(store.loading).toBe(false);
    });

    it('sets error, resets loading, and re-throws on failure', async () => {
      vi.mocked(budgetApi.close).mockRejectedValue(new Error('fail'));

      const store = useBudgetListStore();

      await expect(store.closeBudget(5)).rejects.toThrow('fail');
      expect(store.error).toBe('fail');
      expect(store.loading).toBe(false);
    });
  });

  describe('reopenLastBudget', () => {
    it('calls the API and refreshes the list', async () => {
      vi.mocked(budgetApi.reopenLast).mockResolvedValue(buildBudget());
      vi.mocked(budgetApi.getAll).mockResolvedValue([]);

      const store = useBudgetListStore();
      await store.reopenLastBudget();

      expect(budgetApi.reopenLast).toHaveBeenCalled();
      expect(budgetApi.getAll).toHaveBeenCalled();
    });

    it('sets loading during the operation', async () => {
      let resolveReopen!: (value: BudgetData) => void;
      vi.mocked(budgetApi.reopenLast).mockReturnValue(
        new Promise((r) => {
          resolveReopen = r;
        }),
      );
      vi.mocked(budgetApi.getAll).mockResolvedValue([]);

      const store = useBudgetListStore();
      const promise = store.reopenLastBudget();

      expect(store.loading).toBe(true);

      resolveReopen(buildBudget());
      await promise;

      expect(store.loading).toBe(false);
    });

    it('sets error, resets loading, and re-throws on failure', async () => {
      vi.mocked(budgetApi.reopenLast).mockRejectedValue(new Error('fail'));

      const store = useBudgetListStore();

      await expect(store.reopenLastBudget()).rejects.toThrow('fail');
      expect(store.error).toBe('fail');
      expect(store.loading).toBe(false);
    });
  });

  describe('addBudget', () => {
    it('creates a budget and refreshes the list', async () => {
      vi.mocked(budgetApi.create).mockResolvedValue(buildBudget());
      vi.mocked(budgetApi.getAll).mockResolvedValue([]);

      const store = useBudgetListStore();
      await store.addBudget('2025-03-01');

      expect(budgetApi.create).toHaveBeenCalledWith({ start_date: '2025-03-01' });
      expect(budgetApi.getAll).toHaveBeenCalled();
    });

    it('sets loading during the operation', async () => {
      let resolveCreate!: (value: BudgetData) => void;
      vi.mocked(budgetApi.create).mockReturnValue(
        new Promise((r) => {
          resolveCreate = r;
        }),
      );
      vi.mocked(budgetApi.getAll).mockResolvedValue([]);

      const store = useBudgetListStore();
      const promise = store.addBudget('2025-03-01');

      expect(store.loading).toBe(true);

      resolveCreate(buildBudget());
      await promise;

      expect(store.loading).toBe(false);
    });

    it('sets error, resets loading, and re-throws on failure', async () => {
      vi.mocked(budgetApi.create).mockRejectedValue(new Error('fail'));

      const store = useBudgetListStore();

      await expect(store.addBudget('2025-03-01')).rejects.toThrow('fail');
      expect(store.error).toBe('fail');
      expect(store.loading).toBe(false);
    });
  });
});
