import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildBudget } from '../../test/factories/budgetFactory';

const mockGetAll = vi.fn();
vi.mock('./budgetApi', () => ({
  budgetApi: { getAll: (...args: unknown[]) => mockGetAll(...args) },
}));

import { useCurrentAndPastBudgets } from './useCurrentAndPastBudgets';

/**
 * These tests assume budgets arrive sorted by start_date descending (newest first),
 * matching the backend's BudgetsController#index order. The composable relies on this
 * to identify the "current" budget as the last open element in the array.
 * If the backend sort order changes, both the composable and these tests must be updated.
 */
describe('useCurrentAndPastBudgets', () => {
  beforeEach(() => {
    mockGetAll.mockReset();
  });

  function setup() {
    return useCurrentAndPastBudgets();
  }

  describe('currentAndPastBudgets', () => {
    it('returns empty array when no budgets loaded', () => {
      const { currentAndPastBudgets } = setup();
      expect(currentAndPastBudgets.value).toEqual([]);
    });

    it('puts the current (last open) budget first, followed by closed budgets', () => {
      const open1 = buildBudget({ id: 1, name: 'Mar 2026', status: 'open' });
      const open2 = buildBudget({ id: 2, name: 'Feb 2026', status: 'open' });
      const closed1 = buildBudget({ id: 3, name: 'Jan 2026', status: 'closed' });
      const closed2 = buildBudget({ id: 4, name: 'Dec 2025', status: 'closed' });

      const { budgets, currentAndPastBudgets } = setup();
      // API returns sorted by start_date desc, so open1 is newest, open2 is the "current" (last open)
      budgets.value = [open1, open2, closed1, closed2];

      expect(currentAndPastBudgets.value).toEqual([open2, closed1, closed2]);
    });

    it('returns only closed budgets when none are open', () => {
      const closed1 = buildBudget({ id: 1, name: 'Jan 2026', status: 'closed' });
      const closed2 = buildBudget({ id: 2, name: 'Dec 2025', status: 'closed' });

      const { budgets, currentAndPastBudgets } = setup();
      budgets.value = [closed1, closed2];

      expect(currentAndPastBudgets.value).toEqual([closed1, closed2]);
    });

    it('returns only the current budget when there are no closed budgets', () => {
      const open = buildBudget({ id: 1, name: 'Mar 2026', status: 'open' });

      const { budgets, currentAndPastBudgets } = setup();
      budgets.value = [open];

      expect(currentAndPastBudgets.value).toEqual([open]);
    });

    it('excludes non-open, non-closed budgets (e.g. pending)', () => {
      const open = buildBudget({ id: 1, name: 'Mar 2026', status: 'open' });
      const pending = buildBudget({ id: 2, name: 'Apr 2026', status: 'pending' });

      const { budgets, currentAndPastBudgets } = setup();
      budgets.value = [pending, open];

      expect(currentAndPastBudgets.value).toEqual([open]);
    });
  });

  describe('fetchBudgets', () => {
    it('populates budgets from the API', async () => {
      const budget = buildBudget({ id: 1, name: 'Mar 2026', status: 'open' });
      mockGetAll.mockResolvedValue([budget]);

      const { budgets, fetchBudgets } = setup();
      await fetchBudgets();

      expect(budgets.value).toEqual([budget]);
      expect(mockGetAll).toHaveBeenCalledOnce();
    });

    it('propagates API errors', async () => {
      mockGetAll.mockRejectedValue(new Error('Network error'));

      const { fetchBudgets } = setup();
      await expect(fetchBudgets()).rejects.toThrow('Network error');
    });
  });
});
