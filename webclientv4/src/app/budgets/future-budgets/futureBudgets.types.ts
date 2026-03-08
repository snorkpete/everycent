export interface FutureIncomeData {
  id: number;
  name: string;
  amount: number;
  budget_id: number;
  bank_account_id: number;
  comment?: string;
}

export interface FutureAllocationData {
  id: number;
  name: string;
  amount: number;
  budget_id: number;
  allocation_category_id: number;
  allocation_type?: string;
  is_standing_order?: boolean;
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
}

export interface MassUpdateAmountEntry {
  id: number;
  amount: number;
  budget_id: number;
}

export interface MassUpdatePayload {
  type: 'income' | 'allocation';
  name: string;
  amounts: MassUpdateAmountEntry[];
  bank_account_id?: number;
  allocation_category_id?: number;
}
