import type { TransactionData } from '../transactions/transaction.types';

export interface TransactionsDialogAllocation {
  id: number;
  name: string;
  label?: string;
}

/** One block of transactions in the dialog; single mode yields exactly one. */
export interface AllocationTransactionSection {
  allocation: TransactionsDialogAllocation;
  transactions: TransactionData[];
}
