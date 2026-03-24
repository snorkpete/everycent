import type { TransactionData } from '../transactions/transaction.types';

export interface ImportTransaction extends TransactionData {
  import_status?: 'new' | 'duplicate' | 'out_of_period';
}

export interface PreviewBankAccount {
  bank_account_id: number;
  current_balance: number;
  net: number;
  projected_balance: number;
  transactions: ImportTransaction[];
}

export interface PreviewResponse {
  bank_accounts: PreviewBankAccount[];
}

export interface UnmatchedIban {
  iban: string;
  transactionCount: number;
}

export interface SkippedTransaction {
  bank_ref: string;
  reason: 'duplicate' | 'out_of_period' | 'invalid_date' | 'user_excluded';
}

export interface SaveBankAccount {
  bank_account_id: number;
  current_balance: number;
  net: number;
  projected_balance: number;
  transactions: TransactionData[];
  skipped: SkippedTransaction[];
}

export interface SaveResponse {
  bank_accounts: SaveBankAccount[];
}
