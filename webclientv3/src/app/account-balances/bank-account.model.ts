
export interface BankAccountData {
  id?: number,
  name?: string,
  start_date?: string,
  institution?: any,
  account_type?: string,
  account_category?: string,
  closing_balance?: number,
  expected_closing_balance?: number,
  current_balance?: number,
  closing_date?: Date,
  next_closing_date?: Date,
  is_cash?: boolean
}

