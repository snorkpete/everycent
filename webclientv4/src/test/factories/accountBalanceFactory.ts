import type {
  AccountBalanceData,
  BalanceAdjustmentData,
} from '../../app/account-balances/accountBalance.types';

export function buildAccountBalance(overrides?: Partial<AccountBalanceData>): AccountBalanceData {
  return {
    id: 1,
    name: 'Checking',
    account_type: 'checking',
    account_category: 'Asset',
    is_cash: false,
    closing_date: '2026-03-31',
    next_closing_date: '2026-04-30',
    closing_balance: 100000,
    expected_closing_balance: 95000,
    current_balance: 100000,
    asset_bank_account_id: null,
    ...overrides,
  };
}

export function buildBalanceAdjustment(
  overrides?: Partial<BalanceAdjustmentData>,
): BalanceAdjustmentData {
  return {
    bank_account_id: 1,
    new_balance: 100000,
    currentBalance: 95000,
    ...overrides,
  };
}
