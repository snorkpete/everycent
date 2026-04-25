export type BudgetRole = 'spending' | 'annual_spending' | 'transfer' | 'savings' | 'event';

export const BUDGET_ROLES: BudgetRole[] = [
  'spending',
  'annual_spending',
  'transfer',
  'savings',
  'event',
];

export const BUDGET_ROLE_LABELS: Record<BudgetRole, string> = {
  spending: 'Spending',
  annual_spending: 'Annual Spending',
  transfer: 'Transfer',
  savings: 'Savings',
  event: 'Event',
};

export interface AllocationCategoryData {
  id?: number;
  name?: string;
  percentage?: number;
  budget_role?: BudgetRole;
}
