import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';
import type { TransactionsDialogAllocation } from '../shared/allocationTransactions.types';
import type { BudgetData } from '../budgets/budget.types';

export interface SpecialEventAllocationData {
  id?: number;
  name?: string;
  amount?: number;
  budget_id?: number;
  spent?: number;
  allocation_category_id?: number;
  budget_name?: string;
  budget_start_date?: string;
  allocation_category_name?: string;
  allocation_category?: AllocationCategoryData;
  budget?: BudgetData;
}

export interface SpecialEventData {
  id?: number;
  name?: string;
  budget_amount?: number;
  actual_amount?: number;
  start_date?: string;
  allocations?: SpecialEventAllocationData[];
}

export interface UpdateAllocationsPayload {
  allocation_ids: number[];
  actual_amount: number;
}

export interface SpecialEventFormData {
  name: string;
  budget_amount: number;
  start_date: string;
}

export interface SpecialEventAllocationRow {
  /** Composite of the allocation ids (e.g. "2-3"); stable key for v-for / DataTable dataKey. */
  key: string;
  ids: number[];
  name: string;
  /** Budget names joined oldest first; the full list for a merged row. */
  budget_name: string;
  allocation_category_name: string;
  amount: number;
  spent: number;
  /** One entry per underlying allocation, oldest budget first, for the transactions dialog. */
  dialogAllocations: TransactionsDialogAllocation[];
}
