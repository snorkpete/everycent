import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { isAutoAllocateEligible } from './isAutoAllocateEligible';
import { useSettingsStore } from '../settings/settingsStore';
import type { BankAccountData } from './bankAccount.types';

describe('isAutoAllocateEligible', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('returns false when account is null', () => {
    expect(isAutoAllocateEligible(null)).toBe(false);
  });

  it('returns true when account is a credit card', () => {
    const account: BankAccountData = { id: 1, is_credit_card: true };
    expect(isAutoAllocateEligible(account)).toBe(true);
  });

  it('returns true when account is the primary budget account', () => {
    const settingsStore = useSettingsStore();
    settingsStore.settings = { primary_budget_account_id: 5 };

    const account: BankAccountData = { id: 5, is_credit_card: false };
    expect(isAutoAllocateEligible(account)).toBe(true);
  });

  it('returns false when account is neither credit card nor primary budget account', () => {
    const settingsStore = useSettingsStore();
    settingsStore.settings = { primary_budget_account_id: 5 };

    const account: BankAccountData = { id: 99, is_credit_card: false };
    expect(isAutoAllocateEligible(account)).toBe(false);
  });
});
