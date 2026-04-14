import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBudgetSummary } from './useBudgetSummary';
import { useBudgetStore } from './budgetStore';
import { useSettingsStore } from '../settings/settingsStore';
import {
  buildBudgetDetail,
  buildIncome,
  buildAllocation,
  buildSettings,
} from '../../test/factories';

describe('useBudgetSummary', () => {
  let budgetStore: ReturnType<typeof useBudgetStore>;
  let settingsStore: ReturnType<typeof useSettingsStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    budgetStore = useBudgetStore();
    settingsStore = useSettingsStore();
  });

  describe('totalIncome', () => {
    it('sums income amounts for the active budget', () => {
      budgetStore.budget = buildBudgetDetail({
        incomes: [
          buildIncome({ id: 1, name: 'Salary', amount: 300000 }),
          buildIncome({ id: 2, name: 'Bonus', amount: 50000 }),
        ],
      });

      const { totalIncome } = useBudgetSummary();

      expect(totalIncome.value).toBe(350000);
    });

    it('excludes incomes marked deleted', () => {
      budgetStore.budget = buildBudgetDetail({
        incomes: [
          buildIncome({ id: 1, name: 'Salary', amount: 300000 }),
          buildIncome({ id: 2, name: 'Old job', amount: 50000, deleted: true }),
        ],
      });

      const { totalIncome } = useBudgetSummary();

      expect(totalIncome.value).toBe(300000);
    });

    it('returns 0 when no budget is loaded', () => {
      budgetStore.budget = null;

      const { totalIncome } = useBudgetSummary();

      expect(totalIncome.value).toBe(0);
    });
  });

  describe('totalAllocations', () => {
    it('sums allocation amounts', () => {
      budgetStore.budget = buildBudgetDetail({
        allocations: [
          buildAllocation({ id: 1, amount: 100000 }),
          buildAllocation({ id: 2, amount: 40000 }),
        ],
      });

      const { totalAllocations } = useBudgetSummary();

      expect(totalAllocations.value).toBe(140000);
    });

    it('excludes allocations marked deleted', () => {
      budgetStore.budget = buildBudgetDetail({
        allocations: [
          buildAllocation({ id: 1, amount: 100000 }),
          buildAllocation({ id: 2, amount: 40000, deleted: true }),
        ],
      });

      const { totalAllocations } = useBudgetSummary();

      expect(totalAllocations.value).toBe(100000);
    });
  });

  describe('discretionaryTotal', () => {
    it('is income minus allocations', () => {
      budgetStore.budget = buildBudgetDetail({
        incomes: [buildIncome({ amount: 300000 })],
        allocations: [buildAllocation({ amount: 100000 })],
      });

      const { discretionaryTotal } = useBudgetSummary();

      expect(discretionaryTotal.value).toBe(200000);
    });

    it('can go negative when allocations exceed income', () => {
      budgetStore.budget = buildBudgetDetail({
        incomes: [buildIncome({ amount: 100000 })],
        allocations: [buildAllocation({ amount: 150000 })],
      });

      const { discretionaryTotal } = useBudgetSummary();

      expect(discretionaryTotal.value).toBe(-50000);
    });
  });

  describe('perPersonAmount', () => {
    it('divides discretionary by 2 for couple family type', () => {
      budgetStore.budget = buildBudgetDetail({
        incomes: [buildIncome({ amount: 300000 })],
        allocations: [buildAllocation({ amount: 100000 })],
      });
      settingsStore.settings = buildSettings({ family_type: 'couple' });

      const { perPersonAmount } = useBudgetSummary();

      expect(perPersonAmount.value).toBe(100000);
    });

    it('uses the full discretionary amount for single family type', () => {
      budgetStore.budget = buildBudgetDetail({
        incomes: [buildIncome({ amount: 300000 })],
        allocations: [buildAllocation({ amount: 100000 })],
      });
      settingsStore.settings = buildSettings({ family_type: 'single' });

      const { perPersonAmount } = useBudgetSummary();

      expect(perPersonAmount.value).toBe(200000);
    });

    it('floors the couple division (no fractional cents per person)', () => {
      budgetStore.budget = buildBudgetDetail({
        incomes: [buildIncome({ amount: 100001 })],
        allocations: [buildAllocation({ amount: 0 })],
      });
      settingsStore.settings = buildSettings({ family_type: 'couple' });

      const { perPersonAmount } = useBudgetSummary();

      expect(perPersonAmount.value).toBe(50000);
    });
  });

  describe('discretionaryLabel', () => {
    it('renders "Wife / Husband" for couple family type', () => {
      budgetStore.budget = buildBudgetDetail();
      settingsStore.settings = buildSettings({
        family_type: 'couple',
        wife: 'Alice',
        husband: 'Bob',
      });

      const { discretionaryLabel } = useBudgetSummary();

      expect(discretionaryLabel.value).toBe('Alice / Bob');
    });

    it('renders "<Name>\'s Discretionary" for single family type', () => {
      budgetStore.budget = buildBudgetDetail();
      settingsStore.settings = buildSettings({
        family_type: 'single',
        single_person: 'Alex',
      });

      const { discretionaryLabel } = useBudgetSummary();

      expect(discretionaryLabel.value).toBe("Alex's Discretionary");
    });
  });
});
