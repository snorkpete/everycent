---
type: table
title: settings
term: settings
definition: "Household-level config singleton: primary budget account, family type, person names, default categories."
lexicon: true
description: >-
  A per-household singleton config row, accessed as a class-level key-value store.
  Holds the primary budget account, household composition (names + family_type),
  and the special-events category default.
resource: everycent:table:settings
tags: [table, config, singleton, household]
timestamp: 2026-06-17T00:00:00Z
---

# settings

A **singleton config row per household**. The `Setting` model exposes everything
through **class methods** (`Setting.primary_budget_account_id`, `Setting.husband`,
…) that route through `get_setting_record` = `Setting.first` (created if missing),
resolved within the tenant scope like everything else in the system. There is no
per-user settings notion — one row per household.

## Schema

| Column | Meaning |
|---|---|
| `id` | Primary key. |
| `primary_budget_account_id` | **Live.** The main (sole) budgeting account. A controller loads settings on every page into a Vue store any page can read; the transaction screen auto-selects this account by default on load. |
| `husband` / `wife` | Display labels for the two people in a `couple` household (defaults "Husband"/"Wife"). Served by `as_hash` only when not single. |
| `single_person` | Display label for the one person in a `single` household. Served only when single. |
| `family_type` | `couple` / `single`. Drives the discretionary-split toggle (see below) and which name fields apply. |
| `default_allocation_category_id_for_special_events` | **Live.** Pre-selected category in the special-events allocation filter — a UI convenience. See [special_events](/tables/special_events.md). |
| `bank_charges_allocation_name` | **DEAD (D10)** — Trinidad-era: auto-categorizing repetitive bank-charge transactions by matching description; possibly never fully implemented. Not referenced in the model or `as_hash`. |
| `household_id` | Tenant scope. |
| `created_at` / `updated_at` | Timestamps. |

## as_hash (what the frontend receives)

`as_hash` is **family_type-conditional**:
- **single** → `primary_budget_account_id`, `family_type`, `single_person`, `default_allocation_category_id_for_special_events`.
- **couple** → `primary_budget_account_id`, `husband`, `wife`, `family_type`, `default_allocation_category_id_for_special_events`.

It omits `bank_charges_allocation_name` entirely (reinforcing D10).

## Ties to discretionary money

`family_type` + the name fields are the **labels and toggle** behind the
discretionary 50/50 split: `family_type` decides *whether* to split (couple →
between the two people; single → no split), and the names label each
person's personal-money transfer. All **household-specific / display tier**, not
accounting logic. See [discretionary money & the budget gap](/concepts/discretionary-money.md).
