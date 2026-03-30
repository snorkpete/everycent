import { describe, it, expect } from 'vitest';
import { ref, type Ref } from 'vue';
import { useWantsNeedsBudgetBreakdown } from './useWantsNeedsBudgetBreakdown';
import type { AllocationData } from '../transactions/transaction.types';

function setup({
  allocations = [] as AllocationData[],
  totalIncome = 0,
} = {}): ReturnType<typeof useWantsNeedsBudgetBreakdown> & {
  allocationsRef: Ref<AllocationData[]>;
  totalIncomeRef: Ref<number>;
} {
  const allocationsRef = ref(allocations) as Ref<AllocationData[]>;
  const totalIncomeRef = ref(totalIncome);
  const result = useWantsNeedsBudgetBreakdown(allocationsRef, totalIncomeRef);
  return { ...result, allocationsRef, totalIncomeRef };
}

describe('useWantsNeedsBudgetBreakdown', () => {
  describe('amounts', () => {
    it('sums needs allocations', () => {
      const { needsAmount } = setup({
        allocations: [
          { id: 1, name: 'Rent', amount: 200000, allocation_class: 'need' },
          { id: 2, name: 'Groceries', amount: 50000, allocation_class: 'need' },
        ],
        totalIncome: 600000,
      });

      expect(needsAmount.value).toBe(250000);
    });

    it('sums savings allocations', () => {
      const { savingsAmount } = setup({
        allocations: [{ id: 1, name: 'Retirement', amount: 100000, allocation_class: 'savings' }],
        totalIncome: 600000,
      });

      expect(savingsAmount.value).toBe(100000);
    });

    it('computes wants as totalIncome minus needs minus savings', () => {
      const { wantsAmount } = setup({
        allocations: [
          { id: 1, name: 'Rent', amount: 200000, allocation_class: 'need' },
          { id: 2, name: 'Retirement', amount: 100000, allocation_class: 'savings' },
          { id: 3, name: 'Fun', amount: 30000, allocation_class: 'want' },
        ],
        totalIncome: 600000,
      });

      // 600000 - 200000 - 100000 = 300000
      expect(wantsAmount.value).toBe(300000);
    });

    it('treats allocations with no allocation_class as wants', () => {
      const { needsAmount, savingsAmount, wantsAmount } = setup({
        allocations: [{ id: 1, name: 'Misc', amount: 50000 }],
        totalIncome: 100000,
      });

      expect(needsAmount.value).toBe(0);
      expect(savingsAmount.value).toBe(0);
      expect(wantsAmount.value).toBe(100000);
    });

    it('returns zero amounts for empty allocations', () => {
      const { needsAmount, savingsAmount, wantsAmount } = setup();

      expect(needsAmount.value).toBe(0);
      expect(savingsAmount.value).toBe(0);
      expect(wantsAmount.value).toBe(0);
    });
  });

  describe('percentages', () => {
    it('computes needs percentage rounded', () => {
      const { needsPercentage } = setup({
        allocations: [{ id: 1, name: 'Rent', amount: 250000, allocation_class: 'need' }],
        totalIncome: 600000,
      });

      // round(250000/600000 * 100) = 42
      expect(needsPercentage.value).toBe(42);
    });

    it('computes savings percentage rounded', () => {
      const { savingsPercentage } = setup({
        allocations: [{ id: 1, name: 'Retirement', amount: 100000, allocation_class: 'savings' }],
        totalIncome: 600000,
      });

      // round(100000/600000 * 100) = 17
      expect(savingsPercentage.value).toBe(17);
    });

    it('computes wants percentage as remainder to ensure they sum to 100', () => {
      const { needsPercentage, savingsPercentage, wantsPercentage } = setup({
        allocations: [
          { id: 1, name: 'Rent', amount: 250000, allocation_class: 'need' },
          { id: 2, name: 'Retirement', amount: 100000, allocation_class: 'savings' },
        ],
        totalIncome: 600000,
      });

      // 100 - 42 - 17 = 41
      expect(wantsPercentage.value).toBe(41);
      expect(needsPercentage.value + savingsPercentage.value + wantsPercentage.value).toBe(100);
    });

    it('returns 0 for all percentages when totalIncome is 0', () => {
      const { needsPercentage, savingsPercentage, wantsPercentage } = setup();

      expect(needsPercentage.value).toBe(0);
      expect(savingsPercentage.value).toBe(0);
      expect(wantsPercentage.value).toBe(0);
    });
  });

  describe('reactivity', () => {
    it('recomputes when allocations change', () => {
      const { needsAmount, allocationsRef } = setup({
        allocations: [{ id: 1, name: 'Rent', amount: 200000, allocation_class: 'need' }],
        totalIncome: 600000,
      });

      expect(needsAmount.value).toBe(200000);

      allocationsRef.value = [
        { id: 1, name: 'Rent', amount: 200000, allocation_class: 'need' },
        { id: 2, name: 'Groceries', amount: 80000, allocation_class: 'need' },
      ];

      expect(needsAmount.value).toBe(280000);
    });

    it('recomputes when totalIncome changes', () => {
      const { wantsPercentage, totalIncomeRef } = setup({
        allocations: [{ id: 1, name: 'Rent', amount: 50000, allocation_class: 'need' }],
        totalIncome: 100000,
      });

      expect(wantsPercentage.value).toBe(50);

      totalIncomeRef.value = 200000;

      expect(wantsPercentage.value).toBe(75);
    });
  });
});
