import { UserData } from "./user.model";
import { InstitutionData } from "./institution.model";

export interface BankAccountData {
  id?: number;
  name?: string;
  account_type?: string;
  account_type_description?: string;
  account_category?: string;
  is_cash?: boolean;
  account_no?: string;
  user_id?: number;
  institution_id?: number;
  opening_balance?: number;
  closing_balance?: number;
  allow_default_allocations?: boolean;
  is_sink_fund?: boolean;
  is_credit_card?: boolean;
  status?: string;
  statement_day?: number;
  payment_due_day?: number;
  statement_day_ordinal?: number;
  payment_due_day_ordinal?: number;
  current_period_statement_start?: string;
  current_period_statement_end?: string;
  previous_period_starting_balance?: number;
  previous_period_statement_start?: string;
  previous_period_statement_end?: string;
  current_period_payment_due?: number;
  previous_period_payment_due?: number;
  user?: UserData;
  institution?: InstitutionData;
}
