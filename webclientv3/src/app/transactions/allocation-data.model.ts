import {BankAccountData} from "../bank-accounts/bank-account.model";
import {AllocationCategoryData} from "./allocation-category-data.model";

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
