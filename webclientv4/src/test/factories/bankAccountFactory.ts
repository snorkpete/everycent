import type {
  BankAccountData,
  AccountTransferData,
} from '../../app/bank-accounts/bankAccount.types';

export function buildBankAccount(overrides?: Partial<BankAccountData>): BankAccountData {
  return {
    id: 1,
    name: 'Checking',
    account_type: 'checking',
    account_category: 'Asset',
    is_cash: false,
    opening_balance: 0,
    closing_balance: 0,
    current_balance: 100000,
    is_sink_fund: false,
    is_credit_card: false,
    status: 'open',
    ...overrides,
  };
}

export function buildCreditCard(overrides?: Partial<BankAccountData>): BankAccountData {
  return buildBankAccount({
    id: 2,
    name: 'Visa',
    account_type: 'credit_card',
    account_category: 'Liability',
    is_credit_card: true,
    current_balance: -50000,
    ...overrides,
  });
}

export function buildSinkFundAccount(overrides?: Partial<BankAccountData>): BankAccountData {
  return buildBankAccount({
    id: 3,
    name: 'Emergency Fund',
    account_type: 'savings',
    account_category: 'Asset',
    is_sink_fund: true,
    current_balance: 50000,
    ...overrides,
  });
}

export function buildAccountTransfer(
  overrides?: Partial<AccountTransferData>,
): AccountTransferData {
  return {
    from: 1,
    to: 2,
    amount: 10000,
    date: '2026-01-15',
    ...overrides,
  };
}
