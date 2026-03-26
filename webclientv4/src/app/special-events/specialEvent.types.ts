import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';
import type { BudgetData } from '../budgets/budget.types';

export interface SpecialEventAllocationData {
  id?: number;
  name?: string;
  amount?: number;
  budget_id?: number;
  spent?: number;
  allocation_category_id?: number;
  budget_name?: string;
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
