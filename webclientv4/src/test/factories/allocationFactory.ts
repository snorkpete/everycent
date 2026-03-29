import type { AllocationData } from '../../app/transactions/transaction.types';
import type { AllocationCategoryData } from '../../app/allocation-categories/allocationCategory.types';

export function buildAllocationCategory(
  overrides?: Partial<AllocationCategoryData>,
): AllocationCategoryData {
  return {
    id: 1,
    name: 'Living',
    ...overrides,
  };
}

export function buildAllocation(overrides?: Partial<AllocationData>): AllocationData {
  return {
    id: 1,
    name: 'Groceries',
    amount: 50000,
    budget_id: 1,
    spent: 0,
    allocation_category_id: 1,
    is_standing_order: false,
    is_fixed_amount: true,
    deleted: false,
    ...overrides,
  };
}

export function buildVariableAllocation(overrides?: Partial<AllocationData>): AllocationData {
  return buildAllocation({
    id: 2,
    name: 'Entertainment',
    amount: 20000,
    is_fixed_amount: false,
    ...overrides,
  });
}
