import { describe, it, expect } from 'vitest';
import { computed, ref } from 'vue';
import { useSpecialEventAllocationRows } from './useSpecialEventAllocationRows';
import { buildSpecialEventAllocation } from '../../test/factories';
import type { SpecialEventAllocationData } from './specialEvent.types';

const augustFood = buildSpecialEventAllocation({
  id: 3,
  name: 'Food',
  amount: 10000,
  spent: 8000,
  budget_name: 'Aug 2024',
  budget_start_date: '2024-07-25',
  allocation_category_name: 'Groceries',
});

const julyFood = buildSpecialEventAllocation({
  id: 2,
  name: 'Food',
  amount: 5000,
  spent: 4000,
  budget_name: 'Jul 2024',
  budget_start_date: '2024-06-25',
  allocation_category_name: 'Groceries',
});

const sepFood = buildSpecialEventAllocation({
  id: 9,
  name: 'Food',
  amount: 2000,
  spent: 1000,
  budget_name: 'Sep 2024',
  budget_start_date: '2024-08-25',
  allocation_category_name: 'Dining',
});

const hotel = buildSpecialEventAllocation({
  id: 4,
  name: 'Hotel',
  amount: 30000,
  spent: 25000,
  budget_name: 'Aug 2024',
  budget_start_date: '2024-07-25',
  allocation_category_name: 'Travel',
});

function setup({
  allocations = [augustFood, hotel, julyFood],
}: { allocations?: SpecialEventAllocationData[] } = {}) {
  const source = ref(allocations);
  return {
    source,
    ...useSpecialEventAllocationRows(computed(() => source.value)),
  };
}

describe('useSpecialEventAllocationRows', () => {
  describe('summed mode (default)', () => {
    it('defaults to summed', () => {
      const { isSummed } = setup();

      expect(isSummed.value).toBe(true);
    });

    it('merges allocations with the same name into one row', () => {
      const { rows } = setup();

      expect(rows.value).toHaveLength(2);
      expect(rows.value.map((row) => row.name)).toEqual(['Food', 'Hotel']);
    });

    it('sums amount and spent', () => {
      const { rows } = setup();

      expect(rows.value[0].amount).toBe(15000);
      expect(rows.value[0].spent).toBe(12000);
    });

    it('carries all ids, oldest budget first', () => {
      const { rows } = setup();

      expect(rows.value[0].ids).toEqual([2, 3]);
    });

    it('joins budget names, oldest budget first', () => {
      const { rows } = setup();

      expect(rows.value[0].budget_name).toBe('Jul 2024, Aug 2024');
    });

    it('builds a composite key from the ids', () => {
      const { rows } = setup();

      expect(rows.value[0].key).toBe('2-3');
    });

    it('supports more than two periods', () => {
      const { rows } = setup({ allocations: [sepFood, augustFood, julyFood] });

      expect(rows.value).toHaveLength(1);
      expect(rows.value[0].ids).toEqual([2, 3, 9]);
      expect(rows.value[0].budget_name).toBe('Jul 2024, Aug 2024, Sep 2024');
      expect(rows.value[0].amount).toBe(17000);
      expect(rows.value[0].spent).toBe(13000);
    });

    it('keeps a name present in one period as a single-id row', () => {
      const { rows } = setup();

      expect(rows.value[1]).toMatchObject({
        key: '4',
        ids: [4],
        name: 'Hotel',
        budget_name: 'Aug 2024',
        amount: 30000,
        spent: 25000,
      });
    });

    it('lists distinct category names once', () => {
      const { rows } = setup({ allocations: [sepFood, augustFood, julyFood] });

      expect(rows.value[0].allocation_category_name).toBe('Dining, Groceries');
    });

    it('builds dialog allocations ordered by budget start date with budget labels', () => {
      const { rows } = setup();

      expect(rows.value[0].dialogAllocations).toEqual([
        { id: 2, name: 'Food', label: 'Jul 2024' },
        { id: 3, name: 'Food', label: 'Aug 2024' },
      ]);
    });

    it('treats a missing start date as newest', () => {
      const undated = buildSpecialEventAllocation({
        id: 7,
        name: 'Food',
        budget_name: 'Undated',
        budget_start_date: undefined,
      });
      const { rows } = setup({ allocations: [undated, julyFood] });

      expect(rows.value[0].ids).toEqual([2, 7]);
    });

    it('keeps the given order when budgets share a start date', () => {
      const twin = buildSpecialEventAllocation({
        id: 6,
        name: 'Food',
        budget_name: 'Aug 2024 (copy)',
        budget_start_date: '2024-07-25',
      });
      const { rows } = setup({ allocations: [twin, augustFood] });

      expect(rows.value[0].ids).toEqual([6, 3]);
    });

    it('treats missing amount, spent and names as zero or empty', () => {
      const bare = buildSpecialEventAllocation({
        id: 8,
        name: undefined,
        amount: undefined,
        spent: undefined,
        budget_name: undefined,
        allocation_category_name: undefined,
        budget_start_date: undefined,
      });
      const { rows } = setup({ allocations: [bare] });

      expect(rows.value[0]).toMatchObject({
        name: '',
        amount: 0,
        spent: 0,
        budget_name: '',
        allocation_category_name: '',
      });
    });

    it('omits allocations without an id from ids but still counts their amounts', () => {
      const noId = buildSpecialEventAllocation({ id: undefined, name: 'Misc', amount: 100 });
      const { rows } = setup({ allocations: [noId] });

      expect(rows.value[0].ids).toEqual([]);
      expect(rows.value[0].dialogAllocations).toEqual([]);
      expect(rows.value[0].amount).toBe(100);
    });

    it('falls back to a name based key when no ids exist', () => {
      const noId = buildSpecialEventAllocation({ id: undefined, name: 'Misc' });
      const { rows } = setup({ allocations: [noId] });

      expect(rows.value[0].key).toBe('name-Misc');
    });
  });

  describe('by budget mode', () => {
    it('lists one row per allocation in the given order', () => {
      const { rows, toggleSummed } = setup();

      toggleSummed();

      expect(rows.value.map((row) => row.ids)).toEqual([[3], [4], [2]]);
    });

    it('keeps each allocation values and budget name', () => {
      const { rows, toggleSummed } = setup();

      toggleSummed();

      expect(rows.value[0]).toMatchObject({
        key: '3',
        name: 'Food',
        budget_name: 'Aug 2024',
        amount: 10000,
        spent: 8000,
        dialogAllocations: [{ id: 3, name: 'Food', label: 'Aug 2024' }],
      });
    });

    it('toggles back to summed', () => {
      const { isSummed, toggleSummed } = setup();

      toggleSummed();
      expect(isSummed.value).toBe(false);

      toggleSummed();
      expect(isSummed.value).toBe(true);
    });
  });

  describe('totalSpent', () => {
    it('is the same in both modes', () => {
      const { totalSpent, toggleSummed } = setup();

      expect(totalSpent.value).toBe(37000);

      toggleSummed();

      expect(totalSpent.value).toBe(37000);
    });
  });

  it('reacts to allocation changes', () => {
    const { source, rows } = setup({ allocations: [augustFood] });
    expect(rows.value).toHaveLength(1);

    source.value = [augustFood, julyFood];

    expect(rows.value).toHaveLength(1);
    expect(rows.value[0].ids).toEqual([2, 3]);
  });
});
