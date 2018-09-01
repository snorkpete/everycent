export interface BankAccountAdjustmentData {
  bank_account_id: number;
  new_balance: number;
  currentBalance?: number;
}

export interface BankAccountAdjustmentsParams {
  adjustments: BankAccountAdjustmentData[];
}
