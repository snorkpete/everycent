import { BankAccountData } from "../bank-accounts/bank-account.model";

export interface AllocationCategoryData {
  id?: number;
  name?: string;
  percentage?: number;
  allocations?: AllocationData[];
}

export interface AllocationData {
  id?: number;
  name?: string;
  amount?: number;
  budget_id?: number;
  spent?: number;
  allocation_category_id?: number;
  allocation_category?: AllocationCategoryData;
  is_standing_order?: boolean;
  bank_account_id?: number;
  bank_account?: BankAccountData;
  comment?: string;
  allocation_class?: string;
  is_fixed_amount?: boolean;
  budget_name?: string;
  allocation_category_name?: string;

  allocations?: AllocationData[];

  // extra properties used for displaying the allocations in the budget
  firstInCategory?: boolean;
  lastInCategory?: boolean;
  allocationCategory?: string;
  dummyTransaction?: boolean;

  // new extra properties used to display the allocations
  isCategoryHeaderRow?: boolean;
  isAllocationButtonRow?: boolean;
}
