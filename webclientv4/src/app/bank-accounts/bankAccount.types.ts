import type { InstitutionData } from '../institutions/institution.types';

export type { InstitutionData };

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
  current_balance?: number;
  allow_default_allocations?: boolean;
  is_sink_fund?: boolean;
  is_credit_card?: boolean;
  import_format?: string;
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
  institution?: InstitutionData;
}

export interface AccountTransferData {
  from: number;
  to: number;
  amount: number;
  date: string;
  description?: string;
  from_allocation?: number;
  to_allocation?: number;
  from_sink_fund_allocation?: number;
  to_sink_fund_allocation?: number;
  budget_id?: number;
}

/**
 * Internal form representation used by BankAccountEditDialog.
 * All fields are non-optional so form bindings are unambiguous.
 * statement_day and payment_due_day are strings because EcTextField
 * binds to string; toBankAccountData converts them back to numbers.
 */
export interface BankAccountFormData {
  id?: number;
  name: string;
  account_type?: string;
  account_type_description: string;
  account_category?: string;
  is_cash?: boolean;
  institution_id?: number;
  account_no: string;
  opening_balance: number;
  import_format?: string;
  status?: string;
  statement_day: string;
  payment_due_day: string;
}
