export interface SettingsData {
  primary_budget_account_id?: number;
  bank_charges_allocation_name?: string;
  family_type: "single" | "couple";
  husband?: string;
  wife?: string;
  single_person?: string;
}
