import type { BankAccountData } from '../bank-accounts/bankAccount.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';
export type { BudgetData } from '../budgets/budget.types';

export interface AllocationData {
  id?: number;
  name?: string;
  amount?: number;
  budget_id?: number;
  spent?: number;
  allocation_category_id?: number;
  allocation_type?: string;
  is_standing_order?: boolean;
  bank_account_id?: number;
  comment?: string;
  allocation_category?: AllocationCategoryData;
  bank_account?: BankAccountData;
  special_event_id?: number;
  budget_name?: string;
  allocation_category_name?: string;
}

export interface SinkFundAllocationData {
  id?: number;
  name?: string;
  amount?: number;
  bank_account_id?: number;
  comment?: string;
  spent?: number;
  remaining?: number;
  status?: string;
  target?: number;
  current_balance?: number;
  difference?: number;
  deleted?: boolean;
  unsaved?: boolean;
}

export interface TransactionData {
  selected?: boolean;
  id?: number;
  description?: string;
  bank_ref?: string;
  bank_account_id?: number;
  transaction_date?: string;
  withdrawal_amount?: number;
  deposit_amount?: number;
  allocation_id?: number;
  sink_fund_allocation_id?: number;
  status?: string;
  net_amount?: number;
  brought_forward_status?: string;
  allocation?: AllocationData;
  sink_fund_allocation?: SinkFundAllocationData;
  bank_account?: BankAccountData;
  deleted?: boolean;
}

