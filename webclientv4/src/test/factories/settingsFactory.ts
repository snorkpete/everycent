import type { SettingsData } from '../../app/settings/settings.types';

export function buildSettings(overrides?: Partial<SettingsData>): SettingsData {
  return {
    primary_budget_account_id: 1,
    bank_charges_allocation_name: 'Bank Charges',
    family_type: 'couple',
    husband: 'Partner 1',
    wife: 'Partner 2',
    single_person: undefined,
    default_allocation_category_id_for_special_events: undefined,
    ...overrides,
  };
}
