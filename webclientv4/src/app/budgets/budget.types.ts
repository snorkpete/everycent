import type { AllocationData } from '../transactions/transaction.types';

export interface BudgetData {
  id?: number;
  name?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

export interface IncomeData {
  id?: number;
  name?: string;
  amount?: number;
  budget_id?: number;
  bank_account_id?: number;
  comment?: string;
  deleted?: boolean;
}

export interface BudgetDetailData extends BudgetData {
  incomes: IncomeData[];
  allocations: AllocationData[];
}
