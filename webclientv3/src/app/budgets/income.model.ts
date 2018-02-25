import {BankAccountData} from "../bank-accounts/bank-account.model";
import {BudgetData} from "./budget.model";

export interface IncomeData {
  id?: number;
  name?: string;
  amount?: number;
  budget_id?: number;
  budget?: BudgetData;
  bank_account_id?: number;
  bankAccount?: BankAccountData;
  comment?: string;
  deleted?: boolean;
}
;
