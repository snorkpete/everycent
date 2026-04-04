export interface AccountBalanceData {
  id: number;
  name: string;
  account_type: string;
  account_category: string;
  is_cash: boolean;
  closing_date: string;
  next_closing_date: string;
  closing_balance: number;
  expected_closing_balance: number;
  current_balance: number;
  asset_bank_account_id: number | null;
  institution?: { id: number; name: string };
  loans?: AccountBalanceData[];
}

export interface BalanceAdjustmentData {
  bank_account_id: number;
  new_balance: number;
  currentBalance: number; // client-only — used to filter unchanged before posting
}

export interface BalanceAdjustmentsParams {
  adjustments: BalanceAdjustmentData[];
}
