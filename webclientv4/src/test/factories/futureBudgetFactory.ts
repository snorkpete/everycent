import type {
  FutureBudgetData,
  FutureAllocationData,
  FutureIncomeData,
} from '../../app/budgets/future-budgets/futureBudgets.types';

export function buildFutureIncome(overrides?: Partial<FutureIncomeData>): FutureIncomeData {
  return {
    id: 1,
    name: 'Salary',
    amount: 500000,
    budget_id: 1,
    bank_account_id: 1,
    ...overrides,
  };
}

export function buildFutureAllocation(
  overrides?: Partial<FutureAllocationData>,
): FutureAllocationData {
  return {
    id: 1,
    name: 'Groceries',
    amount: 50000,
    budget_id: 1,
    allocation_category_id: 1,
    is_fixed_amount: true,
    ...overrides,
  };
}

export function buildFutureBudget(overrides?: Partial<FutureBudgetData>): FutureBudgetData {
  return {
    id: 1,
    name: 'Mar 25 - Apr 24, 2026',
    start_date: '2026-03-25',
    end_date: '2026-04-24',
    status: 'open',
    incomes: [buildFutureIncome()],
    allocations: [buildFutureAllocation()],
    ...overrides,
  };
}
