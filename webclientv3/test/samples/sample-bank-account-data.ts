import {BankAccountData} from "../../src/app/bank-accounts/bank-account.model";

let SampleBankAccountData: BankAccountData = {
  id: 1,
  name: "Joint Account",
  account_type: "normal",
  account_type_description: "Joint Checking Account",
  account_category: "current",
  is_cash: true,
  account_no: "515",
  user_id: 1,
  institution_id: 1,
  opening_balance: 0,
  closing_balance: 43672,
  allow_default_allocations: false,
  is_sink_fund: false,
  is_credit_card: false,
  status: "open",
  statement_day: null,
  payment_due_day: null,
  current_period_statement_start: null,
  current_period_statement_end: null,
  previous_period_starting_balance: 0,
  previous_period_statement_start: null,
  previous_period_statement_end: null,
  current_period_payment_due: null,
  previous_period_payment_due: null,
};

export {SampleBankAccountData};
