import {All} from "tslint/lib/rules/completedDocsRule";
import {BankAccountData} from "../bank-accounts/bank-account.model";

export interface AllocationCategoryData {
  id?: number;
  name?: string;
  percentage?: number;
}

export interface AllocationData {
  id?: number,
  name?: string,
  amount?: number;
  budget_id?: number;
  spent?: number;
  allocation_category_id?: number;
  allocation_category?: AllocationCategoryData;
  is_standing_order?: boolean;
  bank_account_id?: number;
  bank_account?: BankAccountData;
  comment?: string;
}

