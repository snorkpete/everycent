export interface FutureIncomeData {
  id: number;
  name: string;
  amount: number;
  budget_id: number;
  bank_account_id: number;
  comment?: string;
}

// Intentionally omits `spent` and `allocation_class` from AllocationData — future budgets don't carry actuals
export interface FutureAllocationData {
  id: number;
  name: string;
  amount: number;
  budget_id: number;
  allocation_category_id: number;
  allocation_type?: string;
  is_standing_order?: boolean;
  is_fixed_amount?: boolean;
  bank_account_id?: number;
  comment?: string;
}

export interface FutureBudgetData {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  incomes: FutureIncomeData[];
  allocations: FutureAllocationData[];
}

export interface AmountRow {
  id: number;
  amount: number;
  budget_id: number;
  budgetIncome: number;
  totalAllocationsWithoutCurrent: number;
  is_fixed_amount?: boolean;
}

export interface MassUpdateAmountEntry {
  id: number;
  amount: number;
  budget_id: number;
  is_fixed_amount?: boolean;
}

export interface MassUpdatePayload {
  type: 'income' | 'allocation';
  name: string;
  amounts: MassUpdateAmountEntry[];
  bank_account_id?: number;
  allocation_category_id?: number;
}
