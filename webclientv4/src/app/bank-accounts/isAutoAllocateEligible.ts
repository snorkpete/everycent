import { useSettingsStore } from '../settings/settingsStore';
import type { BankAccountData } from './bankAccount.types';

/**
 * Returns true if a bank account is eligible for auto-allocation.
 * A bank account is eligible if it is a credit card OR the primary budget account.
 */
export function isAutoAllocateEligible(account: BankAccountData | null): boolean {
  if (!account) return false;
  if (account.is_credit_card) return true;
  const settingsStore = useSettingsStore();
  return account.id === settingsStore.settings.primary_budget_account_id;
}
