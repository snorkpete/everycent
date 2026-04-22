import type { BankAccountData } from '../bank-accounts/bankAccount.types';
import type { AllocationCategoryData } from '../allocation-categories/allocationCategory.types';
import type { MatchType } from '../budgets/autoAllocate.types';
import type { SinkFundAllocationData } from '../sink-funds/sinkFund.types';
export type { BudgetData } from '../budgets/budget.types';
export type { SinkFundAllocationData } from '../sink-funds/sinkFund.types';

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
  // SpecialEventAllocationSerializer only — not present in AllocationSerializer
  budget_name?: string;
  allocation_category_name?: string;
  allocation_class?: string;
  is_fixed_amount?: boolean;
  deleted?: boolean;
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
  paid?: boolean;
  net_amount?: number;
  brought_forward_status?: string;
  allocation?: AllocationData;
  sink_fund_allocation?: SinkFundAllocationData;
  bank_account?: BankAccountData;
  deleted?: boolean;
  newlyImported?: boolean;
  camt_imported?: boolean;
  auto_match_type?: MatchType;
}
