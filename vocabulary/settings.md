# Settings

## Definition

Household-level configuration singleton. Stores the primary budget account, family type (couple/single), person names, and default categories.

## Context

One settings record per household, accessed via a singleton pattern (`get_setting_record`). Contains both system configuration (which account is primary, default category for special events) and household profile information (family structure, names).

## Contract

- Exactly one record per household.
- Key fields: `primary_budget_account_id`, `family_type` (couple/single), `husband`/`wife`/`single_person` names, `bank_charges_allocation_name`, `default_allocation_category_id_for_special_events`.
