import type { TransactionData } from '../../app/transactions/transaction.types';

export function buildTransaction(overrides?: Partial<TransactionData>): TransactionData {
  return {
    id: 1,
    description: 'Groceries',
    bank_account_id: 1,
    transaction_date: '2026-01-15',
    withdrawal_amount: 5000,
    deposit_amount: 0,
    status: 'paid',
    deleted: false,
    ...overrides,
  };
}

export function buildDeposit(overrides?: Partial<TransactionData>): TransactionData {
  return buildTransaction({
    id: 2,
    description: 'Salary',
    withdrawal_amount: 0,
    deposit_amount: 300000,
    ...overrides,
  });
}

export function buildUnpaidTransaction(overrides?: Partial<TransactionData>): TransactionData {
  return buildTransaction({
    id: 3,
    description: 'Pending payment',
    status: 'unpaid',
    ...overrides,
  });
}
