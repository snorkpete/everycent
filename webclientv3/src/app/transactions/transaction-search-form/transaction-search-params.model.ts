import {BudgetData} from "../../budgets/budget.model";
import {BankAccountData} from "../../bank-accounts/bank-account.model";

export interface TransactionSearchParams {
  budget_id?: number;
  budget?: BudgetData;
  bank_account_id?: number;
  bankAccount?: BankAccountData;
}
