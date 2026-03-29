import type { BudgetData, BudgetDetailData, IncomeData } from '../../app/budgets/budget.types';

export function buildBudget(overrides?: Partial<BudgetData>): BudgetData {
  return {
    id: 1,
    name: 'Mar 25 - Apr 24, 2026',
    start_date: '2026-03-25',
    end_date: '2026-04-24',
    status: 'open',
    ...overrides,
  };
}

export function buildClosedBudget(overrides?: Partial<BudgetData>): BudgetData {
  return buildBudget({
    id: 2,
    name: 'Feb 25 - Mar 24, 2026',
    start_date: '2026-02-25',
    end_date: '2026-03-24',
    status: 'closed',
    ...overrides,
  });
}

export function buildIncome(overrides?: Partial<IncomeData>): IncomeData {
  return {
    id: 1,
    name: 'Salary',
    amount: 500000,
    budget_id: 1,
    bank_account_id: 1,
    comment: '',
    deleted: false,
    ...overrides,
  };
}

export function buildBudgetDetail(overrides?: Partial<BudgetDetailData>): BudgetDetailData {
  return {
    id: 1,
    name: 'Mar 25 - Apr 24, 2026',
    start_date: '2026-03-25',
    end_date: '2026-04-24',
    status: 'open',
    incomes: [buildIncome()],
    allocations: [],
    ...overrides,
  };
}
